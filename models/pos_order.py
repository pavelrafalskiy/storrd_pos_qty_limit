from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    has_qty_limit = fields.Boolean(
        related="product_id.has_qty_limit",
        string="Has Quantity Limit",
        readonly=True,
        store=True,
    )
