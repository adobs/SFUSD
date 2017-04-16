import json

def get_ctip1_information():
	""" Using ctip1.json file, parses the ctip xy coordinates"""
	with open('static/json/ctip1.json', 'r') as f:
		ctip1string = f.read()

	ctip1 = json.loads(ctip1string) 
	features = ctip1['layers'][0]['featureSet']['features']

	ctipxy = []
	for feature in features:
		xy_list = feature["geometry"]["rings"][0]
		ctipxy.append(xy_list)

	return ctipxy