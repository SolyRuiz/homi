# -*- coding: utf-8 -*-
{
    'name': 'Convert number to words',
    'version': '15.0.1.0.0',
    'license': 'Other proprietary',
    'author': "Fogits Solutions",
    'summary': """
    This module allows you to convert number to words """,
    'website': "https://www.fogits.com/",
    'description': """
        Convert invoice amount to text 
    """,
    'category': 'Accounting',
    'depends': ['base_setup', 'account'],
    'data': [
        'views/account_invoice_view.xml',
    ],
}