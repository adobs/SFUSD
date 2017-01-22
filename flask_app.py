from flask import Flask, request, render_template, redirect, flash, session, jsonify, g
from jinja2 import StrictUndefined
import json
from hardcoded_data_source.inputs import get_checkbox_headers
from data_transformation.parse_csv import read_csv, get_unqiue_row_data_from_specified_headers, get_matching_schools
app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Normally, if you use an undefined variable in Jinja2, it fails silently.
# This is horrible. Fix this so that, instead, it raises an error.
app.jinja_env.undefined = StrictUndefined


@app.route("/", methods=["GET"])
def map():
    """ Map page. """

    checkbox_labels = get_unqiue_row_data_from_specified_headers(read_csv())

    return render_template("map3.html", checkbox_labels=checkbox_labels)


@app.route("/map-checked.json")
def map_checked_json():
	form_data = request.values.items(multi=True)

	neighborhood = []
	grades_served = []
	before_school_program = []
	before_school_program_offerings = []
	multilingual_pathways = []
	after_school_program = []
	after_school_program_offerings = []

	for data in form_data:
		if data[0] == "neighborhood":
			neighborhood.append(data[1])
		elif data[0] == "grades-served":
			grades_served.append(data[1])
		elif data[0] == "before-school-program":
			before_school_program.append(data[1])
		elif data[0] == "before-school-program-offerings":
			before_school_program_offerings.append(data[1])
		elif data[0] == "multilingual-pathways":
			multilingual_pathways.append(data[1])
		elif data[0] == "after-school-program":
			after_school_program.append(data[1])
		elif data[0] == "after-school-program-offerings":
			after_school_program_offerings.append(data[1])

	inputs = {"neighborhood": neighborhood,
	    		  "grades_served": grades_served,
	    		  "before_school_program": before_school_program,
	    		  "before_school_program_offerings": before_school_program_offerings,
	    		  "multilingual_pathways": multilingual_pathways,
	    		  "after_school_program": after_school_program,
	    		  "after_school_program_offerings": after_school_program_offerings}

	matching_schools = get_matching_schools(read_csv(), inputs)
	return json.dumps(matching_schools)

if __name__ == "__main__":
    app.debug = True
    # connect_to_db(app)
    import os, sys
    DEBUG = "NO_DEBUG" not in os.environ
    PORT = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)

