odoo.define('mai_pos_lotnumer_selection.model', function(require){
    // var screens = require('point_of_sale.screens');
    var core = require('web.core');
    // var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    // var PopupWidget = require('point_of_sale.popups');
    var QWeb = core.qweb;
    const Registries = require('point_of_sale.Registries');
    const ProductScreen = require('point_of_sale.ProductScreen'); 
    const OrderWidget = require('point_of_sale.OrderWidget');
    const EditListPopup = require('point_of_sale.EditListPopup');
    var PacklotlineCollection2 = Backbone.Collection.extend({
        model: models.Packlotline,
        initialize: function(models, options) {
            this.order_line = options.order_line;
        },

        get_empty_model: function(){
            return this.findWhere({'lot_name': null});
        },

        remove_empty_model: function(){
            this.remove(this.where({'lot_name': null}));
        },

        get_valid_lots: function(){
            return this.filter(function(model){
                return model.get('lot_name');
            });
        },

        set_quantity_by_lot: function() {
            if (this.order_line.product.tracking == 'serial' || this.order_line.product.tracking == 'lot') {
                var valid_lots = this.get_valid_lots();
                this.order_line.set_quantity(valid_lots.length);
            }
        }
    });

    models.load_models({
        model: 'stock.quant',
        fields: ['id','location_id','product_id','lot_id','quantity'],
        domain: function(self){
            if (self.config.show_stock_location == 'specific'){
                return [['lot_id','!=', false],['quantity','>',0],['location_id','=', self.config.stock_location_id[0]]];
            }else{
                return [];
            }
 
            // var from = moment(new Date()).subtract(self.config.lot_expire_days,'d').format('YYYY-MM-DD')+" 00:00:00";
            // if(self.config.allow_pos_lot){
            //     return [['create_date','>=',from],['total_prd_qty','>',0]];
            // } 
            // else{
            //     return [['id','=',0]];
            // } 
        },
        loaded: function(self,stock_quant){
            var stock_qnt = {}
            var lst_stock_qnt = {}
            for(var qnt in stock_quant){
                
                var latest_quant = stock_quant[qnt]
                lst_stock_qnt[latest_quant.id] = latest_quant
            }
            self.stock_quant = lst_stock_qnt;
        },
    });

    models.load_models({
        model: 'stock.production.lot',
        fields: ['id','name','product_id','total_prd_qty','quant_ids'],
        domain: function(self){ return [['total_prd_qty','>',0]]; },
        loaded: function(self,list_lot_num){

            if(self.config.show_stock_location == 'specific'){
                var location_wise_lot = []
                for (var lot in list_lot_num){
                    var lot_id = list_lot_num[lot]
                    var total_qty = 0.0
                    var flag = false
                    for(var qnt in lot_id.quant_ids){
                        var lot_qnt = lot_id.quant_ids[qnt]
                        var quant_id = self.stock_quant[lot_qnt]
                        if(quant_id != undefined && quant_id.lot_id[0] == lot_id.id && quant_id.location_id[0] == self.config.stock_location_id[0]){
                                total_qty += quant_id.quantity
                                flag = true                        
                        }
                    }
                    if(flag){
                        lot_id.total_prd_qty = total_qty
                        location_wise_lot.push(lot_id)
                    }
                    
                    
                }
                self.list_lot_num = location_wise_lot;
            }else{
                self.list_lot_num = list_lot_num;
            }

        },
    });

    var OrderlineSuper = models.Orderline;
    models.Orderline = models.Orderline.extend({
        export_as_JSON: function() {
            var json = OrderlineSuper.prototype.export_as_JSON.apply(this,arguments);
            json.lot_details = this.get_order_line_lot();
            return json;
        },
        // set_product_lot: function(product){
        //     this.has_product_lot = product.tracking !== 'none' && this.pos.config.use_existing_lots;
        //     this.pack_lot_lines  = this.has_product_lot && new PacklotlineCollection2(null, {'order_line': this});
        // },
        export_for_printing: function(){
            var pack_lot_ids = [];
            if (this.has_product_lot){
                this.pack_lot_lines.each(_.bind( function(item) {
                    return pack_lot_ids.push(item.export_as_JSON());
                }, this));
            }
            var only_lot = {};
            if (this.has_product_lot){
                this.pack_lot_lines.each(_.bind( function(item) {
                    console.log("sssssssssssssssssssssssssssssss", item.export_as_JSON())
                    if ($.inArray(item.export_as_JSON().lot_name, only_lot[item.export_as_JSON().lot_name])==-1) {
                        if(only_lot[item.export_as_JSON().lot_name] != undefined){
                            only_lot[item.export_as_JSON().lot_name] += 1;
                        }else{
                            only_lot[item.export_as_JSON().lot_name] = 1;
                        }
                    }
                }, this));
            }
            console.log("kkkkkkkkkkkkkkkkkkkkkkkk",only_lot)
            var data = OrderlineSuper.prototype.export_for_printing.apply(this, arguments);
            data.pack_lot_ids = pack_lot_ids;
            data.lot_details = this.get_order_line_lot();
            data.only_lot = only_lot
            return data;
        },

        get_order_line_lot:function(){
            var pack_lot_ids = [];
            if (this.has_product_lot){
                this.pack_lot_lines.each(_.bind( function(item) {
                    return pack_lot_ids.push(item.export_as_JSON());
                }, this));
            }
            return pack_lot_ids;
        },
        get_required_number_of_lots: function(){
            var lots_required = 1;

            if (this.product.tracking == 'serial' || this.product.tracking == 'lot') {
                lots_required = this.quantity;
            }

            return lots_required;
    },

    });

});