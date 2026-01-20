import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { sprintf } from "@web/core/utils/strings";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

const TEXT = {
    TITLE: _t("Limit Reached"),
    BODY: (limit) => sprintf(_t("Only %s units are permitted per transaction."), limit),
};

patch(PosStore.prototype, {
    isQtyLimitEnabled() {
        return this.config?.enable_qty_limit || false;
    },
    getQtyLimitValue() {
        return this.config?.max_qty_limit || 2;
    }
});

patch(PosOrder.prototype, {
    hasQtyLimit(product) {
        return product?.has_qty_limit || false;
    },
    isUnitMeasure(product) {
        return product?.is_unit_uom || false;
    },

    isRestricted(product) {
        return this.hasQtyLimit(product) && this.isUnitMeasure(product);
    },

    _getRestrictedTotal(excludeLine = null) {
        const lines = this.get_orderlines();
        return lines
            .filter(line => {
                if (!line || !line.product_id) return false;

                const product = typeof line.product_id === "number"
                    ? this.pos.models["product.product"].get(line.product_id)
                    : line.product_id;

                return this.isRestricted(product) && line !== excludeLine;
            })
            .reduce((sum, line) => sum + (line.get_quantity() || 0), 0);
    }
});

patch(PosOrderline.prototype, {
    set_quantity(quantity, keep_price) {
        const order = this.order_id;
        const pos = order?.pos;

        const product = typeof this.product_id === "number"
            ? pos.models["product.product"].get(this.product_id)
            : this.product_id;

        if (pos?.isQtyLimitEnabled() && order?.isRestricted(product)) {
            const limit = pos.getQtyLimitValue();
            const numQty = quantity === "delete" ? 0 : parseFloat(quantity || 0);
            const currentQty = this.get_quantity();

            if (quantity !== "delete" && !isNaN(numQty) && numQty > currentQty) {
                let total = order._getRestrictedTotal(this) + numQty;

                const duplicateLine = order.lines.find(l => {
                    if (l === this || !l.product_id) return false;
                    const lId = l.product_id.id || l.product_id;
                    const thisId = product.id || product;
                    return lId === thisId && l.can_be_merged_with(this);
                });

                if (duplicateLine) total -= duplicateLine.get_quantity();

                if (total > limit) {
                    pos.env.services.dialog.add(AlertDialog, {
                        title: TEXT.TITLE,
                        body: TEXT.BODY(limit)
                    });
                    return super.set_quantity(currentQty, keep_price);
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

        const currentOrder = this.get_order();

        if (this.isQtyLimitEnabled() && currentOrder?.isRestricted(product)) {
            const limit = this.getQtyLimitValue();
            const currentTotal = currentOrder._getRestrictedTotal();
            const addingQty = vals.qty || 1;
            if (currentTotal + addingQty > limit) {
                this.env.services.dialog.add(AlertDialog, {
                    title: TEXT.TITLE,
                    body: TEXT.BODY(limit),
                });
                return false;
            }
        }
        return super.addLineToCurrentOrder(...arguments);
    }
});