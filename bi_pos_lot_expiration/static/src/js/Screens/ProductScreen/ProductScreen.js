odoo.define('bi_pos_lot_expiration.ProductScreen', function(require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');
    const { useListener } = require('web.custom_hooks');
    const NumberBuffer = require('point_of_sale.NumberBuffer');

    const BiProductScreen = ProductScreen =>
        class extends ProductScreen {

        async _clickProduct(event) {
            if(!this.env.pos.config.allow_expiry_warning && !this.env.pos.config.restrict_creating_lot){
                super._clickProduct(event);
            }else{
                if (!this.currentOrder) {
                    this.env.pos.add_new_order();
                }
                const product = event.detail;
                const options = await this._getAddProductOptions(product);
                if(product.tracking == "serial"){
                    if(options.draftPackLotLines != undefined){
                        // Do not add product if options is undefined.
                        if (!options) return;
                        // Add the product after having the extra information.
                        this.currentOrder.add_product(product, options);
                        NumberBuffer.reset();
                    }
                }else if(product.tracking == "lot"){
                    if(options.draftPackLotLines != undefined){
                        // Do not add product if options is undefined.
                        if (!options) return;
                        // Add the product after having the extra information.
                        this.currentOrder.add_product(product, options);
                        NumberBuffer.reset();
                    }
                }else{
                    super._clickProduct(event);
                }
            }
        }

        async _getAddProductOptions(product) {

            if(!this.env.pos.config.allow_expiry_warning && !this.env.pos.config.restrict_creating_lot){
                let price_extra = 0.0;
                let draftPackLotLines, weight, description, packLotLinesToEdit;
                if (this.env.pos.config.product_configurator && _.some(product.attribute_line_ids, (id) => id in this.env.pos.attributes_by_ptal_id)) {
                    let attributes = _.map(product.attribute_line_ids, (id) => this.env.pos.attributes_by_ptal_id[id])
                                      .filter((attr) => attr !== undefined);
                    let { confirmed, payload } = await this.showPopup('ProductConfiguratorPopup', {
                        product: product,
                        attributes: attributes,
                    });

                    if (confirmed) {
                        description = payload.selected_attributes.join(', ');
                        price_extra += payload.price_extra;
                    } else {
                        return;
                    }
                }

                // Gather lot information if required.
                if (['serial', 'lot'].includes(product.tracking) && (this.env.pos.picking_type.use_create_lots || this.env.pos.picking_type.use_existing_lots)) {
                    const isAllowOnlyOneLot = product.isAllowOnlyOneLot();
                    if (isAllowOnlyOneLot) {
                        packLotLinesToEdit = [];
                    } else {
                        const orderline = this.currentOrder
                            .get_orderlines()
                            .filter(line => !line.get_discount())
                            .find(line => line.product.id === product.id);
                        if (orderline) {
                            packLotLinesToEdit = orderline.getPackLotLinesToEdit();
                        } else {
                            packLotLinesToEdit = [];
                        }
                    }
                    const { confirmed, payload } = await this.showPopup('EditListPopup', {
                        title: this.env._t('Número(s) de lote/serie requerido(s)'),
                        isSingleItem: isAllowOnlyOneLot,
                        array: packLotLinesToEdit,
                    });
                    if (confirmed) {
                        // Segregate the old and new packlot lines
                        const modifiedPackLotLines = Object.fromEntries(
                            payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                        );
                        const newPackLotLines = payload.newArray
                            .filter(item => !item.id)
                            .map(item => ({ lot_name: item.text }));

                        draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
                    } else {
                        // We don't proceed on adding product.
                        return;
                    }
                }

                // Take the weight if necessary.
                if (product.to_weight && this.env.pos.config.iface_electronic_scale) {
                    // Show the ScaleScreen to weigh the product.
                    if (this.isScaleAvailable) {
                        const { confirmed, payload } = await this.showTempScreen('ScaleScreen', {
                            product,
                        });
                        if (confirmed) {
                            weight = payload.weight;
                        } else {
                            // do not add the product;
                            return;
                        }
                    } else {
                        await this._onScaleNotAvailable();
                    }
                }

                return { draftPackLotLines, quantity: weight, description, price_extra };
            }
            else{
                let price_extra = 0.0;
                let draftPackLotLines, weight, description, packLotLinesToEdit;
                if (this.env.pos.config.product_configurator && _.some(product.attribute_line_ids, (id) => id in this.env.pos.attributes_by_ptal_id)) {
                    let attributes = _.map(product.attribute_line_ids, (id) => this.env.pos.attributes_by_ptal_id[id])
                                      .filter((attr) => attr !== undefined);
                    let { confirmed, payload } = await this.showPopup('ProductConfiguratorPopup', {
                        product: product,
                        attributes: attributes,
                    });

                    if (confirmed) {
                        description = payload.selected_attributes.join(', ');
                        price_extra += payload.price_extra;
                    } else {
                        return;
                    }
                }

                // Gather lot information if required.
                if (['serial', 'lot'].includes(product.tracking) && (this.env.pos.picking_type.use_create_lots || this.env.pos.picking_type.use_existing_lots)) {
                    const isAllowOnlyOneLot = product.isAllowOnlyOneLot();
                    if (isAllowOnlyOneLot) {
                        packLotLinesToEdit = [];
                    } else {
                        var orderline = this.currentOrder
                            .get_orderlines()
                            .filter(line => !line.get_discount())
                            .find(line => line.product.id === product.id);
                        if (orderline) {
                            packLotLinesToEdit = orderline.getPackLotLinesToEdit();
                        } else {
                            packLotLinesToEdit = [];
                        }
                    }
                    const { confirmed, payload } = await this.showPopup('EditListPopup', {
                        title: this.env._t('Número(s) de lote/serie requerido(s)'),
                        isSingleItem: isAllowOnlyOneLot,
                        array: packLotLinesToEdit,
                    });
                    var lots = this.env.pos.stock_production_lot;
                    let self = this;
                    let is_exist = [];
                    let not_exist = [];
                    let lots1 = [];
                    if (confirmed) {
                        if(this.env.pos.config.allow_expiry_warning && this.env.pos.config.restrict_creating_lot){
                            if(product.tracking == 'serial'){
                                var is_exist_1 = $.grep(lots, function(v) {
                                    if (v.product_id[0] == product.id){
                                        _.each(payload.newArray, function(array){
                                            let today = new Date();
                                            let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                            let alert_date = moment(v.alert_date).format('YYYY-MM-DD hh:mm:ss')
                                             if(v.name == array.text && current_date >= alert_date){
                                                is_exist.push(v)
                                             }
                                        });
                                        return is_exist;
                                    }
                                });

                                $.each(lots, function( i, line ){
                                    if (line.product_id[0] == product.id){
                                        lots1.push(line.name)
                                    }
                                });
                                _.each(payload.newArray, function(array){
                                    if(!lots1.includes(array.text)){
                                        not_exist.push(array)
                                    }
                                });
                                if(is_exist.length != 0 || not_exist.length != 0){
                                    self.showPopup('WarningMessagePopup', {
                                        title: self.env._t('Número(s) de serie no válido(s) o caducado(s)'),
                                        expiry_lot: is_exist,
                                        message: not_exist
                                    });
                                }
                                var valid_number = []
                                var serial_valid = $.grep(lots, function(v) {
                                    if (v.product_id[0] == product.id){
                                        _.each(payload.newArray, function(array){
                                            let today = new Date();
                                             if(v.name == array.text){
                                                valid_number.push(v)
                                             }
                                        });
                                        return valid_number;
                                    }
                                });
                                if(valid_number.length != 0){
                                    _.each(valid_number, function(valid){
                                        let today = new Date();
                                        let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                        let alert_date = moment(valid.alert_date).format('YYYY-MM-DD hh:mm:ss')
                                        if(alert_date >= current_date){
                                            // Segregate the old and new packlot lines
                                            const modifiedPackLotLines = Object.fromEntries(
                                                payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                            );
                                            payload.newArray = payload.newArray.filter(function(item) {
                                                return item.text == valid.name;
                                            });
                                            const newPackLotLines = payload.newArray
                                                .filter(item => !item.id)
                                                .map(item => ({ lot_name: item.text }));
                                            draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
                                        }
                                    })
                                }else{}
                            }
                            if(product.tracking == 'lot'){
                                if(payload.newArray[0]){
                                    var is_exist_val = $.grep(lots, function(v) {
                                        if (v.product_id[0] == product.id){
                                            return v.name == payload.newArray[0].text;
                                        }
                                    });
                                    if(is_exist_val.length != 0){
                                        let today = new Date();
                                        let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                        let alert_date = moment(is_exist_val[0].alert_date).format('YYYY-MM-DD hh:mm:ss')
                                        if(alert_date){
                                            if ( current_date >= alert_date){
                                                this.showPopup('ExpiryDatePopup', {
                                                    title: this.env._t('Número(s) de lote/serial(es) caducado(s)'),
                                                    alert_date: alert_date,
                                                });
                                            }else{
                                                // Segregate the old and new packlot lines
                                                const modifiedPackLotLines = Object.fromEntries(
                                                    payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                                );
                                                const newPackLotLines = payload.newArray
                                                    .filter(item => !item.id)
                                                    .map(item => ({ lot_name: item.text }));

                                                draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
                                            }
                                        }
                                    }else{
                                        this.showPopup('NoLotAvailable', {
                                            title: this.env._t('Número(s) de lote/serie no coincidente(s)'),
                                        });
                                    }
                                }
                            }
                        }else if(this.env.pos.config.allow_expiry_warning && !this.env.pos.config.restrict_creating_lot){
                            if(product.tracking == 'serial'){
                                // Segregate the old and new packlot lines
                                const modifiedPackLotLines = Object.fromEntries(
                                    payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                );
                                const newPackLotLines = payload.newArray
                                    .filter(item => !item.id)
                                    .map(item => ({ lot_name: item.text }));

                                draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
                                var is_exist_1 = $.grep(lots, function(v) {
                                    if (v.product_id[0] == product.id){
                                        _.each(payload.newArray, function(array){
                                            let today = new Date();
                                            let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                            let alert_date = moment(v.alert_date).format('YYYY-MM-DD hh:mm:ss')
                                             if(v.name == array.text && current_date >= alert_date){
                                                is_exist.push(v)
                                             }
                                        });
                                        return is_exist;
                                    }
                                });

                                $.each(lots, function( i, line ){
                                    if (line.product_id[0] == product.id){
                                        lots1.push(line.name)
                                    }
                                });
                                _.each(payload.newArray, function(array){
                                    if(!lots1.includes(array.text)){
                                        not_exist.push(array)
                                    }
                                });

                                if(is_exist.length != 0 || not_exist.length != 0){
                                    self.showPopup('WarningMessagePopup', {
                                        title: self.env._t('Número(s) de serie no válido(s) o caducado(s)'),
                                        expiry_lot: is_exist,
                                        message: not_exist
                                    });
                                }
                            }
                            if(product.tracking == 'lot'){
                                if(payload.newArray[0]){
                                    // Segregate the old and new packlot lines
                                    const modifiedPackLotLines = Object.fromEntries(
                                        payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                    );
                                    const newPackLotLines = payload.newArray
                                        .filter(item => !item.id)
                                        .map(item => ({ lot_name: item.text }));

                                    draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
                                    var is_exist_data = $.grep(lots, function(v) {
                                        if (v.product_id[0] == product.id){
                                            return v.name == payload.newArray[0].text;
                                        }
                                    });
                                    if(is_exist_data.length != 0){
                                        let today = new Date();
                                        let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                        let alert_date = moment(is_exist_data[0].alert_date).format('YYYY-MM-DD hh:mm:ss')
                                        if(alert_date){
                                            if ( current_date >= alert_date){
                                                this.showPopup('ExpiryDatePopup', {
                                                    title: this.env._t('Número(s) de lote/serial(es) caducado(s)'),
                                                    alert_date: alert_date,
                                                });
                                            }
                                        }
                                    }else{
                                        this.showPopup('NoLotAvailable', {
                                            title: this.env._t('Número(s) de lote/serie no coincidente(s)'),
                                        });
                                    }
                                }
                            }
                        }else if(!this.env.pos.config.allow_expiry_warning && this.env.pos.config.restrict_creating_lot){
                            if(product.tracking == 'serial'){
                                var is_exist_1 = $.grep(lots, function(v) {
                                    if (v.product_id[0] == product.id){
                                        _.each(payload.newArray, function(array){
                                            let today = new Date();
                                             if(v.name == array.text){
                                                is_exist.push(v)
                                             }
                                        });
                                        return is_exist;
                                    }
                                });
                                if(is_exist.length != 0){
                                    _.each(is_exist, function(exist){
                                        let today = new Date();
                                        let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                        let alert_date = moment(exist.alert_date).format('YYYY-MM-DD hh:mm:ss')
                                        if(alert_date >= current_date){
                                            // Segregate the old and new packlot lines
                                            const modifiedPackLotLines = Object.fromEntries(
                                                payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                            );
                                            payload.newArray = payload.newArray.filter(function(item) {
                                                return item.text == exist.name;
                                            });
                                            const newPackLotLines = payload.newArray
                                                .filter(item => !item.id)
                                                .map(item => ({ lot_name: item.text }));
                                            draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
                                        }
                                    })
                                }else{}
                            }
                            if(product.tracking == 'lot'){
                                if(payload.newArray[0]){
                                    var is_exist_data = $.grep(lots, function(v) {
                                        if (v.product_id[0] == product.id){
                                            let today = new Date();
                                            let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                            let alert_date = moment(v.alert_date).format('YYYY-MM-DD hh:mm:ss')
                                            return v.name == payload.newArray[0].text && alert_date >= current_date;
                                        }
                                    });
                                    if(is_exist_data.length != 0){
                                        // Segregate the old and new packlot lines
                                        const modifiedPackLotLines = Object.fromEntries(
                                            payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                        );
                                        const newPackLotLines = payload.newArray
                                            .filter(item => !item.id)
                                            .map(item => ({ lot_name: item.text }));

                                        draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
                                    }else{}
                                }
                            }
                       }
                    } else {
                        // We don't proceed on adding product.
                        return true;
                    }
                }

                // Take the weight if necessary.
                if (product.to_weight && this.env.pos.config.iface_electronic_scale) {
                    // Show the ScaleScreen to weigh the product.
                    if (this.isScaleAvailable) {
                        const { confirmed, payload } = await this.showTempScreen('ScaleScreen', {
                            product,
                        });
                        if (confirmed) {
                            weight = payload.weight;
                        } else {
                            // do not add the product;
                            return;
                        }
                    } else {
                        await this._onScaleNotAvailable();
                    }
                }

                return { draftPackLotLines, quantity: weight, description, price_extra };
            }
        }

        async _onClickPay() {
            let self = this;
            let order = this.env.pos.get_order();
            let lines = order.get_orderlines();
            let call_super = true;

            let has_valid_product_lot = _.every(lines, function(line){
                return line.has_valid_product_lot();
            });
            if(!has_valid_product_lot){
                call_super = false;
                self.showPopup('ErrorPopup', {
                    title: self.env._t('Número de serie/lote vacío'),
                    body: self.env._t('Uno o más productos requieren número de serie/lote..'),
                });
                return;
            }

            if(call_super){
                super._onClickPay();
            }
        }
    };

    Registries.Component.extend(ProductScreen, BiProductScreen);

    return ProductScreen;
});
