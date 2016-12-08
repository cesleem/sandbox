from flask import Flask
from flask import request, jsonify, render_template, make_response
import pandas as pd
import json
import sys
import glob
import numpy as np
import argparse

from services.Metrics import gf
# from services.QuestionStats import col

# from pyxley import UILayout
from pyxley.charts.datatables import DataTable
from pyxley import SimpleComponent
from pyxley.filters import SelectButton
from collections import OrderedDict

parser = argparse.ArgumentParser(description="Flask Template")
parser.add_argument("--env", help="production or local", default="local")
args = parser.parse_args()

TITLE = "Momentum"

scripts = []

css = ["./css/main.css"]

cols = OrderedDict([
    ("merch_week", {"label": "Merch Week"}),
    ("visits_last_touch_category", {"label": "Channel"}),
    ("visits_device", {"label": "Device"}),
    ("newvisitors", {"label": "New Visitors"}),
    ("signups", {"label": "Sign Ups"}),
    ("profiles", {"label": "Profile Completers"}),
    ("firstorders", {"label": "First Fix Requested"})
])

gf = gf.dropna().reset_index(drop=True)
tb = DataTable("mytable", "/mytable/", gf, columns=cols, sortable=True, paging=False, pageLength=5,
    scrollX=True,
    sDom='<"top">rt<"bottom"lp><"clear">',
    deferRender=True)


app = Flask(__name__)
tb.register_route(app)


ui = SimpleComponent(
    "Table",
    "pyxley",
    "component_id",
    tb.params
)

sb = ui.render("./momentum/static/layout.js")

# ui.add_chart(tb)

# app = Flask(__name__)
# sb = ui.render_layout(app, "./momentum/static/layout.js")

# Create a webpack file and bundle our javascript
from pyxley.utils import Webpack
wp = Webpack(".")
wp.create_webpack_config(
    "layout.js",
    "./momentum/static/",
    "bundle",
    "./momentum/static/"
)
wp.run()


@app.route('/', methods=["GET"])
@app.route('/index', methods=["GET"])
def index():
    # return gf.head().to_string()
    _scripts = ["./bundle.js"]
    return render_template('funnel.html', users=['Ceslee', 'Dogs'],
        title=TITLE,
        base_scripts=scripts,
        page_scripts=_scripts,
        css=css)
    # return render_template('index.html',
    #     title=TITLE,
    #     base_scripts=scripts,
    #     page_scripts=_scripts,
    #     css=css)