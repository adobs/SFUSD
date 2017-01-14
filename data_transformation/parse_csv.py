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
	print "************* IN READ_CSV"
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
		grades_served.add(school.grades_served)
		start_time.add(school.start_time)
		end_time.add(school.end_time)
		neighborhood.add(school.neighborhood)
		multilingual_pathways.add(school.multilingual_pathways)
		before_school_program.add(school.before_school_program)
		before_school_program_offerings.add(school.before_school_program_offerings)
		after_school_program.add(school.after_school_program)
		after_school_program_offerings.add(school.after_school_program_offerings)

	unique_content = {"grades_served": sorted(grades_served), 
					  "start_time": sorted(start_time), 
					  "end_time": sorted(end_time), 
					  "neighborhood": sorted(neighborhood),
					  "multilingual_pathways": sorted(multilingual_pathways),
					  "before_school_program": sorted(before_school_program),
					  "before_school_program_offerings": sorted(before_school_program_offerings),
					  "after_school_program": sorted(after_school_program),
					  "after_school_program_offerings": sorted(after_school_program_offerings)}
	print "!!!!!!!!!!!!!!!!!!!! IN GET_UNIQUE_ROW_DATA"
	print "before_school_program_offerings: ", before_school_program_offerings
	return unique_content

# def parse_list_responses(school_objects_list):
	# Before school programs
	# Does your before school program offer
	# Afterschool programs
	# Does your afterschool program offer
	# Multilingual pathways
	# Special education classes

	# Student support programs
	# Arts enrichment
	# Academic enrichment
	# Middle school feeder

# def parse_school_start_time(school_objects_list):
	# for school in school_objects_list:

def parse_phone_number(school_objects_list):
	numbers = range(10);

	for school in school_objects_list:
		phone_number = []
		fax_number = []

		for digit in school.phone_number:
			try:
				if int(digit) in numbers:
					phone_number.append(digit)
			except:
				continue
		

		for digit in school.fax_number:
			try:
				if int(digit) in numbers:
					fax_number.append(num)
			except:
				continue

		phone_number[-4:-4] = "-"
		fax_number[-4:-4] = "-"
		phone_number[3:3] = ") "
		fax_number[3:3] = ") "
		phone_number[0:0] = "("
		fax_number[0:0] = "("


		school.phone_number = "".join(phone_number)
		school.fax_number = "".join(fax_number)

	return school_objects_list
