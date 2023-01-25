# -*- coding: utf-8 -*-
{
    'name': 'Account Invoice FEL -MEGAPRINT',
    'version': '15',
    'author': 'Tribuc S.A.',
    'website': 'https://www.odoo.com', 
    'support': 'Juan Carlos R. Ortega --> paloblancoit@gmail.com', 
    'maintainer': 'Github: @juancacorps',
    'category': 'Accounting',
    'depends': ['account'],
    'summary': 'Transfer Invoice To MegaPrint And Receive Certificate',
    'data': [
        'security/groups.xml',
        'security/ir.model.access.csv',
        'views/account_invoice.xml',
        'views/res_company_view.xml',
        'views/satdte_frases.xml',
        'views/account_journal_views.xml',
        'views/satdte_frases_data.xml',
        'wizard/wizard_cancel_view.xml',
        'reports/report_fel_format.xml',
        'reports/account_invoice_fel_format.xml'
    ],
    'license': 'Other proprietary',
    'application': True,
    'installable': True,
    'auto_install': False,
}
