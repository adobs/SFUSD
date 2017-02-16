"""
parse_csv.py

File creates a list of School objects based on the input csv file
"""
import csv
from school import School
import googlemaps 
from sklearn.externals import joblib

def read_csv():
	""" Read csv file and create School objects from it """

	school_objects_list = []

	# TODO strip all input of spaces

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


	""" If adding a new school, uncomment the below code ONCE to run the fix_neighborhoods code.  
	 The result of the code is pickled, so the new neighborhood information will persist over new sessions  """
	# joblib.dump(fix_neighborhoods(school_objects_list), 'static/pkl/school_objects.pkl')

	school_objects_list = joblib.load('static/pkl/school_objects.pkl')

	return school_objects_list


def fix_neighborhoods(school_objects_list):
	""" Rewrite neighborhoods based on Google Maps and Lat/Long column """
	
	gmaps = googlemaps.Client(key='AIzaSyA6Q8s8XrW3FwGSp_D8vQUtZxBDjc3RnDs')
	
	output = []

	for school in school_objects_list:
		lat = float(school.lat)
		lng = float(school.long)
		reverse_geocode_result = gmaps.reverse_geocode((lat, lng))
		neighborhood = reverse_geocode_result[0]["address_components"][2]["long_name"]
		school.neighborhood = neighborhood
		output.append(school) 
	
	return output

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
		neighborhood.update([school.neighborhood])
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


	unique_content = {"grades_served": grades_sorted(grades_served), 
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
			and (school.before_school_program != "" or school.before_school_program_offerings != "")
			and [multilingual_pathways for multilingual_pathways in matching_parameters["multilingual_pathways"] if multilingual_pathways in school.multilingual_pathways or "" in school.multilingual_pathways]  
			and (school.after_school_program != "" or school.after_school_program_offerings != "")):
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
		   						   "principal": school.principal,
		   						   "grades_served": school.grades_served})

	return output_schools


def get_sf_googlemapspolygon_coordinates():
	# {name of region: [{lat, lng}], name of region1: [{lat, lng}]}
	sf_googlemaps_coordinates_dict = {}

	sf_coordinates = csv.DictReader(open('data_transformation/sf_address1617.csv', 'rU'), dialect=csv.excel_tab, delimiter=",")
	for sf_coordinate in sf_coordinates:
		aaname = sf_coordinate["aaname"]
		place_id = sf_coordinate["place_id"]
		# lat = sf_coordinate["lat"]
		# lng = sf_coordinate["lng"]
		ctip = sf_coordinate["ctip"]
		# sfaddress = sf_coordinate["sfaddress"]
		# sf_googlemaps_coordinates_dict[place_id] = sf_googlemaps_coordinates_dict.get(aaname, [])
		sf_googlemaps_coordinates_dict[place_id] = {"ctip": ctip, "aaname": aaname, "place_id": place_id}


	return sf_googlemaps_coordinates_dict


def write_to_sf_csv(place_ids_dict):

	reader = csv.DictReader(open('data_transformation/sf_address1617.csv', 'rU'), dialect=csv.excel_tab, delimiter=",")
	out_file = open("data_transformation/sf_address1617_edited.csv", "wb")
	writer = csv.writer(out_file)
	for row in reader:
		sfaddress = row["sfaddress"]
		ctip = row["ctip"]
		aaname = row["aaname"]
		place_id = place_ids_dict[sfaddress]
		writer.writerow(sfaddress, place_id, aaname, ctip)

	return "success"

