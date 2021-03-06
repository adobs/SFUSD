"""
parse_csv.py

File creates a list of School objects based on the input csv file
"""
import csv
from school import School
import googlemaps 


def flatten_school_object_to_json(school_objects_list):
	""" Returns list of school JSON objects to be used in AJAX instead of Python School Class objects"""
	
	output_schools = []
	for school in school_objects_list:
		output_schools.append(school.flatten())

	return output_schools


def get_schools():
	""" Read csv file and create School objects from it """

	school_objects_list = []
	
	elementary_schools = csv.DictReader(open('data_transformation/2017-18 Elementary School Description- Responses.csv', 'rU'), dialect=csv.excel_tab, delimiter=",")
	middle_schools = csv.DictReader(open('data_transformation/2017-18 Middle School Description- Responses.csv', 'rU'), dialect=csv.excel_tab, delimiter=",")
	high_schools = csv.DictReader(open('data_transformation/2017-18 High School Description- Responses.csv', 'rU'), dialect=csv.excel_tab, delimiter=",")
	
	for elementary_school in elementary_schools:
		new_school_object = School(elementary_school)
		school_objects_list.append(new_school_object)

	for middle_school in middle_schools:
		new_school_object = School(middle_school)
		school_objects_list.append(new_school_object)

	for high_school in high_schools:
		new_school_object = School(high_school)
		school_objects_list.append(new_school_object)

	# edit the multilingual pathways and before/after school programs
	school_objects_list = fix_school_programs(school_objects_list)
	school_objects_list = fix_multilingual_pathways(school_objects_list)
	return school_objects_list

def fix_multilingual_pathways(school_objects_list):
	""" Condense the inputs for Multilingual Pathways (e.g. Cantonese Biliteracy Pathway => Cantonese """
	
	output_schools = []
	for school in school_objects_list:
		new_multilingual_pathway = []
		for multilingual_pathway in school.multilingual_pathways:
			first_word = multilingual_pathway.split(" ")[0]
			multilingual_pathway = multilingual_pathway if first_word == "All" else first_word
			new_multilingual_pathway.append(multilingual_pathway)

		school.multilingual_pathways = new_multilingual_pathway
		output_schools.append(school)

	return output_schools

def fix_school_programs(school_objects_list):
	""" """
	output_schools = []
	for school in school_objects_list:
		before_school_program = "No"
		after_school_program = "No"

		if school.before_school_program or school.before_school_program_offerings:
			before_school_program = "Yes"

		if school.after_school_program or school.after_school_program_offerings:
			after_school_program = "Yes"

		school.before_school_program = before_school_program
		school.after_school_program = after_school_program

		output_schools.append(school)
	return output_schools

def get_unique_row_data_from_specified_headers(school_objects_list):
	""" Based on HARDCODED specified identyfing column names, returns data to populate checkboxes """

	grades_served = set()
	city_school = set()
	start_time = set()
	end_time = set()
	multilingual_pathways = set()
	before_school_program = set() 
	before_school_program_offerings = set()
	after_school_program = set()
	after_school_program_offerings = set()

	for school in school_objects_list:
		grades_served.update(school.grades_served)
		city_school.update(school.city_school)
		start_time.update(school.start_time)
		end_time.update(school.end_time)
		multilingual_pathways.update(school.multilingual_pathways)
		before_school_program.update(school.before_school_program)
		before_school_program_offerings.update(school.before_school_program_offerings)
		after_school_program.update(school.after_school_program)
		after_school_program_offerings.update(school.after_school_program_offerings)

	# remove blank entries
	grades_served.discard("")
	city_school.discard("")
	start_time.discard("")
	end_time.discard("")
	multilingual_pathways.discard("")
	before_school_program.discard("")
	before_school_program_offerings.discard("")
	after_school_program.discard("")
	after_school_program_offerings.discard("")
		
	def grades_sorted(grades):
		grades = list(grades)

		pre = []
		k = []
		number = []
		
		output = []

		for grade in grades:
			if grade[0] == "P":
				pre.append(grade)
			elif grade[0] == "K":
				k.append (grade)
			else:
				number.append(grade)

		pre.sort()
		k.sort()
		number.sort()
		[output.append(element) for element in pre]
		[output.append(element) for element in k]
		[output.append(element) for element in number]

		return output

	# unique content is in alphabetical order
	unique_content = {"grades_served": grades_sorted(grades_served), 
					  "city_school": reversed(sorted(city_school)),
					  "start_time": sorted(start_time), 
					  "end_time": sorted(end_time), 
					  "multilingual_pathways": sorted(multilingual_pathways),
					  "before_school_program": sorted(before_school_program),
					  "before_school_program_offerings": sorted(before_school_program_offerings),
					  "after_school_program": sorted(after_school_program),
					  "after_school_program_offerings": sorted(after_school_program_offerings)}
	
	return unique_content

