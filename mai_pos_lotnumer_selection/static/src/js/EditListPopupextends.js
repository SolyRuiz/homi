odoo.define('mai_pos_lotnumer_selection.EditListPopupextends', function(require) {
    'use strict';

    const { useState } = owl.hooks;
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');
    const { useAutoFocusToLast } = require('point_of_sale.custom_hooks');
    const { useListener } = require('web.custom_hooks');

    /**
     * Given a array of { id, text }, we show the user this popup to be able to modify this given array.
     * (used to replace PackLotLinePopupWidget)
     *
     * The expected return of showPopup when this popup is used is an array of { _id, [id], text }.
     *   - _id is the assigned unique identifier for each item.
     *   - id is the original id. if not provided, then it means that the item is new.
     *   - text is the modified/unmodified text.
     *
     * Example:
     *
     * ```
     *   -- perhaps inside a click handler --
     *   // gather the items to edit
     *   const names = [{ id: 1, text: 'Joseph'}, { id: 2, text: 'Kaykay' }];
     *
     *   // supply the items to the popup and wait for user's response
     *   // when user pressed `confirm` in the popup, the changes he made will be returned by the showPopup function.
     *   const { confirmed, payload: newNames } = await this.showPopup('EditListPopup', {
     *     title: "Can you confirm this item?",
     *     array: names })
     *
     *   // we then consume the new data. In this example, it is only logged.
     *   if (confirmed) {
     *     console.log(newNames);
     *     // the above might log the following:
     *     // [{ _id: 1, id: 1, text: 'Joseph Caburnay' }, { _id: 2, id: 2, 'Kaykay' }, { _id: 3, 'James' }]
     *     // The result showed that the original item with id=1 was changed to have text 'Joseph Caburnay' from 'Joseph'
     *     // The one with id=2 did not change. And a new item with text='James' is added.
     *   }
     * ```
     */
    class EditListPopup1 extends AbstractAwaitablePopup {
        /**
         * @param {String} title required title of popup
         * @param {Array} [props.array=[]] the array of { id, text } to be edited or an array of strings
         * @param {Boolean} [props.isSingleItem=false] true if only allowed to edit single item (the first item)
         */
        constructor() {
            super(...arguments);
            this._id = 0;
            useListener('add-lot_line', this.addNewLotLine);
            var product_lot = [];
            var lot_list = this.env.pos.list_lot_num;
            for(var i=0;i<lot_list.length;i++){
                if(lot_list[i].product_id[0] == this.props.product.id){
                    product_lot.push(lot_list[i]);
                }
            }
            this.state = useState({array: this._initialize(this.props.array), product_lot : product_lot , qstr : '' });
            useAutoFocusToLast();
        }
        _nextId() {
            return this._id++;
        }
        _emptyItem() {
            return {
                text: '',
                qty : 0,
                _id: this._nextId(),
            };
        }
        _initialize(array) {
            // If no array is provided, we initialize with one empty item.
            if (array.length === 0) return [this._emptyItem()];
            // Put _id for each item. It will serve as unique identifier of each item.
            return array.map((item) => Object.assign({}, { _id: this._nextId() }, typeof item === 'object'? item: { 'text': item}));
        }
        removeItem(event) {
            const itemToRemove = event.detail;
            this.state.array.splice(
                this.state.array.findIndex(item => item._id == itemToRemove._id),
                1
            );
            // We keep a minimum of one empty item in the popup.
            if (this.state.array.length === 0) {
                this.state.array.push(this._emptyItem());
            }
        }
        search_lot(event){
            // $(".search_lot").keyup(function(){
            this.state.qstr = event.target.value;
            var lot_list = this.env.pos.list_lot_num;
            var product_lot = [];
            for(var i=0;i<lot_list.length;i++){
                if(lot_list[i].product_id[0] == this.props.product.id && lot_list[i].name.toLowerCase().search(event.target.value.toLowerCase()) > -1){
                    product_lot.push(lot_list[i]);
                }
            }
            this.state.product_lot = product_lot;

            // });
        }

        addNewLotLine({ detail: lot_name }){
            var self = this;
            let list_of_qty = $('.entered_item_qty');
            $.each(list_of_qty, function(index, value) {
                let entered_item_qty = $(value).find('input');
                let entered_qty = parseFloat(entered_item_qty.val());
                if(entered_item_qty.attr('data-lot') == lot_name){
                    for(var i = 0 ; i < entered_qty ; i++){
                    self.state.array.push(
                        {text: lot_name,
                        qty : entered_qty,
                        _id: self._nextId(),
                    });
                    }
                }
            });
            // this.createNewItem();
        }
        createNewItem() {
            if (this.props.isSingleItem) return;
            this.state.array.push(this._emptyItem());
        }
        /**
         * @override
         */
        getPayload() {
            return {
                newArray: this.state.array
                    .filter((item) => item.text.trim() !== '')
                    .map((item) => Object.assign({}, item)),
            };
        }
    }
    EditListPopup1.template = 'EditListPopup1';
    EditListPopup1.defaultProps = {
        confirmText: 'Ok',
        cancelText: 'Cancel',
        array: [],
        isSingleItem: false,
    };

    Registries.Component.add(EditListPopup1);

    return EditListPopup1;
});
