odoo.define('bi_pos_lot_expiration.ExpiryDatePopup', function(require) {
    'use strict';

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');

    class ExpiryDatePopup extends AbstractAwaitablePopup {}
    ExpiryDatePopup.template = 'ExpiryDatePopup';

    Registries.Component.add(ExpiryDatePopup);

    return ExpiryDatePopup;
});
