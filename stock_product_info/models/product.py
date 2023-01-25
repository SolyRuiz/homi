from odoo import models, fields, api, _
from odoo.tools import float_repr
import logging
_logger = logging.getLogger(__name__)

class ProductProduct(models.Model):
    _inherit = 'product.product'

    @api.model
    def get_information_from_js(self, product_id, location_id):
        if not product_id or not location_id:
            return {}
        precision = self.env['decimal.precision'].precision_get('Product Unit of Measure')

        product = self.env['product.product'].browse(product_id)
        groupe_per_location = {}
        location = self.env['stock.location'].browse(location_id)
        groupe_per_location.setdefault(location, {'name': location.display_name,'qty':0.0,'visible':True})

        for stock_quant_id in product.stock_quant_ids.filtered(lambda sq: sq.location_id.id == location.id):
            groupe_per_location.setdefault(stock_quant_id.location_id, {'name': stock_quant_id.location_id.display_name,'qty':0.0,'visible':True})
            # warehouse = stock_quant_id.location_id.warehouse_id
            # if not warehouse.visible_on_sol:
            #     groupe_per_location[stock_quant_id.location_id]['visible'] = False
            groupe_per_location[stock_quant_id.location_id]['qty'] += float(float_repr(stock_quant_id.quantity, precision))

        return {
            'name': product.display_name,
            'qty_available': product.qty_available,
            'virtual_available': product.virtual_available,
            'uom': product.uom_id.name,
            'qty_per_location': list(groupe_per_location.values()) or False
        }
