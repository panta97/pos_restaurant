import os
import csv
from xmlrpc import client as xmlrpclib


def lambda_handler(event, context):
    # GET ENVIRONMENT VARIABLES
    url = os.environ["URL"]
    db = os.environ["DB"]
    pwd = os.environ["PWD"]
    uid = int(os.environ["UID"])
    olympo_id = 3
    models = xmlrpclib.ServerProxy("{}/xmlrpc/2/object".format(url))
    product_product = models.execute_kw(
        db,
        uid,
        pwd,
        "product.product",
        "search_read",
        [[["company_id", "=", olympo_id]]],
        {"fields": ["product_tmpl_id", "categ_id"], "context": {"lang": "es_PE"}},
    )

    def flatten(product):
        return {
            "id": product["id"],
            "name": product["product_tmpl_id"][1],
            "category_id": product["categ_id"][0],
        }

    products = [flatten(product) for product in product_product]
    return products


def make_csv(dict_list):
    if len(dict_list) == 0:
        return
    columns = dict_list[0].keys()
    try:
        with open("products.csv", "w") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=columns)
            writer.writeheader()
            for data in dict_list:
                writer.writerow(data)
    except IOError:
        print("IOError")
    pass


# lambda_handler(None, None)
make_csv(lambda_handler(None, None))
