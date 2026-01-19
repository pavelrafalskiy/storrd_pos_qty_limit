{
    "name": "POS Medicine Quantity Limit",
    "version": "1.0",
    "category": "Point of Sale",
    "summary": "Restricts medicinal products to 2 units per transaction in POS",
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
            "if_pos_medicine_limit/static/src/app/store/medicine_limit.js",
        ],
    },
    "installable": True,
    "license": "LGPL-3",
}
