from odoo import models, fields, _, api

class StockMove(models.Model):
	_inherit = "stock.move"

	display_qty_widget = fields.Boolean(compute='_compute_forecast_information', compute_sudo=True)

	@api.depends('product_type', 'product_id', 'picking_type_id', 'picking_id', 'reserved_availability', 'priority', 'state', 'product_uom_qty', 'location_id')
	def _compute_forecast_information(self):
		super(StockMove, self)._compute_forecast_information()
		"""Compute the visibility of the inventory widget."""
		for line in self:
			if line.state in ['draft', 'waiting', 'confirmed', 'assigned'] and line.product_type == 'product':
				line.display_qty_widget = True
			else:
				line.display_qty_widget = False