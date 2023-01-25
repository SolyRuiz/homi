odoo.define('bi_pos_lot_expiration.WarningMessagePopup', function(require) {
    'use strict';

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');

    class WarningMessagePopup extends AbstractAwaitablePopup {}
    WarningMessagePopup.template = 'WarningMessagePopup';

    Registries.Component.add(WarningMessagePopup);

    return WarningMessagePopup;
});
