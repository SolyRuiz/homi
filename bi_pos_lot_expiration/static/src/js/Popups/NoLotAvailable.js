odoo.define('bi_pos_lot_expiration.NoLotAvailable', function(require) {
    'use strict';

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');

    class NoLotAvailable extends AbstractAwaitablePopup {}
    NoLotAvailable.template = 'NoLotAvailable';

    Registries.Component.add(NoLotAvailable);

    return NoLotAvailable;
});
