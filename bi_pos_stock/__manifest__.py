# -*- coding: utf-8 -*-


{
    "name": "POS Tribuc Stock in Odoo",
    "version": "1.0",
    "category": "Point of Sale",
    "author": "Tribuc S,A",
    'summary': 'Mostrar el stock en la interfaz del punto de venta, asi como seleccionar diferentes opciones',
    "description": """ Este modulo permite mostrar en la interfaz del punto de venta el stock. donde el vendedor puede seleccionar y mostrar
    diferentes tipos de stock como cantidad disponible, cantidad entrante, cantidad saliente, cantidad disponible en el punto de venta
    y permitir/denegar pedido de venta de POS cuando el producto esta agotado. Puedes mostrar el stock de todas las ubicaciones de inventarios 
    y acciones especificas en POS. También Stock se sincronizará automaticamente cuando el pedido se realice en la aplicacion de gestión de inventario de Odoo POS
    """,
    "website": "https://www.tribuc.odoo.com",
    "depends": ['base', 'sale_management', 'product', 'stock', 'point_of_sale'],
    "data": [
        'views/custom_pos_config_view.xml',
        'views/product_view.xml',
    
    ],
    'assets': {
        'point_of_sale.assets': [
            'bi_pos_stock/static/src/css/stock.css',
            'bi_pos_stock/static/src/js/Chrome.js',
            'bi_pos_stock/static/src/js/SyncStock.js',
            'bi_pos_stock/static/src/js/models.js',
            'bi_pos_stock/static/src/js/Screens/ProductScreen.js',
            'bi_pos_stock/static/src/js/Screens/ProductsWidget.js',
        ],
        'web.assets_qweb': [
            'bi_pos_stock/static/src/xml/**/*',
        ],
    },
    "auto_install": False,
    "installable": True,
    'license': 'Other proprietary',
}
