def get_checkbox_headers():
	""" Determines which check box headers will be populated """

	# After School Extracurriculars = the column After School Program Offerings
	# Before School Extracurriculars = the column Before School Program Offerings

	# To edit: if REDUCING the number of headers, will have to edit the jinja in the HTML
	# To edit: if changing any string, nothing else required

	headers = [
				"Grades Served", "Neighborhood", "Multilingual Pathways", 
				"Before School Program", "Before School Extracurriculars", 
				"After School Program", "After School Extracurriculars", "Time"
			]

	return headers