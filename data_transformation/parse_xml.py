from bs4 import BeautifulSoup

def get_xml_information():
	# return a list of dictionaries [{name: [coordinates]}]
	# where coordinates = [lat, lng] (input data is lng, lat)
	soup = BeautifulSoup(open('static/kml/esaa.xml').read(), 'html.parser')

	esaa_boundaries = []
	for placemark in soup.find_all('placemark'):
		name = placemark.find('name').contents[0]
		coordinates = placemark.find_all('coordinates')

		edited_coordinates_list = []
			
		for coordinate in coordinates:
			parsed_coordinates = coordinate.contents[0].split(",")
			for i in range(0, len(parsed_coordinates) - 1, 2):
				lat_lng = {}
				# print "parsed_coordinates[",i,",]=", parsed_coordinates[i]
				lat_lng = {
					"lat": parsed_coordinates[i+1].strip("0"),
					"lng": parsed_coordinates[i].strip("0")
				}
				edited_coordinates_list.append(lat_lng)


		esaa_boundaries.append({name: edited_coordinates_list})

	print "ESAAA BOUND:: ", esaa_boundaries