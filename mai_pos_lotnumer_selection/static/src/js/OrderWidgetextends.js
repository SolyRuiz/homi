odoo.define('mai_pos_lotnumer_selection.OrderWidgetextends', function(require) {
    'use strict';

    const OrderWidget = require('point_of_sale.OrderWidget');
    const Registries = require('point_of_sale.Registries');

    const OrderWidgetextends = OrderWidget =>
        class extends OrderWidget {
            async _editPackLotLines(event) {
                const orderline = event.detail.orderline;
                const isAllowOnlyOneLot = orderline.product.isAllowOnlyOneLot();
                const packLotLinesToEdit = orderline.getPackLotLinesToEdit(isAllowOnlyOneLot);
                const { confirmed, payload } = await this.showPopup('EditListPopup1', {
                    title: this.env._t('Número(s) de lote/serie requerido(s)'),
                    isSingleItem: isAllowOnlyOneLot,
                    array: packLotLinesToEdit,
                    product: orderline.product
                });
                if(!this.env.pos.config.allow_expiry_warning && !this.env.pos.config.restrict_creating_lot){
                    var lots = this.env.pos.list_lot_num;
                    let self = this;
                    let is_exist = [];
                    let not_exist = [];
                    let lots1 = [];
                    if (confirmed) {
                        if(this.env.pos.config.allow_expiry_warning && this.env.pos.config.restrict_creating_lot){
                            if(orderline.product.tracking == 'serial'){
                                var is_exist_1 = $.grep(lots, function(v) {
                                    if (v.product_id[0] == orderline.product.id){
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
                                    if (line.product_id[0] == orderline.product.id){
                                        lots1.push(line.name)
                                    }
                                });
                                _.each(payload.newArray, function(array){
                                    if(!lots1.includes(array.text)){
                                        not_exist.push(array)
                                    }
                                });
                                if(is_exist.length != 0 || not_exist.length != 0 ){
                                    self.showPopup('WarningMessagePopup', {
                                        title: self.env._t('Número(s) de serie no válido(s) o caducado(s)'),
                                        expiry_lot: is_exist,
                                        message: not_exist
                                    });
                                }else{
                                    // Segregate the old and new packlot lines
                                    const modifiedPackLotLines = Object.fromEntries(
                                        payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                    );
                                    const newPackLotLines = payload.newArray
                                        .filter(item => !item.id)
                                        .map(item => ({ lot_name: item.text }));

                                    orderline.setPackLotLines({ modifiedPackLotLines, newPackLotLines });
                                }
                            }
                            if(orderline.product.tracking == 'lot'){
                                if(payload.newArray[0]){
                                    var is_exist_val = $.grep(lots, function(v) {
                                        if (v.product_id[0] == orderline.product.id){
                                            return v.name == payload.newArray[0].text;
                                        }
                                    });
                                    if(is_exist_val.length != 0){
                                        let today = new Date();
                                        let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                        let alert_date = moment(is_exist_val[0].alert_date).format('YYYY-MM-DD hh:mm:ss')
                                        if(alert_date){
                                            if ( current_date >= alert_date){
                                                let body = 'Fecha de Vencimiento: '+ alert_date;
                                                this.showPopup('ErrorPopup', {
                                                    title: this.env._t('Número(s) de lote/serial(es) caducado(s)'),
                                                    body: this.env._t(body),
                                                });
                                            }else{
                                                // Segregate the old and new packlot lines
                                                const modifiedPackLotLines = Object.fromEntries(
                                                    payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                                );
                                                const newPackLotLines = payload.newArray
                                                    .filter(item => !item.id)
                                                    .map(item => ({ lot_name: item.text }));

                                                orderline.setPackLotLines({ modifiedPackLotLines, newPackLotLines });
                                            }
                                        }
                                    }else{
                                        this.showPopup('ErrorPopup', {
                                            title: this.env._t('Número(s) de lote/serie no coincidente(s)'),
                                            body: this.env._t(' El número de lote/serie introducido no existe, por favor inténtelo con uno diferente/existente.'),
                                        });
                                    }
                                }
                            }
                        }else if(this.env.pos.config.allow_expiry_warning && !this.env.pos.config.restrict_creating_lot){
                            if(orderline.product.tracking == 'serial'){
                                // Segregate the old and new packlot lines
                                const modifiedPackLotLines = Object.fromEntries(
                                    payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                );
                                const newPackLotLines = payload.newArray
                                    .filter(item => !item.id)
                                    .map(item => ({ lot_name: item.text }));

                                orderline.setPackLotLines({ modifiedPackLotLines, newPackLotLines });
                                var is_exist_1 = $.grep(lots, function(v) {
                                    if (v.product_id[0] == orderline.product.id){
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
                                    if (line.product_id[0] == orderline.product.id){
                                        lots1.push(line.name)
                                    }
                                });
                                _.each(payload.newArray, function(array){
                                    if(!lots1.includes(array.text)){
                                        not_exist.push(array)
                                    }
                                });

                                if(is_exist.length != 0 || not_exist.length != 0 ){
                                    self.showPopup('WarningMessagePopup', {
                                        title: self.env._t('Número(s) de serie no válido(s) o caducado(s)'),
                                        expiry_lot: is_exist,
                                        message: not_exist
                                    });
                                }
                            }
                            if(orderline.product.tracking == 'lot'){
                                if(payload.newArray[0]){
                                    // Segregate the old and new packlot lines
                                    const modifiedPackLotLines = Object.fromEntries(
                                        payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
                                    );
                                    const newPackLotLines = payload.newArray
                                        .filter(item => !item.id)
                                        .map(item => ({ lot_name: item.text }));

                                    orderline.setPackLotLines({ modifiedPackLotLines, newPackLotLines });
                                    var is_exist_data = $.grep(lots, function(v) {
                                        if (v.product_id[0] == orderline.product.id){
                                            return v.name == payload.newArray[0].text;
                                        }
                                    });
                                    if(is_exist_data.length != 0){
                                        let today = new Date();
                                        let current_date = moment(today).format('YYYY-MM-DD hh:mm:ss')
                                        let alert_date = moment(is_exist_data[0].alert_date).format('YYYY-MM-DD hh:mm:ss')
                                        if(alert_date){
                                            if ( current_date >= alert_date){
                                                let body = 'Fecha de Vencimiento: '+ alert_date;
                                                this.showPopup('ErrorPopup', {
                                                    title: this.env._t('Número(s) de lote/serial(es) caducado(s)'),
                                                    body: this.env._t(body),
                                                });
                                            }
                                        }
                                    }else{
                                        this.showPopup('ErrorPopup', {
                                            title: this.env._t('Número(s) de lote/serie no coincidente(s)'),
                                            body: this.env._t(' El número de lote/serie introducido no existe, por favor inténtelo con uno diferente/existente.'),
                                        });
                                    }
                                }
                            }
                        }else if(!this.env.pos.config.allow_expiry_warning && this.env.pos.config.restrict_creating_lot){
                            if(orderline.product.tracking == 'serial'){
                                var is_exist_1 = $.grep(lots, function(v) {
                                    if (v.product_id[0] == orderline.product.id){
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

                                            orderline.setPackLotLines({ modifiedPackLotLines, newPackLotLines });
                                        }
                                    })
                                }else{}
                            }
                            if(orderline.product.tracking == 'lot'){
                                if(payload.newArray[0]){
                                    var is_exist_data = $.grep(lots, function(v) {
                                        if (v.product_id[0] == orderline.product.id){
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

                                        orderline.setPackLotLines({ modifiedPackLotLines, newPackLotLines });
                                    }else{}
                                }
                            }
                        }
                    }
                    this.order.select_orderline(event.detail.orderline);
                }
            }
        };

    Registries.Component.extend(OrderWidget, OrderWidgetextends);

    return OrderWidget;
});
