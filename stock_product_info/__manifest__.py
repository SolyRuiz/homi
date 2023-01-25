{
    'name': 'Stock Product stock info',
    'version': '15.0.1.0.2',
    'author': 'Gustavo H.',
    'depends': ['stock'],
    'data': [
        'views/stock_picking_views.xml',
        'views/stock_report.xml'
    ],
    'assets': {
        'web.assets_backend': [
            'stock_product_info/static/src/js/**/*',
        ],
        'web.assets_qweb': [
            'stock_product_info/static/src/xml/**/*',
        ],
    },
    "auto_install": False,
    "installable": True,
    'license': 'Other proprietary',
}
