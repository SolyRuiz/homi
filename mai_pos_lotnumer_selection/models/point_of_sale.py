# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) Kiran Kantesariya.
#
##############################################################################
from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError
from odoo.tools import float_is_zero, float_compare

from itertools import groupby

class pos_config(models.Model):
	_inherit = 'pos.config' 

	allow_pos_lot = fields.Boolean('Allow POS Lot/Serial Number', default=True)
	lot_expire_days = fields.Integer('Product Lot/Serial expire days.', default=1)
	pos_lot_receipt = fields.Boolean('Print Lot/Serial on receipt',default=1)
	allow_expiry_warning = fields.Boolean(string="Permitir el aviso de caducidad y/o existencia del lote")
	restrict_creating_lot = fields.Boolean(string="Restringir al usuario la creación de un nuevo lote")


class account_move_line(models.Model):
	_inherit = 'account.move.line' 

	lot_ids = fields.Many2many('stock.production.lot',string="Lots")
	pos_lot_ids = fields.Many2many('pos.pack.operation.lot',string="POS Lots")

class pos_order(models.Model):
	_inherit = 'pos.order' 

	def _prepare_invoice_line(self, order_line):
		res  = super(pos_order, self)._prepare_invoice_line(order_line)
		lots = order_line.pack_lot_ids.mapped('lot_name')
		lot_rec = self.env['stock.production.lot'].search([('name','in',lots)])
		res.update({
			'lot_ids': [(6, 0, lot_rec.ids)],
			'pos_lot_ids' : [(6, 0, order_line.pack_lot_ids.ids)],
		})
		return res


class stock_production_lot(models.Model):
	_inherit = "stock.production.lot"

	total_qty = fields.Float("Total Qty", compute="_computeTotalQty",)
	total_prd_qty = fields.Float("Total prd Qty",)

	
	def _computeTotalQty(self):
		for record in self:
			move_line = self.env['stock.move.line'].search([('lot_id','=',record.id)])
			record.total_qty = 0.0
			# for rec in move_line:
			int_tans_ml = move_line.filtered(lambda l: l.location_dest_id.usage in ['internal', 'transit'])
			cust_tans_ml = move_line.filtered(lambda l: l.location_dest_id.usage in ['customer'])
			int_tans_nt_ml = move_line.filtered(lambda l: l.location_dest_id.usage not in ['internal', 'transit'])
			
			if int_tans_ml:
				record.total_qty += sum(ln.qty_done for ln in int_tans_ml)
				record. total_prd_qty = record.total_qty
			if cust_tans_ml:
				record.total_qty -=sum(ln.qty_done for ln in cust_tans_ml)
				record. total_prd_qty = record.total_qty					
			if int_tans_nt_ml:
				record.total_qty -=sum(ln.qty_done for ln in int_tans_nt_ml)
				record. total_prd_qty = record.total_qty


	

		return True
class PosOrder(models.Model):
	_inherit = "stock.picking"

	def button_validate(self):
		res  = super(PosOrder, self).button_validate()
		for stock in self.move_ids_without_package:
			for lot in stock.lot_ids:
				lot._computeTotalQty()
		return res
	def _create_move_from_pos_order_lines(self, lines):
		self.ensure_one()
		lines_by_product = groupby(sorted(lines, key=lambda l: l.product_id.id), key=lambda l: l.product_id.id)
		for product, lines in lines_by_product:
			order_lines = self.env['pos.order.line'].concat(*lines)
			first_line = order_lines[0]
			current_move = self.env['stock.move'].create(
				self._prepare_stock_move_vals(first_line, order_lines)
			)
			confirmed_moves = current_move._action_confirm()
			for move in confirmed_moves:
				if first_line.product_id == move.product_id and first_line.product_id.tracking != 'none':
					if self.picking_type_id.use_existing_lots or self.picking_type_id.use_create_lots:
						for line in order_lines:
							sum_of_lots = 0
							for lot in line.pack_lot_ids.filtered(lambda l: l.lot_name):
								if line.product_id.tracking == 'serial':
									qty = 1
								else:
									qty = abs(1)
								ml_vals = move._prepare_move_line_vals()
								ml_vals.update({'qty_done':qty})
								if self.picking_type_id.use_existing_lots:
									existing_lot = self.env['stock.production.lot'].search([
										('company_id', '=', self.company_id.id),
										('product_id', '=', line.product_id.id),
										('name', '=', lot.lot_name)
									])
									if not existing_lot and self.picking_type_id.use_create_lots:
										existing_lot = self.env['stock.production.lot'].create({
											'company_id': self.company_id.id,
											'product_id': line.product_id.id,
											'name': lot.lot_name,
										})
									ml_vals.update({
										'lot_id': existing_lot.id,
									})
								else:
									ml_vals.update({
										'lot_name': lot.lot_name,
									})
								self.env['stock.move.line'].create(ml_vals)
								sum_of_lots += qty
							if abs(line.qty) != sum_of_lots:
								difference_qty = abs(line.qty) - sum_of_lots
								ml_vals = current_move._prepare_move_line_vals()
								if line.product_id.tracking == 'serial':
									ml_vals.update({'qty_done': 1})
									for i in range(int(difference_qty)):
										self.env['stock.move.line'].create(ml_vals)
								else:
									ml_vals.update({'qty_done': difference_qty})
									self.env['stock.move.line'].create(ml_vals)
					else:
						move._action_assign()
						sum_of_lots = 0
						for move_line in move.move_line_ids:
							move_line.qty_done = move_line.product_uom_qty
							sum_of_lots += move_line.product_uom_qty
						if float_compare(move.product_uom_qty, move.quantity_done, precision_rounding=move.product_uom.rounding) > 0:
							remaining_qty = move.product_uom_qty - move.quantity_done
							ml_vals = move._prepare_move_line_vals()
							ml_vals.update({'qty_done':remaining_qty})
							self.env['stock.move.line'].create(ml_vals)

				else:
					move.quantity_done = move.product_uom_qty


