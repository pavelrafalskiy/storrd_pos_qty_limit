from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    limit_medicinal_products = fields.Boolean(
        string="Limit Medicinal Products",
        help="Enable quantity limits for medicinal products in this Point of Sale.",
        default=False,
    )

    medicinal_limit = fields.Integer(
        string="Medicinal Product Max Limit",
        help="Maximum quantity of medicinal products allowed per transaction.",
        default=2,
    )


class PosSession(models.Model):
    _inherit = "pos.session"

    def _load_pos_data_fields(self, model_name):
        fields = super()._load_pos_data_fields(model_name)
        if model_name == "pos.config":
            fields += ["limit_medicinal_products", "medicinal_limit"]
        return fields
