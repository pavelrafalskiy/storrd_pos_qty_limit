from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    enable_qty_limit = fields.Boolean(
        string="Enable Quantity Limits",
        help="Enable quantity limits for restricted products in this Point of Sale.",
        default=False,
    )

    max_qty_limit = fields.Integer(
        string="Quantity Limit",
        help="Maximum total quantity of restricted products allowed per transaction.",
        default=2,
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        res_fields = super()._load_pos_data_fields(config_id)
        if res_fields:
            my_params = {"enable_qty_limit", "max_qty_limit"}
            res_fields = list(set(res_fields) | my_params)
        return res_fields