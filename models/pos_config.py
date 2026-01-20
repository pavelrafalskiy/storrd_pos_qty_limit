from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    enable_qty_limit = fields.Boolean(
        string="Enable Quantity Limits",
        help="Enable quantity limits for restricted products in this Point of Sale.",
        default=False,
    )

    max_qty_limit = fields.Integer(
        string="Quantity Limit (Units)",
        help="Maximum quantity of restricted products in Units (packets) allowed per transaction.",
        default=2,
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        all_fields = self.fields_get()
        fields_to_load = [
            name
            for name, field in all_fields.items()
            if field["type"] not in ["one2many"]
        ]

        custom_fields = ["enable_qty_limit", "max_qty_limit"]
        for field in custom_fields:
            if field not in fields_to_load:
                fields_to_load.append(field)

        return fields_to_load
