from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    is_medicinal_product = fields.Boolean(
        related="product_id.is_medicinal_product",
        string="Is Medicinal Product",
        readonly=True,
        store=True,
    )
