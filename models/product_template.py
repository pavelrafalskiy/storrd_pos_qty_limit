from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    has_qty_limit = fields.Boolean(
        string="Has Quantity Limit",
        help="Enable quantity restrictions for this product in POS.",
        default=False,
        store=True,
    )


class ProductProduct(models.Model):
    _inherit = "product.product"

    @api.model
    def _load_pos_data_fields(self, config_id):
        """Extend the list of product fields loaded into the POS UI to include
        the quantity limit flag.
        """
        fields = super()._load_pos_data_fields(config_id)
        if "has_qty_limit" not in fields:
            fields.append("has_qty_limit")
        return fields
