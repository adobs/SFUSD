import json

def get_ctip1_information():
	with open('static/json/ctip1.json', 'r') as f:
		ctip1string = f.read()

	ctip1 = json.loads(ctip1string) 
	# print "Ctip1 is ", ctip1
	# print "\n\n\n\n\n ctp1['layers'][0]", ctip1['layers'][0]['featureSet']['features'][0]['geometry']['rings'][0], ":)"
	features = ctip1['layers'][0]['featureSet']['features']

	ctipxy = []
	for feature in features:
		xy_list = feature["geometry"]["rings"][0]
		ctipxy.append(xy_list)

	# print "ctipxy2 ", ctipxy[1]
	print "ctip length is ", len(ctipxy)
	print "len(ctip[3] ", len(ctipxy[3])
	return ctipxy