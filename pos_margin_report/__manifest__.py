# -*- coding: utf-8 -*-

{
    'name': "POS Margin Report",

    'summary': """
        Report margin POS""",

    'description': """
        Cuando se seleccione el filtro de todos, debería de mostrar un total resumido por punto de venta
            con las siguientes columnas (nombre del punto de venta, Total de venta, Costo, Margen de ganancia)
        Cuando se seleccione por punto de venta, debe mostrar información al detalle con los siguientes
            campos (Nombre de artículo, Cantidad vendida, Total de venta, Costo, Margen de ganancia)
        """,

    'author': "Gustavo H.",
    'website': "http://tteerp.com",
    'license': 'Other proprietary',
    'category': 'Point of Sale',
    'version': '1.0.0',
    'support': 'gustavo.hinojosa.h@gmail.com',
    'depends': ['point_of_sale'],
    'data': [
        'security/ir.model.access.csv',
        'wizard/pos_margin_report_wiz.xml',
    ],
    'installable': True,
    'auto_install': False,
}
