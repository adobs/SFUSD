# README for SFUSD:ComparisonTool

# Table of Contents

* [Setup](#setup)

* [Data Sources](#datasources)

* [Usage](#usage)

* [Tech Stack](#techstack)

* [APIs and Third-Party Libraries Used ](#api)

* [Next Steps](#nextsteps)


----
## <a name=“setup”></a>Setup

### Dependencies and Compatibility

### Installation

* Suggestion: create a virtual environment for the project  ```$ virtualenv env```.

* Activate the environment ```$ source env/bin/activate```.


### Install requirements 
* ```$ pip install -r requirements.txt```

* From the command line of the terminal, navigate to this location in the file system and run ```$ python comparison_tool.py```.

* In a browser window, type localhost:5000 to access the home page


# <a name=datasources></a>Data Sources

### Data Clean
There are 3 sources of data that come from SFUSD:
1. Elementary schools data (csv file)
2. Middle schools data (csv file)
3. High schools data (csv file)

There are 2 sources of data that were found on the internet:
1. Low test score information (/static/json/ctip1.json)
Originally found at (https://www.arcgis.com/home/item.html?id=18d875f6d25b468489b0c6e440f3ddc6), put up by Tomas, who has since removed it
2. Attendance area information (/static/kml/esaa.xml)
Originally found at (http://enrollinschool.org/lookup/maps/)

First, clean all data.  Ensure that there is only one logical response. The following columns are used, with relevant cleanup instructions:
* School name
* Grades served - should be one of the following: [PreK-5, PreK-8, K-5, K-8, 6-8, 9-12]; nothing else
* School address - VERY IMPORTANT - must get the Google Maps version of all addresses - not just the raw input
* School start time
* School end time
* School phone number - consistent formatting means it should be (XXX) XXX-XXXX
* School website link - must have leading "http://"
* Before school programs - formatting not necessary, binary check to see if programs exist or not
* Does your before school program offer: - formatting not necessary, binary check to see if programs exist or not
* Afterschool programs - formatting not necessary, binary check to see if programs exist or not
* Does your afterschool program offer: - formatting not necessary, binary check to see if programs exist or not
* Multilingual Pathways
* City School - needs to say "Yes" or "No" or "N/A" (for middle + high)

Second, add the following Columns, using the EXACT title, and populate for each school:
* Lat - using Google maps, get the exact Lat degrees of the school address
* Long - using Google maps, get the exact Lat degrees of the school address

----
## <a name=“usage”></a>Usage

### Tie Breaker Hierarchy buttons
Provide information on tie breaker hierarchies for different school levels

### Home address search
Enter home address in search bar.  Google maps autocomplete enabled.  This will drop a marker on the map of where home is.  Clicking on home marker reveals more information, such as whether or not it is in a tie-breaker zone based on test scores, as well as the attendance area the home is in.  There is a button that when clicked, shows the perimeter of the attendance area and the schools that are within its bounds.

### Checkboxes/ Markers
Selecting/deselecting checkboxes automatically repopulates the map with markers that represent the schools that fit the criteria selected.  Markers are color-coded based on the grades served.  Clicking on a marker reveals an infowindow, that has additional demographic information about the school.  Additionally, there is a button that says "Directions"; when clicked, it will open up another panel displaying Google maps directions to the given school.

### Favorites Table
Only visible on desktop (not mobile), there is a feature where users can favorite/ star schools.  To do so, a user clicks on the star logo on the upper right corner of a school's info window.  To see all the favorited schools in tabular form, user can click the button "Compare My Favorite Schools".  A modal window will display a table of all the schools, in user-ranked order, of favorited schools.  Here, there is an option to print (print and/or save to PDF).

## <a name=“techstack"></a>Tech Stack

* Python
* Flask
* AJAX
* Javascript 
* jQuery 
* Promises
* Jinja 
* HTML 
* CSS
* Bootstrap
* KML

----
## <a name=“api”></a>APIs and Third-Party Libraries Used 

### APIs
* [Google Maps](https://developers.google.com/maps/?hl=en)
* [ArcGIS](https://developers.arcgis.com/javascript/3/)

### Third-Party Libraries
* [jquery](https://jquery.com/)
* [simple-sidebar](https://github.com/dcdeiv/simple-sidebar)
* [map-icons](http://map-icons.com/)


## <a name=“nextsteps”>NextSteps</a>Next Steps

### Refining
* SFUSD needs to have parents and other targeted users in focus groups to test the site on both desktop and mobile, cross multiple popular browsers
* SFUSD needs to iterate in response to focus group results
* Edit the image so it's smoother background (notebook on blue background)
* This project should be open source.  Will have free help, free publicity, etc

### Integration
* SFUSD needs to get their own developer key for the Google maps API (currently using Alexandra Dobkin's personal key)
* SFUSD needs to have a decided URL that points to this page
* SFUSD needs to have a clear link on the main SFUSD page

### Future Enhancements
* fix modal window row sizing on Mozilla Firefox
* add an FAQ / how to use page
* add in google analytics to the page
* fix overlapping marker icons
* add in a tally of # of elem / middle / high schools matched and put in upper right corner on map
* write tests 
* refactor
* streamline data sources, so when things change, it is easily updated