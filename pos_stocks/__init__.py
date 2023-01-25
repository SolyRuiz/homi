# -*- coding: utf-8 -*-
from . import models

def pre_init_check(cr):
    from odoo.service import common
    from odoo.exceptions import Warning
    version_info = common.exp_version()
    server_serie =version_info.get('server_serie')
    if server_serie!='15.0':
        raise Warning('Soporte de módulo Odoo serie 15.0 encontrado {}.'.format(server_serie))
    return True