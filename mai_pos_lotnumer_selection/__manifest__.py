{
    'name': 'POS Lot/Serial Number(s) | POS Lot Selection(Community & Enterprise)',
    'version': '15.4.3.8.2022',
    'category': 'Point of Sale',
    'summary': 'Using this module you can Search product using Lot/Serial numbers in Point of sale Interface, Add product Lot/Serial Numbers Expirydate and Option for print Lot/Serial number on POS Receipt.',
    'description': """ Using this module you can Search product using Lot/Serial numbers in Point of sale Interface, Add product Lot/Serial Numbers Expirydate and Option for print Lot/Serial number on POS Receipt.
    """,
    'price': 40,
    'currency': 'EUR',
    "sequence": 1,
    "author" : "MAISOLUTIONSLLC",
    "email": 'apps@maisolutionsllc.com',
    "website":'http://maisolutionsllc.com/',
    'license': 'OPL-1',
    'depends': ['point_of_sale', 'product_expiry','ks_pos_low_stock_alert'],
    "live_test_url" : "https://youtu.be/0ChmqXGvm74",
    'data': [
        'views/pos.xml',
    ],
    'images': ['static/description/main_screenshot.png'],
    'demo': [],
    'test': [],
    'installable': True,
    'auto_install': False,
    'assets': {
        'point_of_sale.assets': [
            'mai_pos_lotnumer_selection/static/src/js/model.js',
            'mai_pos_lotnumer_selection/static/src/js/ProductScreenWidget.js',
            'mai_pos_lotnumer_selection/static/src/js/OrderWidgetextends.js',
            'mai_pos_lotnumer_selection/static/src/js/EditListPopupextends.js',
            'mai_pos_lotnumer_selection/static/src/js/PaymentScreenWidget.js',
            'mai_pos_lotnumer_selection/static/src/js/WarningMessagePopup.js',
        ],
        'web.assets_qweb': [
            'mai_pos_lotnumer_selection/static/src/xml/point_of_sale.xml',
            'mai_pos_lotnumer_selection/static/src/xml/WarningMessagePopup.xml',
        ],        
    },      
}
