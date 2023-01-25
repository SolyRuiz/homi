# -*- coding: utf-8 -*-


{
    'name': 'Product Lot Validation in POS',
    'version': '15.0.0.0',
    'category': 'Point of Sale',
    'summary': 'Product Lot Validations -POS-',
    'description': """Product Lot Validations -POS-""",
    'author': 'Tribuc S.A.',
    'manteiner': 'Github: juancacorps Email: paloblancoit@gmail.com',
    'sequence': 2,
    'license': 'LGPL-3',
    'depends': ['point_of_sale', 'stock'],
    'data': [
        'views/point_of_sale.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            "bi_pos_lot_expiration/static/src/js/models.js",
            "bi_pos_lot_expiration/static/src/js/Screens/ProductScreen/ProductScreen.js",
            "bi_pos_lot_expiration/static/src/js/Screens/ProductScreen/OrderWidget.js",
            "bi_pos_lot_expiration/static/src/js/Popups/WarningMessagePopup.js",
            "bi_pos_lot_expiration/static/src/js/Popups/NoLotAvailable.js",
            "bi_pos_lot_expiration/static/src/js/Popups/ExpiryDatePopup.js",

        ],
        'web.assets_qweb': [
            'bi_pos_lot_expiration/static/src/xml/**/*',
        ],
    },

    'installable': True,
    'auto_install': False,
    'application': True,
}
