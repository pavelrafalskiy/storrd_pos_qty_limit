from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    is_medicinal_product = fields.Boolean(
        string="Is Medicinal Product",
        help="Enables active ingredient quantity restrictions in POS.",
        copy=True,
        tracking=True,
        default=False,
    )


class ProductProduct(models.Model):
    _inherit = "product.product"

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields = super()._load_pos_data_fields(config_id)
        fields.append("is_medicinal_product")
        return fields
