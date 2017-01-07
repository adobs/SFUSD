from flask import Flask, request, render_template, redirect, flash, session, jsonify, g
from jinja2 import StrictUndefined
from model import Profile, Adjective, Gender, Orientation, Location, db, connect_to_db
from flask_helper_functions.selenium_okc import create_new_user
from flask_helper_functions.sending_a_message import send_message
from flask_helper_functions.signing_in import is_signed_in
import re
from okcupyd.session import Session
from okcupyd.user import User
from flask_helper_functions.map_helper import get_compiled
from flask_helper_functions.send_message_map import send
from flask_helper_functions.markov import get_input_text, make_chains, make_text
import json
from flask_helper_functions.create_word_chart import create_self_summary_words, create_message_me_if_words, prepare_data
from hardcoded_data_source.inputs import get_checkbox_headers
from data_transformation.parse_csv import read_csv, get_unqiue_row_data_from_specified_headers
app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Normally, if you use an undefined variable in Jinja2, it fails silently.
# This is horrible. Fix this so that, instead, it raises an error.
app.jinja_env.undefined = StrictUndefined


@app.route("/")
def map():
    """ Map page. """

    checkbox_labels = get_unqiue_row_data_from_specified_headers(read_csv())
    orientations = ["OR1", "OR1"]
    genders = ["g1", "g2", "g3"]

    return render_template("map3.html", checkbox_labels=checkbox_labels, 
            orientations=orientations, genders=genders)



if __name__ == "__main__":
    app.debug = True
    connect_to_db(app)

    app.run() 
    import sys
