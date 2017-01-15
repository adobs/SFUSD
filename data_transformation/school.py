"""
school.py

Class for School objects
"""

class School:

    def __init__(self, inputs):
        self.inputs = inputs
        self.populate_properties();

    def populate_properties(self):
    	self.timestamp = self.inputs["Timestamp"]
    	self.username = self.inputs["Username"]
    	self.name = self.inputs["School name"]
    	self.grades_served = self.inputs["Grades served"].split(",")
    	self.id_number = self.inputs["School ID number"]
    	self.address = self.inputs["School address"]
        self.lat = float(self.inputs["Lat"])
        self.long = float(self.inputs["Long"])
    	self.start_time = self.inputs["School start time"]
    	self.end_time = self.inputs["School end time"]
    	self.phone_number = self.inputs["School phone number"]
    	self.fax_number = self.inputs["School fax number"]
    	self.email = self.inputs["School email"]
    	self.website = self.inputs["School website link"]
    	self.neighborhood = self.inputs["Neighborhood"].split(",")
    	self.principal = self.inputs["Principal"]
    	self.tours = self.inputs["School tours"]
    	self.uniforms = self.inputs["Uniforms and dress code"]
    	self.prek = self.inputs["Pre-Kindergarten"]
    	self.tk = self.inputs["Transitional Kindergarten (TK)"]
    	self.before_school_program = self.inputs["Before school programs"].split(",")
    	self.before_school_program_offerings = self.inputs["Does your before school program offer:"].split(",")
    	self.after_school_program = self.inputs["Afterschool programs"].split(",")
    	self.after_school_program_offerings = self.inputs["Does your afterschool program offer:"].split(",")
    	self.multilingual_pathways = self.inputs["Multilingual Pathways"].split(",")
    	self.special_education = self.inputs["Special education classes"]
    	self.student_support_programs = self.inputs["Student support programs"]
    	self.arts = self.inputs["Arts enrichment"]
    	self.academics = self.inputs["Academic enrichment"]
    	self.middle_school_feeder = self.inputs["Middle school feeder"]


    def __repr__(self):
    	return self.name

    def __str__(self):
    	return self.name
