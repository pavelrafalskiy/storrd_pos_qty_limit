from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    has_qty_limit = fields.Boolean(
        string="Has Quantity Limit",
        help="Enable quantity restrictions for this product in POS.",
        default=False,
        store=True,
    )

    is_unit_uom = fields.Boolean(
        compute="_compute_is_unit_uom",
        store=True,
        readonly=True,
    )

    @api.depends("uom_id")
    def _compute_is_unit_uom(self):
        unit_uom = self.env.ref("uom.product_uom_unit", raise_if_not_found=False)
        for record in self:
            record.is_unit_uom = record.uom_id == unit_uom


class ProductProduct(models.Model):
    _inherit = "product.product"

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields = super()._load_pos_data_fields(config_id)
        fields += ["has_qty_limit", "is_unit_uom"]
        return fields
