# -*- coding: utf-8 -*-
from odoo import api, fields, models, _


class PosConfig(models.Model):
    _inherit = "pos.config"

    allow_expiry_warning = fields.Boolean(string="Permitir el aviso de caducidad y/o existencia del lote")
    restrict_creating_lot = fields.Boolean(string="Restringir al usuario la creación de un nuevo lote")
