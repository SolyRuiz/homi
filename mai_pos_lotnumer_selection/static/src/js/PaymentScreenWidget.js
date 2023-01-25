odoo.define('mai_pos_lotnumer_selection.PaymentScreenWidget', function(require){
	'use strict';

	const PaymentScreen = require('point_of_sale.PaymentScreen');
	const PosComponent = require('point_of_sale.PosComponent');
	const Registries = require('point_of_sale.Registries');
    const ks_utils = require('ks_pos_low_stock_alert.utils');
	const { Component } = owl;

	const PaymentScreenWidget = (PaymentScreen) =>
		class extends PaymentScreen {
			constructor() {
				super(...arguments);
				console.log("xxxxxxxxxxxxxxxxxxxxxxx")
			}
			async validateOrder(isForceValidate) {
				var self = this;
				var order = this.env.pos.get_order();
				var orderline = order.get_orderlines();
				var lot_list = this.env.pos.list_lot_num;
				if (await this._isOrderValid(isForceValidate) && ks_utils.ks_validate_order_items_availability(this.env.pos.get_order(), this.env.pos.config)) {
					// remove pending payments before finalizing the validation
					for (let line of this.paymentLines) {
						if (!line.is_done()) this.currentOrder.remove_paymentline(line);
					}
					orderline.forEach(function(line) {
						if(line.pack_lot_lines && line.pack_lot_lines.models.length > 0){
							line.pack_lot_lines.models.forEach(function(lot){
								lot_list.forEach(function(d_lot){
									if(line.product.id == d_lot.product_id[0] && d_lot.name == lot.attributes.lot_name){
										d_lot.total_prd_qty = d_lot.total_prd_qty - 1
									}
								});
							});
						}
					});
					await this._finalizeValidation();
				}
			}
			// async validateOrder(isForceValidate) {
			// 	var self = this;
			// 	var order = this.env.pos.get_order();
			// 	var orderline = order.get_orderlines();
			// 	var lot_list = this.env.pos.list_lot_num;
			// 	console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm", orderline)
			// 	orderline.forEach(function(line) {
			// 		console.log("1111111111111111111111111111111111", line)
			// 		if(line.pack_lot_lines && line.pack_lot_lines.models.length > 0){
			// 			console.log("22222222222222222222222222222222222", line.pack_lot_lines)
			// 			line.pack_lot_lines.models.forEach(function(lot){
			// 				console.log(lot_list,"22222222222222222222222222222",lot)
			// 				lot_list.forEach(function(d_lot){
			// 					if(line.product.id == d_lot.product_id[0] && d_lot.name == lot.attributes.lot_name){
			// 						d_lot.total_prd_qty = d_lot.total_prd_qty - 1
			// 					}
			// 				});
			// 			});
			// 		}
			// 	});
			// 	return super.validateOrder(isForceValidate);
			// 	// super.validateOrder(isForceValidate);
			// }	
	};

	Registries.Component.extend(PaymentScreen, PaymentScreenWidget);

	return PaymentScreen;

});