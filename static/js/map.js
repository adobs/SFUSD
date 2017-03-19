// TODO

//// current list
// add cookies https://www.w3schools.com/js/js_cookies.asp
// cookies for the text in the form,
// cookies for the star markers 
// move 'setting up screen' to css
// clean all the data, perfect the addresses for all the schools using googlemaps
// fix on reverse driving directions buttons

// geolocating - add back old one, check for bounds in SF or notv get a better way of getting IP addresses so its from HTTPS and is more accurates 
// add the link to the SARC report?
// swap out the picture in the header

// fix logic for checkbox deselect all when there is nothing checked?
// add in a delete link at end of the home address to clear the button

//// mobile
// keep tab on right of left side nav
// change + - to >> << // invert the black and yellow
// make the search bar taller -> check google maps
// bring me to local
// add in a notification system for how to use / add instructions on the webpage
// look at zooming of markers
// change the filter link to be clickable in the button -> turn the whole thing into a button beveled


//// longer term considerations -- need to do
// city wide - show only city wide schools.  show no city wide school -- change the select all to "Show all schools"
// general / massive formatting
// add all relevant commenting to code
// add in remaining elementary school
// make map dynamically 100% height
// for the directions - have the destination not be latlong, but be the school address (once correctly formatted)

//// data clean
// compare number of schools in excel vs some other source
// add websites; confirm all websites are correct
// correctly label all city schools
// add in all emails
// fix instances of multiple addresses
// make addresses conform to google maps
// add in SARC url

//// formatting
// is the high school the right color?
// the whole notebook page fix

//// longer term condiersations -- nice to have
// add in google analytics to the page?
// fix overlapping icons
// add in a tally of # of elem / middle / high schools matched and put in upper right corner on map

///// to discuss with others
// photoshop for the images -> must fix
// send out my excels -> to add the SARC performance reports 
// rate limiting



var map;
var infoWindow = new google.maps.InfoWindow({
  width: 150
});
var homeInfoWindow = new google.maps.InfoWindow({
  width: 150
});
var MD_WIDTH = 992;
var gtMdWidth, originalMapWidth;
var aarea, aaname, isOnlyAttendanceArea;
var markers = [];
var homeMarker;
var starMarkers = [];
var infoWindowLat, infoWindowLng, infoWindowName;
var destinationLat, destinationLng;
var originAddress, destinationAddress;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();        

function initialize(latitude, longitude) {

    var lat = latitude || 37.760099;
    var lng = longitude || -122.434633;
    var center = { lat: lat, lng: lng };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: center,
        draggable: true
    });
    console.log("center is ", center);
    var currLocBtn = document.getElementById('curr-loc-btn');
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(currLocBtn);
    initAutocomplete();
   
    return map;
}


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

        resetAttendanceArea();
        if (homeInfoWindow.content) {
            homeInfoWindow.content = undefined;
        }
        
        // For each place, get the icon, name and location.
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            var image = new google.maps.MarkerImage(
                '/static/img/home.png',
                new google.maps.Size(32, 32),
                new google.maps.Point(0, 0),
                new google.maps.Point(0, 32),
                new google.maps.Size(25, 25)
            );

            // Create a marker for each place.
            homeMarker = new Marker({
                map: map,
                position: place.geometry.location,
                icon: {
                    path: SQUARE_PIN,
                    fillColor: "#fad355",
                    fillOpacity: 1,
                    strokeColor: '#000',
                    strokeWeight: 1
                },
                map_icon_label: '<span class="map-icon map-icon-map-pin"><span class="marker-label"><br>HOME</span></span>'
            });
            
            bindInfoWindowHomeMarker(homeMarker, map);
            // Bias the SearchBox results towards current map's viewport.
            map.setCenter(place.geometry.location);


        });
    
    });
}


function getHomeMarkerHtml (homeMarker, data) {
    // attendanceArea = data.aaname;
    var ctipBool = data.ctip ? "Tie-breaker" : "Not a tie-breaker";
    // aarea = data.aarea;

    var html = '<div id="home-info-window-content">' +
            '<b>Test Score Area: </b>'+ ctipBool + '<br>' +
            '<b>Attendance Area: </b>'+ aaname + '<br>' +
            '<button id="show-attendance-area">Show only ' + aaname.toUpperCase() + ' schools</button>' +
        '</div>';
    
    return html;
}

function resetAttendanceArea() {
    if (homeInfoWindow.content) {
        $("#show-attendance-area").html("Show only " + aaname.toUpperCase() + " schools");
        var resetContent = homeInfoWindow.content.replace(/Reset/, "Show only " + aaname.toUpperCase() + " schools");
        homeInfoWindow.setContent(resetContent);
    }

    $("#map-choices-form").submit();

    if (aarea) {
        aarea.setOptions({
            fillColor: "#000",
            fillOpacity: 0
        });
    }
}

function repopulateStarMarkers() {
    for (var i=0; i<markers.length; ++i) {
        for (var j=0; j<starMarkers.length; ++j) {
            var marker = markers[i];
            var starMarker = starMarkers[j];
            if (starMarker.customInfo.marker.name === marker.name && starMarker.customInfo.starred === "starred") {
                marker.customInfo.starred = "starred";
                marker.customInfo.starMarker.setMap(map);
            }
            
        }
    }
}

function showOnlyAttendanceArea() {
    if (!aarea) {
        return;
    }

    markers.forEach(function(marker, index, array) { 
        attendanceAreaPolygonArray.forEach(function(element) {

            if (google.maps.geometry.poly.containsLocation(marker.position, element) && element.name !== aaname) {
                marker.setMap(null);
                marker.customInfo.starMarker.setMap(null);
            
            } else if (google.maps.geometry.poly.containsLocation(marker.position, element) && element.name == aaname && marker.customInfo.citySchool === "Yes") {
                var name = marker.name;
                var starred = marker.customInfo.starred;
                var address = marker.customInfo.address;
                var phone = marker.customInfo.phone;
                var lat = marker.customInfo.lat;
                var lng = marker.customInfo.lng;
                var position = marker.position;
                
                // elem
                if (array[index].icon.fillColor === "#F54900") {
                    var fillColor = "#ff9f75";
                    var color = "#F54900";
                } else {
                    fillColor = array[index].icon.fillColor;
                    color = "#000"
                }
                
                var map_icon_label = marker.map_icon_label;
                var starMarker = marker.customInfo.starMarker;

                var html = marker.customInfo.html.replace(/id="city-wide"/, 'id="city-wide" style="color:' + color +'"').replace(/<span id="info-sign-span">/, '&nbsp;<span id="info-sign-span" class="glyphicon glyphicon-info-sign" aria-hidden="true" title="Attendance area tie-breaker does not apply for city-wide schools"></span>');    
                
                markers[index] = new Marker({
                                name: name,
                                customInfo: {html: html, starMarker: starMarker, starred: starred, type: "marker", citySchool: "Yes", name: name, address: address, phone: phone, lat: lat, lng: lng},
                                map: map,
                                position: position,
                                icon: {
                                    path: SQUARE_PIN,
                                    fillColor: fillColor,
                                    fillOpacity: 2,
                                    strokeColor: '#fff',
                                    strokeWeight: 0
                                },
                                optimized: false,
                                zIndex: -1,
                                map_icon_label: map_icon_label
                            });

                bindInfoWindow(markers[index], map, html);
                bindInfoWindowFavoriteStar(starMarker, map, html);
            }
            
        });

    });
    aarea.setOptions({
        fillColor: "#fad355",
        fillOpacity: 0.8
    });
}

function onShowAttendanceArea() {
    var color = "#000";
                   
    if (homeInfoWindow.content.indexOf("Reset") !== -1) {
        resetAttendanceArea();
        repopulateStarMarkers();
        isOnlyAttendanceArea = false;

    } else {
        isOnlyAttendanceArea = true;
        var resetContent = homeInfoWindow.content.replace(/Show only .* schools/, 'Reset');
        homeInfoWindow.setContent(resetContent);

        showOnlyAttendanceArea();
    }

    $("#show-attendance-area").on("click", onShowAttendanceArea);
}

// function onSubmitForm () {
//      $("#map-choices-form").submit();
//      if (!gtMdWidth) {
//         onHideFilters();
//      }
// }

function onReturn() {
    $("#wrapper").toggleClass("toggled");
    $("#directions-panel").hide();
     directionsDisplay.setMap(null);
     directionsDisplay.setPanel(null);
    // $("#map-choices-form").submit();
    showMarkers();
    $("#map").width(originalMapWidth);
    
}
function getDirections(origin, destination, travelMode) {
    var center = map.getCenter();
    // hide the left side nav
    $("#wrapper").toggleClass("toggled");
   
    var pageWidth = $("#page-content-wrapper").width() + 220;
    originalMapWidth = $("#map").width();
    
    var mapWidth = 0.75 * pageWidth - 30;
    var directionsWidth = 0.25 * pageWidth - 50;
    
    $("#map").width(mapWidth);

    map.setCenter(center);

    var request = {
        origin: origin, 
        destination: destination,
        travelMode: google.maps.DirectionsTravelMode[travelMode]
    };
    directionsDisplay.setMap(map);
    directionsService.route(request, function(response, status) {
        directionsDisplay.setPanel(document.getElementById("directions-panel"));
        directionsDisplay.setDirections(response); 
        $("#directions-panel").width(directionsWidth);
        $("#directions-panel").css("visibility", "visible");
        $("#directions-panel").show();
   
    });
    
    // hide markers and home marker and starMarkers
    removeAllMarkers();
    homeMarker.setMap(null)
    
}

function onToHere (travelMode) {
    var el = document.querySelector('#info-window-content');
    var destination = new google.maps.LatLng(infoWindowLat, infoWindowLng);
    if (!originAddress) {
        return;
    }
    getDirections(originAddress, destination, travelMode);
}

function onFromHere (travelMode) {
    var el = document.querySelector('#info-window-content');


    var origin = new google.maps.LatLng(infoWindowLat, infoWindowLng);
    // var destination = new google.maps.LatLng(destinationLat, destinationLng);
    if (!destinationAddress) {
        return;
    }
    getDirections(origin, destinationAddress, travelMode);
}

function onReverseFromHere() {
    
    var address = $("#address-input")[0].value;
    setOnDirectionsToHere(address);
}


function onReverseToHere() {
    var address = $("#address-input")[0].value;
    setOnDirectionsFromHere(address);
}


function setOnDirectionsToHere(address) {
    var html = 
        '<div id="instructions">' +
            '<div class="instructions-reverse">' +
               '<label for="address-input">Start:&nbsp;</label><input id="address-input"><br>' +
               '<button id="reverse-to-here" class="reverse-btn"><span class="glyphicon glyphicon-sort" aria-hidden="true"></span></button><br>' +
            '</div>' +           
           '<label>End:&nbsp;</label><span id="end">' + infoWindowName + '</span><br>' +
           '<button id="driving-directions-to-here" class="btn">Get driving directions</button>&nbsp;<button class="btn" id="public-directions-to-here">Get public transit directions</button><br>' +    
       '</div>';

    infoWindow.setContent(html)

    var input = document.getElementById('address-input');
    
    if (address) {
        $("#address-input")[0].value = address;
        originAddress = address;
        $("#driving-directions-to-here").css('background-color','#fad355');
        $("#public-directions-to-here").css('background-color','#fad355');
    }
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        originAddress = place.formatted_address;
        $("#driving-directions-to-here").css('background-color','#fad355');
        $("#public-directions-to-here").css('background-color','#fad355');
        return;
    });
    
    
    $("#address-input").width(250);
    $("#end").width(250);

    $("#reverse-to-here").on("click", onReverseToHere);
    $("#driving-directions-to-here").on("click", onToHere.bind(this, "DRIVING"));
    $("#public-directions-to-here").on("click", onToHere.bind(this, "TRANSIT"));
}


function onDirectionsToHere() {
    var el = document.querySelector('#info-window-content');
    infoWindowName = el.dataset.name;
    infoWindowLat = el.dataset.lat;
    infoWindowLng = el.dataset.lng;

    setOnDirectionsToHere();
}


function setOnDirectionsFromHere (address) {
    var html = 
        '<div id="instructions">' +
            '<div class="instructions-reverse">' +
                '<label>Start:&nbsp;</label><span id="start">' + infoWindowName + '</span><br>' + 
                '<button id="reverse-from-here" class="reverse-btn"><span class="glyphicon glyphicon-sort" aria-hidden="true"></span></button><br>' +
            '</div>' +
            '<label for="input">End:&nbsp;</label> <input id="address-input"><br>' +
            '<button id="driving-directions-from-here">Get driving directions</button><button id="public-directions-from-here">Get public transit directions</button><br>' +
        '</div>';
    
    infoWindow.setContent(html)
    
    var input = document.getElementById('address-input');
    
    if (address) {
        $("#address-input")[0].value = address;
        destinationAddress = address;
    }
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        destinationAddress = place.formatted_address;
        return;
    });


    $("#address-input").width(250);
    $("#start").width(250);
    $("#reverse-from-here").on("click", onReverseFromHere);
    $("#driving-directions-from-here").on("click", onFromHere.bind(this, "DRIVING"));
    $("#public-directions-from-here").on("click", onFromHere.bind(this, "TRANSIT"));
}


function onDirectionsFromHere() {
    var el = document.querySelector('#info-window-content');
    infoWindowName = el.dataset.name;
    infoWindowLat = el.dataset.lat;
    infoWindowLng = el.dataset.lng;

    setOnDirectionsFromHere();
}

function onFavoriteStarClick(marker, e) {
    
    var starMarker = marker.customInfo.starMarker;
    
    var name = marker.customInfo.name;
    var address = marker.customInfo.address;
    var phone = marker.customInfo.phone;
    var citySchool = marker.customInfo.citySchool;
    var lat = marker.customInfo.lat;
    var lng = marker.customInfo.lng;

    var numRows = document.getElementById("favorites-table-body").rows.length;
    var row = 
        '<tr id="' + name +'">' +
            '<td class="rank">' +
                (numRows + 1) +
            '</td>' +
            '<td>' + 
                '<button class="arrow-up"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button><br>' +
                '<button class="arrow-down"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span></button>' +
            '</td>' + 
            '<td>' +
                '<b>' + name + '</b><br>' +
                address + '<br>' +
                phone +
            '</td>' +
            '<td>' + 
                '<input type="checkbox">' +
            '</td>' +
            '<td>' +
                '<textarea class="comments" wrap="on" style="overflow:hidden;resize:none"></textarea>' +
            '</td>' +
            '<td>' +
                '<button class="delete-row">Remove</button>'
            '</td>' + 
        '</tr>'; 

    var html = document.querySelector("#info-window-content").outerHTML;
    // if (html.indexOf("glyphicon-star-empty") !== -1) {
    if (marker.customInfo.starred === "unstarred") {
        // it is currently untarred
        marker.customInfo.starred = "starred";
        starMarker.customInfo.starred = "starred";
        html = html.replace(/glyphicon-star-empty/, "glyphicon-star");
        infoWindowContent = document.querySelector("#info-window-content");
        infoWindowContent.outerHTML = html;
        addSchoolToComparison(row);
        starMarker.setMap(map);
        
    } else {
        
        marker.customInfo.starred = "unstarred";
        starMarker.customInfo.starred = "unstarred";

        html = html.replace(/glyphicon-star/, "glyphicon-star-empty");
        infoWindowContent = document.querySelector("#info-window-content");
        infoWindowContent.outerHTML = html;
        
        starMarker.setMap(null);

        removeSchoolFromComparison(name);
    }
    
    bindInfoWindow(marker, map, html);
    $("#favorite-star-btn").on("click", onFavoriteStarClick.bind(this, marker));
   
    
}

function getHtml(name, startTime, endTime,
                        principal, address, phone, fax, email, website, lat, lng, citySchool){

    var html =
        '<div id="info-window-content" data-lat="' + lat + '" data-lng="' + lng + '" data-name="' + name + '" data-citySchool="' + citySchool + '">' +
            '<div id="favorite-star-div">' + 
                '<button type="button" id="favorite-star-btn" aria-label="Left Align">' +
                    '<span id="favorite-star" class="glyphicon glyphicon-star-empty" aria-hidden="true"></span>' + 
                '</button>' +
            '</div>' + 
            '<div id="content" data-name="' + name + '" data-address="' + address + '" data-phone="' + phone + '" data-email="' + email + '" data-website="' + website + '">' +
                '<b>' + name + '</b><br>' +
                '<b>Start Time: </b>'+ startTime + '<br>' +
                '<b>End Time: </b>'+ endTime + '<br>' +
                '<b>Principal: </b>'+ principal + '<br>' +
                '<span id="address"><b>Address: </b><a href="http://maps.google.com/maps?q=' + address.replace(/ /g, "+") + '">' +address + '</a></span><br>' +
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

function onDeleteRow(e){
    var $button = $(e.target);
    var $td = $($button[0].parentElement);
    var $row = $($td[0].parentElement);
    var id = $row.attr('id');

    for (var i=0; i<markers.length; ++i) {
        if (markers[i].name === id) {
            var marker = markers[i];
            var starMarker = marker.customInfo.starMarker;
            starMarker.setMap(null);
            marker.customInfo.starred = "unstarred";
            var html = marker.customInfo.html;
            bindInfoWindow(marker, map, html);
            bindInfoWindowFavoriteStar(starMarker, map, html);
            break;
        }
    }

    $row.remove();
    var numRows = $("#favorites-table-body")[0].children.length;
    if (!numRows) {
        var html = '<tr>' +
                        '<td colspan="6">Click on the <span class="glyphicon glyphicon-star-empty" aria-hidden="true"></span> in school info windows to add schools to favorites</td>' +
                    '</tr>';

    } else {
        html = '<tr>' +
                '<td colspan="6">' +
                  '<textarea class="comments" placeholder="General notes"></textarea>' +
                '</td>' + 
              '</tr>' +
              '<tr>' +
                '<td colspan="6" id="contact-epc">' +
                  'Questions? <br>' +
                  'Contact the Educational Placement Center<br>' +
                  '555 Franklin Street, Room 100<br>' +
                  'San Francisco, CA 94102<br>' +
                  'Phone: (415) 241-6085<br>' +
                  'Hours: 8:00 am to 4:30 pm, Monday to Friday' +
                '</td>' +
              '</tr>'
    }
    $("#favorites-table-foot").html(html);
    setRankOnSchoolComparison();
}

function onArrowUp(e) {
    var $button = $(e.currentTarget);
    var $td = $($button[0].parentElement);
    var $row = $($td[0].parentElement);    
    var currRowIndex = parseInt($row[0].rowIndex) - 2;

     // can't move the first row up
    if (currRowIndex === 0) {
        return;
    }

    var newRowIndex = currRowIndex - 1;

    var children = $("tbody").children();
    var $currRow =  $(children[currRowIndex]);
    var $newRow = $(children[newRowIndex]);

    var currRowHtml = $currRow.html();
    var newRowHtml = $newRow.html();

    $currRow.html(newRowHtml);
    $newRow.html(currRowHtml);

    // add back click events on buttons
    $(".arrow-up").on("click", onArrowUp);
    $(".arrow-down").on("click", onArrowDown);
    $(".delete-row").on("click", onDeleteRow);

    setRankOnSchoolComparison();
}

function onArrowDown(e) {
    var $button = $(e.currentTarget);
    var $td = $($button[0].parentElement);
    var $row = $($td[0].parentElement);    
    var currRowIndex = parseInt($row[0].rowIndex) - 2;
    
    var numRows = document.getElementById("favorites-table-body").rows.length;

    // can't move the last row down
    if (currRowIndex === numRows - 1) {
        return;
    }

    var newRowIndex = currRowIndex + 1;

    var children = $("tbody").children();
    var $currRow =  $(children[currRowIndex]);
    var $newRow = $(children[newRowIndex]);

    var currRowHtml = $currRow.html();
    var newRowHtml = $newRow.html();

    $currRow.html(newRowHtml);
    $newRow.html(currRowHtml);

    // add back click events on buttons
    $(".arrow-up").on("click", onArrowUp);
    $(".arrow-down").on("click", onArrowDown);
    $(".delete-row").on("click", onDeleteRow);

    setRankOnSchoolComparison();
}

function addSchoolToComparison(row) {

    $("tbody").append(row);

    $(".delete-row").on("click", onDeleteRow);
    $(".arrow-up").on("click", onArrowUp);
    $(".arrow-down").on("click", onArrowDown);
}   
 
function removeSchoolFromComparison(name) {
    var row = document.getElementById(name);
    var $row = $(row);
    $row.remove();

    for (var i=0; i<markers.length; ++i) {
        if (markers[i].name === name) {
            var marker = markers[i];
            marker.customInfo.starred = "unstarred";
            var starMarker = marker.customInfo.starMarker;
            starMarker.setMap(null);
            starMarker.customInfo.starred = "unstarred";
            break;
        }
    }
}
       
function setRankOnSchoolComparison() {
    var $rank = $(".rank");
    
    for (var i=0; i < $rank.length; ++i) {
        var $currRank = $($rank[i]);
        $currRank.html(i + 1);
    }
}

function createMarker(lat, lng, name, address, phone, gradesServed, citySchool, multilingualPathways, beforeSchool, afterSchool) {
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
            strokeWeight: 0
        },
        optimized: false,
        zIndex: -1,
        map_icon_label: '<div class="map-icon-label-div">'+ grade +  '<br><span class="map-icon map-icon-school"><span class="marker-label"></span></span><br>&nbsp;</div>'
    });

    return marker;
}

function removeAllMarkers() {
    for (var i = 0; i < markers.length; ++i) {
        var marker = markers[i];
        marker.setMap(null);
        marker.customInfo.starMarker.setMap(null);
    }
}

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

function bindInfoWindow(marker, map, html) {
    
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

function showMarkers () {
    for (var i=0; i<markers.length; ++i) {
        var marker = markers[i];
        marker.setMap(map);
        if (marker.customInfo.starred === "starred") {
            marker.customInfo.starMarker.setMap(map);
        }
    }
}
// Adds a marker to the map
function addMarkers(data){
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
        

        var html = getHtml(name, startTime, endTime,
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
        // repopulateStarMarkers();
    }

}

function filterMarkers(checkedGradesServed, checkedCitySchool, checkedMP, checkedBeforeSchool, checkedAfterSchool) {
    markers.forEach(function(marker, index, array) {

        array[index].setMap(null);
        array[index].customInfo.starMarker.setMap(null);

        var isGradeServed = false;
        checkedGradesServed.forEach(function(gradesServed) {
            if (marker.customInfo.gradesServed === gradesServed) {
                isGradeServed = true;
            }
        });

        var isCitySchool = false;
        checkedCitySchool.forEach(function(citySchool) {        
            if (marker.customInfo.citySchool === citySchool) {
              isCitySchool = true;
            }
        });

        var isMultilingualPathways = false;
        checkedMP.forEach(function(multilingualPathways) {
            console.log("marker.customInfo ", marker.customInfo);
            console.log("marker.custominfo");
            if (marker.customInfo.multilingualPathways) {
                for (var i=0; i<marker.customInfo.multilingualPathways.length; ++i) {
                    if (marker.customInfo.multilingualPathways[i] === multilingualPathways) {
                        isMultilingualPathways = true;
                    }
                }
            }
        });

        var isBeforeSchool = false;
        checkedBeforeSchool.forEach(function(beforeSchool) {
            if (marker.customInfo.beforeSchool === beforeSchool) {
                isBeforeSchool = true;
            }
        });

        var isAfterSchool = false;
        checkedAfterSchool.forEach(function(afterSchool) {
            if (marker.customInfo.afterSchool === afterSchool) {
                isAfterSchool = true;
            }
        });
        
        if (isGradeServed && isCitySchool && isMultilingualPathways && isBeforeSchool && isAfterSchool) {
            array[index].setMap(map);
            if (marker.customInfo.starred === "starred") {
                array[index].customInfo.starMarker.setMap(map);
            }
        }
    });
}

$('#map-choices-form').on('submit', function (e) {
    console.log("in the submit");
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

    filterMarkers(checkedGradesServed, checkedCitySchool, checkedMP, checkedBeforeSchool, checkedAfterSchool);
    
    if (isOnlyAttendanceArea) {
        showOnlyAttendanceArea();
    } else {
        resetAttendanceArea();
    }
    if (homeMarker) {
        homeMarker.setMap(map);
    }

})


//check all checkboxes
$(".check-all").change(function () {
    $("#form-submit").val("Refresh map");

    // slice the 'check-all'
    var num = "check-all-".length;
    var name = ($(this).attr('id')).slice(num);
    if ($(this).prop("checked")) {
        // check all boxes     
        $("input[name='" + name + "']").prop("checked", true);
        
        // change "Select All" text
        $(this)[0].labels[0].innerHTML = "&nbsp; Deselect All"

    } else {
        $("input[name='" + name + "']").prop("checked", false);
        if (name === "c-s") {
            $(this)[0].labels[0].innerHTML = "&nbsp; Select All Schools"
        } else {
            $(this)[0].labels[0].innerHTML = "&nbsp; Select All"
        }
    }

    countCheckboxes(name);
});

function countCheckboxes(name) {
    // var name = $(this)[0].name;
    var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
    var numTotal = $("#" + name + "-form").find($("input[name='"+ name  + "']")).length;
    $("#" + name + "-count").html(numChecked + " / "+ numTotal);
}

// change the arrow direction when toggling to collapse / show checkboxes
$(".arrow-collapse-link").on("click", function(e) {
    $(this).toggleClass("isExpanded")
    console.log("$this ", $(this));
    var isExpanded = $(this).hasClass("isExpanded");
    if (isExpanded) {
        $($(this)[0].children[0].children[0]).removeClass("glyphicon-chevron-right").addClass("glyphicon glyphicon-chevron-down");         
    } else {
        $($(this)[0].children[0].children[0]).removeClass("glyphicon glyphicon-chevron-down").addClass("glyphicon glyphicon-chevron-right");
    }
    
});



var attendanceAreaPolygonArray = []
function populateAttendanceAreaPolygon (data) {
    // return a list of dictionaries [{name: [coordinates]}]
    // where coordinates = [lat, lng] 

    data = JSON.parse(data);

    for (var i=0; i<data.length; ++i) {

        var attendanceArea = data[i];
        for (name in attendanceArea) {
        
            // turn items into integers
            var paths = attendanceArea[name];
            paths.forEach(function(element, index, array) {
                array[index] = {lat: parseFloat(element.lat), lng: parseFloat(element.lng)}
            });
            var attendanceAreaPolygon = new google.maps.Polygon({
                name: name,
                paths: paths,
                strokeColor: '#FF0000',
                strokeOpacity: 0.0,
                strokeWeight: 2,
                fillColor: '#0000FF',
                fillOpacity: 0.0
            });
            attendanceAreaPolygon.setMap(map);

            attendanceAreaPolygonArray.push(attendanceAreaPolygon);
        }
    }
}

var ctip1PolygonArray = []
function populateCtip1Polygon(data) {
    require(["esri/geometry/webMercatorUtils"], function(webMercatorUtils) {     
        data = data.result
        for (var i=0; i<data.length; ++i) {
            var ctip1Area = data[i];
            var paths = [];

            for (var j=0; j< ctip1Area.length; ++j) {
         
                var x = ctip1Area[j][0];
                var y = ctip1Area[j][1];

                var normalizedVal = webMercatorUtils.xyToLngLat(x,y);
                var lat = normalizedVal[1];
                var lng = normalizedVal[0];
                
                var coordinates = {lat: lat, lng: lng};

                paths.push(coordinates);

            }
            
            var ctip1Polygon = new google.maps.Polygon({
                paths: paths,
                strokeColor: '#fff',
                strokeOpacity: 0,
                strokeWeight: 2,
                fillColor: '#fff',
                fillOpacity: 0
            });

            ctip1Polygon.setMap(map);

            ctip1PolygonArray.push(ctip1Polygon);
        
        }

    });
}

function onShowFavoritesModal() {
    infoWindow.close();        
        
    var numRows = $("#favorites-table-body")[0].children.length;
    if (!numRows) {
        var html = '<tr>' +
                        '<td colspan="6">Click on the <span class="glyphicon glyphicon-star-empty" aria-hidden="true"></span> in school info windows to add schools to favorites</td>' +
                    '</tr>';

    } else {
        html = '<tr>' +
                '<td colspan="6">' +
                  '<textarea class="comments" placeholder="General notes"></textarea>' +
                '</td>' + 
              '</tr>' +
              '<tr>' +
                '<td colspan="6" id="contact-epc">' +
                  'Questions? <br>' +
                  'Contact the Educational Placement Center<br>' +
                  '555 Franklin Street, Room 100<br>' +
                  'San Francisco, CA 94102<br>' +
                  'Phone: (415) 241-6085<br>' +
                  'Hours: 8:00 am to 4:30 pm, Monday to Friday' +
                '</td>' +
              '</tr>'
    }
    $("#favorites-table-foot").html(html);


    $("#modal").modal('show');

}

function printElement(elem) {
    var domClone = elem.cloneNode(true);

    var $printSection = document.getElementById("printSection");

    if (!$printSection) {
        var $printSection = document.createElement("div");
        $printSection.id = "printSection";
        document.body.appendChild($printSection);
    }

    $printSection.innerHTML = "";
    var printHtmlHeader = $("#favorites-table-head").html();
    var printHtml = $("#favorites-table").html();
    console.log("printHtmlHeader ", printHtml);
    $("#printSection").html(printHtml);
    // $("#printSection").append($("#printThis").clone());
    window.print();
}

function onTabClick() {
    console.log("clicked on a tab");
    $("#wrapper").toggleClass("toggled");

    if ($("#tab-btn-plus").hasClass("toggled")) {
        console.log("had class toggled, hiding tab");
        $("#tab-btn-plus").hide();
    } else {
        console.log("does not have class toggled, showing side");
        $("#tab-btn-plus").show();
        // 
    }
    $("#tab-btn-plus").toggleClass("toggled");

}

function onCurrentLocation() {
    $.get("https://ipapi.co/json/", function(data) {
        var lat = data.latitude || 37.760099;
        var lng = data.longitude || -122.434633;
        var center = { lat: lat, lng: lng };
        map.setCenter(center);
        map.setZoom(14);
    });
}

$(document).ready(function() {
    // if user clicks back button during session
    // if (window.history && window.history.pushState) {
    //     window.history.pushState('', null, '');
    //     $(window).on('popstate', function() {
    //     alert("Are you sure you want to leave?  \nYou'll lose any information saved");
    //   });

    // }
    // $(window).on("beforeunload", function() {
    //     return "bye";
    // });

    var windowWidth = $(window).width();
  

    $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
    });

    // setting up screen
    if (windowWidth >= MD_WIDTH) {
        gtMdWidth = true;
        $("#menu-toggle").hide();
        $(".tab-btn").hide();
    } else {
        $("#wrapper").removeClass("toggled");
        gtMdWidth = false;
        $("#info-sign").hide();
    }

    var headerHeight = $("#header").height();
    $("#map").css("cssText", "height:" + ($(window).height() - headerHeight) + "px !important;");
    
    // modal window set up
    var pageWidth = $("#page-content-wrapper").width();
    $(".modal-dialog").width(pageWidth * .75);
    $(".modal-body").height($("#map").height() * .75);
    $("#print-btn").on("click", function() { 
        printElement(document.getElementById("printThis"));
    });
   
    // enable all websites in future info windows to open correclty
    $('body').on('click', '#website', function (e) { 
        var innerHtml = e.currentTarget.innerHTML;
        window.open(innerHtml, "_blank");
    });

    var mapHeight = $("#map").height();
    // set the tab btn (on mobile) 
    var tabTop = 0.5 * mapHeight + headerHeight;
    var tabLeft = 250 - $("#tab-btn-minus").width() - 19;
    $(".tab-btn").css("top", tabTop);
    $("#tab-btn-minus").css("left", tabLeft);
    
    var googleMapsBtns = 150;
    var currLocTop = mapHeight + headerHeight - googleMapsBtns;
    var currLocLeft = gtMdWidth ? $("#map").width() + 24 : $("#map").width() + 4;
    // $("#curr-loc-btn").css("top", currLocTop);
    // $("#curr-loc-btn").css("left", currLocLeft);

    // set the current location btn
    $(window).on("resize", function() {
        $(".tab").css("top", tabTop);
        $("#tab-btn-minus").css("left", tabLeft + "px !important");     
        currLocTop = gtMdWidth ? $("#map").height() + $("#header").height() - googleMapsBtns : $("#map").height() + $("#header").height() - googleMapsBtns - 10;
        currLocLeft = gtMdWidth ? $("#map").width() + 24 : $("#map").width() +4;
        // $("#curr-loc-btn").css("top", currLocTop);
        // $("#curr-loc-btn").css("left", currLocLeft);  
    });

    // Tie breaker heirarchy buttons
    var elemTieHtml = "1. Applicant has an older sibling enrolled in school<br>" +
                      "2. Test score area<br>" +
                      "3. Applicant lives in the attendance area of the school <br>&nbsp;&nbsp;&nbsp;(does NOT apply for city-wide schools)<br>" +
                      "4. No-tiebreaker";
    var middleTieHtml = "1. Applicant has an older sibling enrolled the school<br>" +
                        "2. Applicants enrolled in the elementary school that feeds into the middle school<br>" +
                        "3. Applicants living in the 94124 zipcode and applying for Willie Brown Middle School<br>" +
                        "4. Test score area<br>" +
                        "5. No tie-breakers";
    var highTieHtml = "1. Applicant has an older sibling enrolled in and will be attending the school<br>" +
                      "2. Applicants who completed grades 6-8 at Willie Brown Middle School<br>" +
                      "3. Test score area<br>" +
                      "4. No tie-breakers";

    var tieBreakerHtml = [elemTieHtml, middleTieHtml, highTieHtml]

    
    $(".mobile-tie-breaker-btn").on('click', function(e) {
        var $elem = $("#tie-breaker-info-elem");
        var $middle = $("#tie-breaker-info-middle");
        var $high = $("#tie-breaker-info-high");
        var tieBreakerHtmlHolder = [$elem, $middle, $high];

        currentHtml = $elem.html() || $middle.html() || $high.html();
        htmlIndex = parseInt(e.target.dataset.htmlindex);
        newHtml = tieBreakerHtml[htmlIndex];
      
        if (currentHtml === newHtml) {
            $(".mobile-tie-breaker-info").html("");
            $(e.target).css("background-color", "");
        } else {
            $(".mobile-tie-breaker-btn").css("background-color","");
            for (var i=0; i<tieBreakerHtmlHolder.length; ++i) {
                if (i === htmlIndex) {
                    tieBreakerHtmlHolder[i].html(newHtml);
                    $(e.target).css("background-color", "#fad355");
                } else {
                    tieBreakerHtmlHolder[i].html("");
                }
            }
        }

    });

    // geolocate user by IP address
    // $.get("/ip-address.json", function(data) {
    //     data = JSON.parse(data.data);
    //     $("#tab-btn-plus").html("lat "+ data.lat);
    //     initialize(data.lat, data.lng);

    $.get("https://ipapi.co/json/", function(data) {
        initialize(data.latitude, data.longitude);
    // $.get("https://freegeoip.net/json/github.com", function(data) {
        // initialize(data.latitude, data.longitude);
        // instantiate map and populate counts on criteria
        var countArr = $(".count");
        
        for (var i=0; i < countArr.length; ++i) {
            var element = countArr[i];
            var name = ($(element).attr('id')).slice(0, -6);
            var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
            var numTotal = $("#" + name + "-form").find($("input[name='"+ name  + "']")).length;
            $(element).html(numChecked + " / " + numTotal);            
        };

        $.get("/map-checked.json", addMarkers);

        $("input:checkbox").on("change", function() {
            console.log("clicked a box");
            $("#map-choices-form").submit();
            var name = $(this)[0].name;
            countCheckboxes(name);
        });

        $("#directions-panel").hide();

        $.get("/attendance-area-coordinates.json", populateAttendanceAreaPolygon);
        $.get("/ctip1-area-xy-coordinates.json", populateCtip1Polygon);
        $("#show-favorites-btn").on("click", onShowFavoritesModal);
    });

});
