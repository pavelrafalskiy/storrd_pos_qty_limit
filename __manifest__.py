{
    "name": "Storrd: POS Quantity Limit",
    "version": "1.0",
    "category": "Point of Sale",
    "summary": "Set configurable quantity limits for restricted products in Point of Sale",
    "author": "Storrd",
    "description":
        """
        This module adds a flag to products and a configuration setting to POS 
        to limit the total quantity of restricted products per transaction. 
        The limit is set to 2 by default and can be easily adjusted in the POS settings.
        """,
    "depends": ["point_of_sale", "pos_loyalty"],
    "data": [
        "views/product_template_views.xml",
        "views/pos_config_views.xml",
        "views/pos_order_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "storrd_pos_qty_limit/static/src/js/qty_limit.js",
            "storrd_pos_qty_limit/static/src/xml/pos_templates.xml",
        ],
    },
    "installable": True,
    "license": "LGPL-3",
}
