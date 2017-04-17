from flask import Flask, request, render_template, redirect, flash, session, jsonify, g
from jinja2 import StrictUndefined
import json
import requests
from data_transformation.parse_csv import get_unique_row_data_from_specified_headers, get_schools, flatten_school_object_to_json
from data_transformation.parse_ctip import get_ctip1_information
from data_transformation.parse_xml import get_xml_information

app = Flask(__name__)
app.jinja_env.undefined = StrictUndefined


@app.route("/", methods=["GET"])
def map():
    """ Renders the page """
    
    checkbox_labels = get_unique_row_data_from_specified_headers(get_schools())
    return render_template("comparisontool.html", checkbox_labels=checkbox_labels)


@app.route("/attendance-area-coordinates.json")
def attendance_area_coordinates():
	""" AJAX: Sends back parsed attendance area geographical information """

	attendance_area = get_xml_information()
	return json.dumps(attendance_area)


@app.route("/ctip1-area-xy-coordinates.json")
def ctip1_area_xy_coordinates():
	""" AJAX: Sends back low testing-score geographical information """

	ctip1 = get_ctip1_information()
	return jsonify(result=ctip1)


@app.route("/map-checked.json")
def map_checked():
	""" AJAX: Gets ALL school information to populate the entire map """

	schools = flatten_school_object_to_json(get_schools())
	return jsonify(result=schools)


if __name__ == "__main__":
    import os, sys
    DEBUG = "NO_DEBUG" not in os.environ
    PORT = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)

