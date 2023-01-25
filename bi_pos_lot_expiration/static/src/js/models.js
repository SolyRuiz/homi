odoo.define('bi_pos_lot_expiration.models', function (require) {
    "use strict";

    var models = require('point_of_sale.models');

   	models.load_models({
		model:  'stock.production.lot',
		fields: ['product_id','id','name','ref', 'use_expiration_date','expiration_date','use_date','removal_date','alert_date'],
		loaded: function(self,barcode){
		    self.stock_production_lot = barcode;
		},
	});
});
