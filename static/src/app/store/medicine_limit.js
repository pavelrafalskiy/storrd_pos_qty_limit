import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

patch(PosOrder.prototype, {
    _getMedicinalTotal(excludeLine = null) {
        if (!this.get_orderlines) return 0;
        return this.get_orderlines()
            .filter(line => line && line.product_id?.is_medicinal_product && line !== excludeLine)
            .reduce((sum, line) => sum + (line.get_quantity() || 0), 0);
    }
});

patch(PosOrderline.prototype, {
    set_quantity(quantity, keep_price) {
        const order = this.order_id;
        const pos = order?.pos;

        if (pos?.config?.limit_medicinal_products && this.product_id?.is_medicinal_product) {
            const limit = pos.config.medicinal_limit || 2;
            const numQty = quantity === "delete" ? 0 : parseFloat(quantity || 0);

            if (quantity !== "delete" && !isNaN(numQty) && numQty > this.qty) {
                let total = (order?._getMedicinalTotal(this) || 0) + numQty;

                const duplicateLine = order?.get_orderlines().find(l =>
                    l !== this &&
                    l.product_id?.id === this.product_id?.id &&
                    l.can_be_merged_with(this)
                );

                if (duplicateLine) {
                    total -= duplicateLine.get_quantity();
                }

                if (total > limit) {
                    if (order) order._skipComboCheck = true;

                    pos.dialog.add(AlertDialog, {
                        title: _t("Limit Reached"),
                        body: _t("Total medicinal units in this order cannot exceed ") + limit,
                    });

                    if (order) {
                        setTimeout(() => { order._skipComboCheck = false; }, 200);
                    }

                    return super.set_quantity(this.qty, keep_price);
                }
            }
        }
        return super.set_quantity(...arguments);
    }
});

patch(PosStore.prototype, {
    async addLineToOrder(vals, order, opts = {}, configure = true) {
        const product = typeof vals.product_id === "number"
            ? this.models["product.product"].get(vals.product_id)
            : vals.product_id;

        if (this.config?.limit_medicinal_products && product?.is_medicinal_product) {
            const limit = this.config.medicinal_limit || 2;
            const currentOrder = order || this.get_order();

            if (currentOrder) {
                const totalInCart = currentOrder._getMedicinalTotal();
                const qtyToAdd = (vals.qty !== undefined) ? vals.qty : 1;

                if (totalInCart + qtyToAdd > limit) {
                    currentOrder._skipComboCheck = true;
                    this.dialog.add(AlertDialog, {
                        title: _t("Limit Reached"),
                        body: _t("Maximum ") + limit + _t(" medicinal products allowed per transaction."),
                    });
                    setTimeout(() => { currentOrder._skipComboCheck = false; }, 200);
                    return false;
                }
            }
        }
        return super.addLineToOrder(...arguments);
    }
});