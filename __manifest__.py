{
    "name": "POS Quantity Limit",
    "version": "1.0",
    "category": "Point of Sale",
    "summary": "Set quantity limits for specific products in Point of Sale",
    "description": """
            This module adds a flag to products and a configuration setting to POS 
            to limit the sale of medicinal products to a maximum of 2 units per order.
        """,
    "depends": ["point_of_sale"],
    "data": [
        "views/product_template_views.xml",
        "views/pos_config_views.xml",
        "views/pos_order_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "if_pos_qty_limit/static/src/js/qty_limit.js",
        ],
    },
    "installable": True,
    "license": "LGPL-3",
}
