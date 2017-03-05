from flask import Flask, request, render_template, redirect, flash, session, jsonify, g
from jinja2 import StrictUndefined
import json
from data_transformation.parse_csv import read_csv, get_unique_row_data_from_specified_headers, get_matching_schools	
from data_transformation.parse_ctip import get_ctip1_information
from data_transformation.parse_xml import get_xml_information
app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
# app.secret_key = "ABC"

app.jinja_env.undefined = StrictUndefined


@app.route("/", methods=["GET"])
def map():
    """ Map page. """
    
    checkbox_labels = get_unique_row_data_from_specified_headers(read_csv())
 
    return render_template("map3.html", checkbox_labels=checkbox_labels)


@app.route("/attendance-area-coordinates.json")
def attendance_area_coordinates():
	""" Retrieves parsed attendance area and sends back in AJAX GET request """

	attendance_area = get_xml_information()
	return json.dumps(attendance_area)

@app.route("/ctip1-area-xy-coordinates.json")
def ctip1_area_xy_coordinates():

	ctip1 = get_ctip1_information()
	# print "ctip1 is ", type(ctip1)
	return jsonify(result=ctip1)

@app.route("/map-checked.json")
def map_checked():
	form_data = request.values.items(multi=True)
	print "form_data is ", form_data

	grades_served = []
	city_school = []
	before_school_program = []
	before_school_program_offerings = []
	multilingual_pathways = []
	after_school_program = []
	after_school_program_offerings = []

	for data in form_data:
		if data[0] == "g-s":
			grades_served.append(data[1])
		elif data[0] == "c-s":
			city_school.append(data[1])
		elif data[0] == "b-s-p":
			before_school_program.append(data[1])
		elif data[0] == "b-s-p-o":
			before_school_program_offerings.append(data[1])
		elif data[0] == "m-p":
			multilingual_pathways.append(data[1])
		elif data[0] == "a-s-p":
			after_school_program.append(data[1])
		elif data[0] == "a-s-p-o":
			after_school_program_offerings.append(data[1])

	inputs = {"grades_served": grades_served,
				  "city_school": city_school,
	    		  "before_school_program": before_school_program,
	    		  "before_school_program_offerings": before_school_program_offerings,
	    		  "multilingual_pathways": multilingual_pathways,
	    		  "after_school_program": after_school_program,
	    		  "after_school_program_offerings": after_school_program_offerings}

	matching_schools = get_matching_schools(read_csv(), inputs)
	return json.dumps(matching_schools)


if __name__ == "__main__":
    import os, sys
    DEBUG = "NO_DEBUG" not in os.environ
    PORT = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)

