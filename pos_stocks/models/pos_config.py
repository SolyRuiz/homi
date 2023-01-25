# -*- coding: utf-8 -*-

from odoo import fields, models, api
import logging
_logger = logging.getLogger(__name__)


class PosConfig(models.Model):
    _inherit = 'pos.config'

    wk_display_stock = fields.Boolean('Mostrar stock en POS', default=True)
    wk_stock_type = fields.Selection([('available_qty', 'Cantidad disponible (disponible)'), ('forecasted_qty', 'Cantidad pronosticada'), (
        'virtual_qty', 'Cantidad disponible - Cantidad saliente')], string='Tipo de acciones', default='available_qty')
    wk_continous_sale = fields.Boolean('Permitir pedido cuando no hay existencias')
    wk_deny_val = fields.Integer(
        'Denegar el pedido cuando el stock del producto sea inferior al ')
    wk_error_msg = fields.Char(
        string='Mensaje personalizado', default="Producto agotado")
    wk_hide_out_of_stock = fields.Boolean(
        string="Ocultar productos agotados", default=True)

    @api.model
    def wk_pos_fetch_pos_stock(self, kwargs):
        result = {}
        location_id = False
        wk_stock_type = kwargs['wk_stock_type']
        wk_hide_out_of_stock = kwargs['wk_stock_type']
        config_id = self.browse([kwargs.get('config_id')])
        picking_type = config_id.picking_type_id
        location_id = picking_type.default_location_src_id.id
        product_obj = self.env['product.product']
        pos_products = product_obj.search(
            [('sale_ok', '=', True), ('available_in_pos', '=', True)])
        pos_products_qtys = pos_products.with_context(location=location_id)._compute_quantities_dict(self._context.get(
            'lot_id'), self._context.get('owner_id'), self._context.get('package_id'), self._context.get('from_date'), self._context.get('to_date'))
        for pos_product in pos_products_qtys:
            if wk_stock_type == 'available_qty':
                result[pos_product] = pos_products_qtys[
                    pos_product]['qty_available']
            elif wk_stock_type == 'forecasted_qty':
                result[pos_product] = pos_products_qtys[
                    pos_product]['virtual_available']
            else:
                result[pos_product] = pos_products_qtys[pos_product][
                    'qty_available'] - pos_products_qtys[pos_product]['outgoing_qty']
        return result
