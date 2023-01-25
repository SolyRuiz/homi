{
    "name":  "POS Stock Existent",
    "summary":  """The user can display the product quantities on the Odoo POS with the module. If set, The user cannot add out of stock products to the POS cart.""",
    "category":  "Point of Sale",
    "version":  "15",
    "sequence":  1,
    "author":  "Tribuc S.A.",
    'license': 'Other proprietary',
    "manteiner": "Github: juancacorps Email: paloblancoit@gmail.com",
    "description":  """Odoo POS Stock
Show product quantity in POS
Out of stock products
Out-of-stock products POS
Added product quantities
POS product stock
Show stock pos
Manage POS stock
Product management POS""",
    "depends":  ['point_of_sale'],
    "data":  [
        'views/pos_config_view.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            "/pos_stocks/static/src/js/screens.js",
            "/pos_stocks/static/src/js/models.js",
            "/pos_stocks/static/src/js/popups.js",
            "/pos_stocks/static/src/css/pos_stocks.css",
        ],
        'web.assets_qweb': [
            'pos_stocks/static/src/xml/**/*',
        ],
    },
    "images":  ['static/description/Banner.png'],
    "application":  True,
    "installable":  True,
    "auto_install":  False,
    "price":  47,
    "currency":  "USD",
    "pre_init_hook"        :  "pre_init_check",
}
