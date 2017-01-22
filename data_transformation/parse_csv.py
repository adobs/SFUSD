"""
parse_csv.py

File creates a list of School objects based on the input csv file
"""
import csv
from school import School

def read_csv():
	""" Read csv file and create School objects from it """

	school_objects_list = []

	# TODO strip all input of spaces

	schools = csv.DictReader(open('data_transformation/input_data.csv', 'rU'), dialect=csv.excel_tab, delimiter=",")
	
	for school in schools:
		new_school_object = School(school)
		school_objects_list.append(new_school_object)

	# parse_phone_number(school_objects_list)

	# TODO -> freeze this (pickle)? so this doesn't have to be read every single time, just if the file has change
	return school_objects_list

def get_unqiue_row_data_from_specified_headers(school_objects_list):
	""" Based on HARDCODED specified identyfing column names, returns data to populate checkboxes """

	grades_served = set()
	start_time = set()
	end_time = set()
	neighborhood = set()
	multilingual_pathways = set()
	before_school_program = set() 
	before_school_program_offerings = set()
	after_school_program = set()
	after_school_program_offerings = set()

	for school in school_objects_list:
		grades_served.update(school.grades_served)
		start_time.update(school.start_time)
		end_time.update(school.end_time)
		neighborhood.update(school.neighborhood)
		multilingual_pathways.update(school.multilingual_pathways)
		before_school_program.update(school.before_school_program)
		before_school_program_offerings.update(school.before_school_program_offerings)
		after_school_program.update(school.after_school_program)
		after_school_program_offerings.update(school.after_school_program_offerings)

	# remove blank entries
	grades_served.discard("")
	start_time.discard("")
	end_time.discard("")
	neighborhood.discard("")
	multilingual_pathways.discard("")
	before_school_program.discard("")
	before_school_program_offerings.discard("")
	after_school_program.discard("")
	after_school_program_offerings.discard("")
	
	unique_content = {"grades_served": sorted(grades_served), 
					  "start_time": sorted(start_time), 
					  "end_time": sorted(end_time), 
					  "neighborhood": sorted(neighborhood),
					  "multilingual_pathways": sorted(multilingual_pathways),
					  "before_school_program": sorted(before_school_program),
					  "before_school_program_offerings": sorted(before_school_program_offerings),
					  "after_school_program": sorted(after_school_program),
					  "after_school_program_offerings": sorted(after_school_program_offerings)}
	return unique_content


def get_matching_schools(school_objects_list, matching_parameters):
	output_schools = []
	for school in school_objects_list:
		if ([neighborhood for neighborhood in matching_parameters["neighborhood"] if neighborhood in school.neighborhood or "" in school.neighborhood] 
			and [grades_served for grades_served in matching_parameters["grades_served"] if grades_served in school.grades_served or "" in school.grades_served] 
			and [before_school_program for before_school_program in matching_parameters["before_school_program"] if before_school_program in school.before_school_program or "" in school.before_school_program]
			and [before_school_program_offerings for before_school_program_offerings in matching_parameters["before_school_program_offerings"] if before_school_program_offerings in school.before_school_program_offerings  or "" in school.before_school_program_offerings]
			and [multilingual_pathways for multilingual_pathways in matching_parameters["multilingual_pathways"] if multilingual_pathways in school.multilingual_pathways or "" in school.multilingual_pathways]  
			and [after_school_program for after_school_program in matching_parameters["after_school_program"] if after_school_program in school.after_school_program or "" in school.after_school_program]
			and [after_school_program_offerings for after_school_program_offerings in matching_parameters["after_school_program_offerings"] if after_school_program_offerings in school.after_school_program_offerings or "" in school.after_school_program_offerings]):  
		   	output_schools.append({"name": school.name, 
		   						   "start_time": school.start_time,
		   						   "end_time": school.end_time,
		   						   "address": school.address,
		   						   "lat": school.lat,
		   						   "long": school.long,
		   						   "phone_number": school.phone_number,
		   						   "website": school.website,
		   						   "email": school.email,
		   						   "fax_number": school.fax_number,
		   						   "middle_school_feeder": school.middle_school_feeder,
		   						   "principal": school.principal})

	return output_schools
