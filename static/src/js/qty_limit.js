import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
import { ProductCard } from "@point_of_sale/app/generic_components/product_card/product_card";
import { Orderline } from "@point_of_sale/app/generic_components/orderline/orderline";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { sprintf } from "@web/core/utils/strings";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { useService } from "@web/core/utils/hooks";

const TEXT = {
    TITLE: _t("Limit Reached"),
    BODY: (limit) => sprintf(_t("Only %s restricted items per transaction permitted"), limit),
};

const state = { isInternalAction: false };

patch(PosStore.prototype, {
    isQtyLimitEnabled() {
        return this.config?.enable_qty_limit || false;
    },
    getQtyLimitValue() {
        return this.config?.max_qty_limit || 2;
    }
});

patch(PosOrder.prototype, {
    isRestricted(product) {
        const p = typeof product === 'number' ? this.pos.models["product.product"].get(product) : product;
        return p?.has_qty_limit || false;
    },

    _getRestrictedTotal() {
        return this.lines
            .filter(line => line && line.product_id && this.isRestricted(line.product_id))
            .reduce((sum, line) => sum + Math.ceil(line.get_quantity() || 0), 0);
    }
});

patch(PosOrderline.prototype, {
    set_quantity(quantity, keep_price) {
        const order = this.order_id;
        const pos = order?.pos;

        if (state.isInternalAction) {
            return super.set_quantity(...arguments);
        }

        if (order?.finalized) {
            return super.set_quantity(...arguments);
        }

        if (pos?.isQtyLimitEnabled() && order?.isRestricted(this.product_id)) {
            const limit = pos.getQtyLimitValue();
            const numQty = quantity === "delete" ? 0 : parseFloat(quantity || 0);
            const currentQty = this.get_quantity();

            if (quantity !== "delete" && !isNaN(numQty) && numQty > currentQty) {

                const totalInOrder = order._getRestrictedTotal();
                const totalWithChange = totalInOrder - Math.ceil(currentQty) + Math.ceil(numQty);

                if (totalWithChange > limit) {

                    if (pos.numberBuffer) {
                        pos.numberBuffer.reset();
                    }

                    pos.env.services.dialog.add(AlertDialog, {
                        title: TEXT.TITLE,
                        body: TEXT.BODY(limit)
                    });
                    // return super.set_quantity(currentQty, keep_price);
                }
            }
        }
        return super.set_quantity(...arguments);
    }
});

patch(PosStore.prototype, {
    async addLineToCurrentOrder(vals, opts = {}) {
        const product = typeof vals.product_id === "number"
            ? this.models["product.product"].get(vals.product_id)
            : vals.product_id;

        const order = this.get_order();

        if (order && this.isQtyLimitEnabled() && order.isRestricted(product)) {

            const limit = this.getQtyLimitValue();
            const addingQty = vals.qty || 1;
            const currentTotal = order._getRestrictedTotal();

            if (currentTotal + Math.ceil(addingQty) > limit) {

                this.numberBuffer?.reset();

                this.env.services.dialog.add(AlertDialog, {
                    title: TEXT.TITLE,
                    body: TEXT.BODY(limit),
                });
                return false;
            }
        }

        state.isInternalAction = true;
        try {
            return await super.addLineToCurrentOrder(...arguments);
        } finally {
            state.isInternalAction = false;
        }
    }
});

patch(PosOrderline.prototype, {
    getDisplayData() {
        return {
            ...super.getDisplayData(),
            has_qty_limit: this.product_id.has_qty_limit,
        };
    }
});

Orderline.props.line.shape.has_qty_limit = { type: Boolean, optional: true };

const componentsToPatch = [Orderline, ProductCard, OrderWidget];

componentsToPatch.forEach((component) => {
    patch(component.prototype, {
        setup() {
            super.setup(...arguments);
            this.pos = useService("pos");
        },
    });
});