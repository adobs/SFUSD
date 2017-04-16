/**
 * map.js - creation of map and map objects such as markers, info windows, and handling of markers on user-generated events
 *
 * INIT
    initGoogleMaps
    initAutocomplete
    initMapInfo
 * 
 * PRIVATE FUNCTIONS
    getCookies
    createMarker
    filterMarkers
    showMarkers
    removeAllMarkers
    getHtml
    getHomeMarkerHtml
    bindInfoWindow
    bindInfoWindowHomeMarker
    bindInfoWindowFavoriteStar
 *
 * EVENT HANDLERS
    onSubmit
 *
 * AJAX CALLBACKS
    addMarkers
 * 
 */

////////
/**
 * INIT
 */
////////

/**
 * initGoogleMaps - creates a new Google maps instance, centered in San Francisco
 *
 * @return     {Google Map Object}  google maps map object
 */
function initGoogleMaps() {

    var SF_LAT = 37.760099;
    var SF_LNG = -122.434633;
    var center = { lat: SF_LAT, lng: SF_LNG };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: center,
        draggable: true
    });

    var tabBtn = document.getElementById("tab-btn");
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(tabBtn);
    
    return map;
}

/**
 * initAutoComplete - creates the autocomplete search box for users to enter in home address
 */
function initAutocomplete() {
   
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    
    var windowWidth = $(window).width();
    // if (gtMdWidth) {
        var inputDiv = document.createElement('div');
    
        inputDiv.appendChild(input);

        inputDiv.index = 1;

        var homeSearch = document.getElementById("home-search");
        homeSearch.appendChild(inputDiv);

    if (!gtMdWidth) {
        var searchBarWidth = $(window).width() - 70;
        $(".pac-card").width(searchBarWidth);
        $("#pac-input").width(searchBarWidth);     
    }

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
           return;
        }

        // Clear out the old markers.
        if (homeMarker) {
            homeMarker.setMap(null);
        }
        homeMarker = null;

        if (homeInfoWindow.content) {
            homeInfoWindow.content = undefined;
        }
        
        // For each place, get the icon, name and location.
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            // Create a marker for each place.
            homeMarker = new Marker({
                map: map,
                position: place.geometry.location,
                icon: {
                    path: SQUARE_PIN,
                    fillColor: "#fad355",
                    fillOpacity: 1,
                    strokeColor: '#000',
                    strokeWeight: 1,
                    scale: 0.7
                },
                map_icon_label: '<div class="map-icon-label-div" id="home-label">HOME<br>&nbsp;<br>&nbsp;</div>'

            });
            
            bindInfoWindowHomeMarker(homeMarker, map);
            
            // Bias the SearchBox results towards current map's viewport.
            isOnlyAttendanceArea = false;
            $("#map-choices-form").submit();
   
            map.setCenter(place.geometry.location);

        });
    });
}

/**
 * initMapInfo - sets up the map, populates information using AJAX
 */
function initMapInfo() {
    $.get("/map-checked.json", addMarkers);
    $.get("/attendance-area-coordinates.json", populateAttendanceAreaPolygon);
    $.get("/ctip1-area-xy-coordinates.json", populateCtip1Polygon);
    $("input:checkbox").on("change", onCheckboxChange);
    $("#show-favorites-btn").on("click", onShowFavoritesModal);
}

////////////////////
/**
 * PRIVATE FUNCTIONS
 */
////////////////////

/**
 * getCookies - decodes a given cookie
 *
 * @param      {String}  cookieName  - name of cookie to retrieve
 * @return     {String}              - empty string
 */
function getCookies (cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

/**
 * createMarker - creates a new marker, with custom info and custom design
 *
 * @param      {Number}  lat                   The lat
 * @param      {Number}  lng                   The lng
 * @param      {String}  name                  The name
 * @param      {String}  address               The address
 * @param      {String}  phone                 The phone
 * @param      {String}  gradesServed          The grades served
 * @param      {String}  citySchool            The city school
 * @param      {String}  multilingualPathways  The multilingual pathways
 * @param      {String}  beforeSchool          The before school
 * @param      {String}  afterSchool           The after school
 * @return     {Marker}  { description_of_the_return_value }
 */
function createMarker (lat, lng, name, address, phone, gradesServed, citySchool, multilingualPathways, beforeSchool, afterSchool) {
    var position = {lat: lat, lng: lng};

    var fillColor;
    var grade;
    switch(gradesServed) {
        case "9-12":
            fillColor = '#414141';
            grade = "High";
            break;
        case "6-8":
            fillColor = '#87CCE2';
            grade = "Mid";
            break;
        default: 
            fillColor = '#F54900';
            grade = "Elem";
            break;
    }

    var marker = new Marker({
        name: name,
        customInfo: {
            starred: "unstarred", 
            type: "marker", 
            citySchool: citySchool, 
            multilingualPathways: multilingualPathways,
            gradesServed: gradesServed,
            beforeSchool: beforeSchool,
            afterSchool: afterSchool,
            name: name, 
            address: address, 
            phone: phone, 
            lat: lat, 
            lng: lng
        },
        map: map,
        position: position,
        icon: {
            path: SQUARE_PIN,
            fillColor: fillColor,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 0,
            scale: 0.7
        },
        optimized: false,
        zIndex: -1,
        map_icon_label: '<div class="map-icon-label-div">'+ grade +  '<br><span class="map-icon map-icon-school"><span class="marker-label"></span></span><br>&nbsp;</div>'  
    });

    return marker;
}

/**
 * filterMarkers - shows/hides markers based on filter criteria checked by the user
 *
 * @param      {String[]}  checkedGradesServed  - The currently checked grades served
 * @param      {String[]}  checkedCitySchool    - The currently checked city school
 * @param      {String[]}  checkedMP            - The currently checked multilingual programs
 * @param      {String[]}  checkedBeforeSchool  - The currently checked before school
 * @param      {String[]}  checkedAfterSchool   - The currently checked after school
 * @return     {Promise}   fulfill promise
 */
function filterMarkers (checkedGradesServed, checkedCitySchool, checkedMP, checkedBeforeSchool, checkedAfterSchool) {
    
    var filterMarkersFn = function(marker, index, array) {
        var customInfo = marker.customInfo;
        marker.setMap(null);
        if (marker.customInfo.starMarker) {
            marker.customInfo.starMarker.setMap(null);
        }
        
        var isGradeServed = false;
        checkedGradesServed.forEach(function(gradesServed) {
            if (!marker.customInfo.gradesServed || marker.customInfo.gradesServed === gradesServed) {
                isGradeServed = true;
            }
        });

        var isCitySchool = false;
        checkedCitySchool.forEach(function(citySchool) {        
            if (!marker.customInfo.citySchool || marker.customInfo.citySchool === citySchool) {
              isCitySchool = true;
            }
        });

        var isMultilingualPathways = false;
        if (marker.customInfo.multilingualPathways) {
            checkedMP.forEach(function(multilingualPathways) {
                for (var i=0; i<marker.customInfo.multilingualPathways.length; ++i) {
                    if (!marker.customInfo.multilingualPathways[i] || marker.customInfo.multilingualPathways[i] === multilingualPathways) {
                        isMultilingualPathways = true;
                    }
                }
            });
        } else {
            isMultilingualPathways = true;
        }
     
        var isBeforeSchool = false;
        checkedBeforeSchool.forEach(function(beforeSchool) {
            if (!marker.customInfo.beforeSchool || marker.customInfo.beforeSchool === beforeSchool) {
                isBeforeSchool = true;
            }
        });

        var isAfterSchool = false;
        checkedAfterSchool.forEach(function(afterSchool) {
            if (!marker.customInfo.afterSchool || marker.customInfo.afterSchool === afterSchool) {
                isAfterSchool = true;
            }
        });
        
        if (isGradeServed && isCitySchool && isMultilingualPathways && isBeforeSchool && isAfterSchool) {
            marker.setMap(map);
            if (marker.customInfo.starred === "starred" && marker.customInfo.type !== "starMarker") {
                marker.customInfo.starMarker.setMap(map);
            }
        }
    }
    markers.forEach(filterMarkersFn);
    repopulateStarMarkers();

    return Promise.resolve();
}

/**
 * showMarkers - shows all markers on map
 */
function showMarkers () {
    for (var i=0; i<markers.length; ++i) {
        var marker = markers[i];
        marker.setMap(map);
        if (marker.customInfo.starred === "starred") {
            marker.customInfo.starMarker.setMap(map);
        }
    }
}

/**
 * removeAllMarkers - removes all markers from map by doing "setMap(null)" on every marker
 */
function removeAllMarkers() {
    for (var i = 0; i < markers.length; ++i) {
        var marker = markers[i];
        marker.setMap(null);
        marker.customInfo.starMarker.setMap(null);
    }
}

/**
 * getHtml - creates the HTML for the marker info window
 *
 * @param      {String}  name          - The name
 * @param      {string}  gradesServed  - The grades served 
 * @param      {string}  startTime     - The start time
 * @param      {string}  endTime       - The end time
 * @param      {string}  principal     - The principal
 * @param      {string}  address       - The address
 * @param      {String}  phone         - The phone number
 * @param      {String}  fax           - The fax number
 * @param      {string}  email         - The email address
 * @param      {String}  website       - The website
 * @param      {String}  lat           - The lat
 * @param      {String}  lng           - The lng
 * @param      {String}  citySchool    - The city school status (yes / no)
 * @return     {String}  The html.
 */
function getHtml (name, gradesServed, startTime, endTime,
                        principal, address, phone, fax, email, website, lat, lng, citySchool) {

    var shortAddress = address.split(",")[0];
    var html =
        '<div id="info-window-content" data-address="' + address + '" data-lat="' + lat + '" data-lng="' + lng + '" data-name="' + name + '" data-citySchool="' + citySchool + '">' +
            '<div id="favorite-star-div">' + 
                '<button type="button" id="favorite-star-btn" aria-label="Left Align">' +
                    '<span id="favorite-star" class="glyphicon glyphicon-star-empty" aria-hidden="true"></span>' + 
                '</button>' +
            '</div>' + 
            '<div id="content" data-name="' + name + '" data-address="' + address + '" data-phone="' + phone + '" data-email="' + email + '" data-website="' + website + '">' +
                '<b>' + name + '</b><br>' +
                '<b>Grades Served: </b>' + gradesServed + '<br>' +
                '<b>Start Time: </b>'+ startTime + '<br>' +
                '<b>End Time: </b>'+ endTime + '<br>' +
                '<b>Principal: </b>'+ principal + '<br>' +
                '<span id="address"><b>Address: </b><a href="http://maps.google.com/maps?q=' + address.replace(/ /g, "+") + '">' + shortAddress + '</a></span><br>' +
                '<span id="city-wide"><b>City-Wide School: </b>' + citySchool + '<span id="info-sign-span"></span></span><br>' +
                '<b>Phone: </b>'+ '<a href="tel:' + phone +'">' + phone + '</a><br>' +
                '<b>Email: </b><a href="mailto:"' + email + '">' + email + '</a><br>' +
                '<b>Website: </b><span id="website-span"><a id="website">' + website + '</a></span><br>' +
            '</div>' +
            '<div id="directions-div">' +
                '<button id="directions-to-here" class="btn" onclick="onDirectionsToHere()">Directions</button><br>' +
            '</div>' +
        '</div>';
    
    return html;
}

/**
 * getHomeMarkerHtml - creates the HTML for the home marker info window
 *
 * @param      {Marker}  homeMarker  - The home marker
 * @param      {Object}  data        - The ctip data
 * @return     {String}  The home marker html
 */
function getHomeMarkerHtml (homeMarker, data) {
    var ctipBool = data.ctip ? "Tie-breaker" : "Not a tie-breaker";
    
    var html = '<div id="home-info-window-content">' +
            '<b>Test Score Area: </b>'+ ctipBool + '<br>' +
            '<b>Attendance Area: </b>'+ aaname + '<br>' +
            '<button id="show-attendance-area">Show only ' + aaname.toUpperCase() + ' schools</button>' +
        '</div>';
    
    return html;
}

/**
 * bindInfoWindow - binds click events to show correct html for a given marker's info window
 *
 * @param      {Marker}  marker  - The marker clicked on
 * @param      {Map}     map     - The map
 * @param      {String}  html    - The html for the info window
 */
function bindInfoWindow (marker, map, html) {
    
    google.maps.event.addListener(infoWindow,'closeclick',function(){
       directionsDisplay.setMap(null);
       directionsDisplay.setPanel(null);
    });

    google.maps.event.addListener(marker, 'click', function (event) {
       
        infoWindow.close();        
        if (marker.customInfo.starred === "unstarred") {
            html = html.replace(/glyphicon-star /, "glyphicon-star-empty "); 
            marker.customInfo.starMarker.setMap(null);
            
        } else if (marker.customInfo.starred === "starred") {
            html = html.replace(/glyphicon-star-empty/, "glyphicon-star");
            marker.customInfo.starMarker.setMap(map);
        }  
        infoWindow.setContent(html);
        homeInfoWindow.close();
        infoWindow.open(map, marker);
        $("#favorite-star-btn").on("click", onFavoriteStarClick.bind(this, marker));
   
    });
}

/**
 * bindInfoWindowHomeMarker - binds click events to show correct html for the home marker info window
 *
 * @param      {Marker}  homeMarker  - The home marker clicked on
 * @param      {Map}     map         - The map
 */
function bindInfoWindowHomeMarker (homeMarker, map) {
    var ctip = false;
    
    google.maps.event.addListener(homeMarker, "click", function(event) { 
        attendanceAreaPolygonArray.forEach(function(element, index, array) {
            if (google.maps.geometry.poly.containsLocation(event.latLng, element)) {
                aaname = element.name; 
                aarea = element;
            }
        });

        ctip1PolygonArray.forEach(function(element, index, array) {
            if (google.maps.geometry.poly.containsLocation(event.latLng, element)) {
                ctip = true;
            } 
        });
        html = getHomeMarkerHtml(homeMarker, { ctip: ctip });
        
        homeInfoWindow.close();
        if (homeInfoWindow.content === undefined || homeInfoWindow.content === html) {
            homeInfoWindow.setContent(html);
           
        } else {
            var resetContent = html.replace(/Show only .* schools/, 'Reset');
            homeInfoWindow.setContent(resetContent);
        }

        infoWindow.close();
        homeInfoWindow.open(map, homeMarker);

        $("#show-attendance-area").on("click", onShowAttendanceArea);
    });

    google.maps.event.addListener(homeInfoWindow,'closeclick',function(){
       directionsDisplay.setMap(null);
       directionsDisplay.setPanel(null);
    });
    
}

/**
 * bindInfoWindowFavoriteStar - binds click events to show correct html for a star marker's info window
 *
 * @param      {Marker}  starMarker  - The star marker clicked on
 * @param      {Map}     map         - The map
 * @param      {String}  html        - The html for the info window
 */
function bindInfoWindowFavoriteStar(starMarker, map, html) {
    google.maps.event.addListener(starMarker, 'click', function(event) {
        infoWindow.close();
        for (var i=0; i<markers.length; ++i) {
            if (markers[i].customInfo.starMarker === starMarker) {
                marker = markers[i];
                break;
            }
        }

        if (marker.customInfo.starred === "unstarred") {
            html = html.replace(/glyphicon-star /, "glyphicon-star-empty ");
            marker.customInfo.starMarker.setMap(null);
            
        } else if (marker.customInfo.starred === "starred") {
            html = html.replace(/glyphicon-star-empty/, "glyphicon-star");
            marker.customInfo.starMarker.setMap(map);
        }  
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
        $("#favorite-star-btn").on("click", onFavoriteStarClick.bind(this, marker));
        
       
    });
}

/////////////////
/**
 * EVENT HANDLERS
 */
/////////////////

/**
 * onSubmit - event handler for when submitting the map choices form
 *
 * @param      {Event}  e       - event object
 */
function onSubmit(e) {
    e.preventDefault();

    var checkedInputs = $("#map-choices-form").serializeArray();
    
    var checkedGradesServed = [];
    var checkedCitySchool = []; 
    var checkedMP = [];
    var checkedBeforeSchool = []; 
    var checkedAfterSchool = [];

    for (var i=0; i<checkedInputs.length; ++i) {
        var checkedInput = checkedInputs[i];
        var name = checkedInput.name;
        var value = checkedInput.value;

        if (name === "g-s") {
            checkedGradesServed.push(value);
        } else if (name === "c-s") {
            checkedCitySchool.push(value);
        } else if (name === "b-s-p") {
            checkedBeforeSchool.push(value);
        } else if (name === "m-p") {
            checkedMP.push(value);
        } else if (name === "a-s-p") {
            checkedAfterSchool.push(value);
        }
    }   

    filterMarkers(checkedGradesServed, checkedCitySchool, checkedMP, checkedBeforeSchool, checkedAfterSchool)
    .then(function() {
        if (isOnlyAttendanceArea) {
            showOnlyAttendanceArea();
        } else {
            resetAttendanceArea();
        }
        if (homeMarker) {
            homeMarker.setMap(map);
        }
    });
}

//////////////////
/**
 * AJAX CALLBACKS
 */
//////////////////

/**
 * addMarkers - AJAX callback that adds all markers to map based on data passed in
 *
 * @param      {JSON}  data    - The data returned from backend of all marker information
 */
function addMarkers (data){
    removeAllMarkers();

    data = JSON.parse(data);
    
    for (var i=0; i<data.length; ++i){
        var school = data[i];
        var lat = parseFloat(school.lat);
        var lng = parseFloat(school.long);

        var name = school.name;
        var citySchool = school.city_school[0];
        var startTime = school.start_time;
        var endTime = school.end_time;
        var principal = school.principal;
        var address = school.address;
        var phone = school.phone_number;
        var fax = school.fax_number;
        var email = school.email;
        var website = school.website;
        var gradesServed = school.grades_served[0];
        var multilingualPathways = school.multilingual_pathways;
        var beforeSchool = school.before_school_program;
        var afterSchool = school.after_school_program;
        

        var html = getHtml(name, gradesServed, startTime, endTime,
                        principal, address, phone, fax, email, website, lat, lng, citySchool);

        var marker = createMarker(lat, lng, name, address, phone, gradesServed, citySchool, multilingualPathways, beforeSchool, afterSchool);
        var starMarker = new Marker({
            name: name,
            customInfo: {marker: marker, starred: "unstarred", type: "starMarker", citySchool: citySchool, name: name, address: address, phone: phone, citySchool, lat: lat, lng: lng},
            position: {lat: lat, lng: lng},
            icon: "static/img/star.png",
            map: null,
            optimized: false,
            zIndex: 1000,
        });
        marker.customInfo.starMarker = starMarker;
        marker.customInfo.html = html;
        markers.push(marker);
        starMarkers.push(starMarker);
        bindInfoWindow(marker, map, html);
        bindInfoWindowFavoriteStar(starMarker, map, html);
    }
    
    updateStarMarkers();
    updateFavoritesTable();

    $("#map-choices-form").submit();
}
