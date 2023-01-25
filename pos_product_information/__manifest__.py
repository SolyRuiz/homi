# -*- coding: utf-8 -*-
{
	'name' : 'Product Information in POS',
	'author': "Juan Carlos Rojas",
	'version' : '13.0.1.0',
	'license': 'LGPL-3',
	'summary' : 'Product Information in POS',
	'description' : 'Product Information in POS',
	'depends' : ['point_of_sale'],
	'data' : [],
	'assets': {
        'web.assets_qweb': [
            'pos_product_information/static/src/xml/**/*'
        ]
    },
	'demo' : [],
    'application': True,
    'sequence': 1,
	'installable' : True,
	'auto_install' : False,
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
