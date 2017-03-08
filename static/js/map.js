// TODO

//// current list
// add the link to the SARC report?
// get a better way of getting IP addresses so its from HTTPS and is more accurates 

//// mobile specific fixes
// hide directions buttons in mobile
// click submit - hides the window on mobile
// link the address in mobile so that user can click using the q= thing
// better home mobile experience (entering home address)
// hide the favorite star buttons on the info window and the show my favorite schools button

//// longer term considerations -- need to do
// clean all the data, perfect the addresses for all the schools using googlemaps
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
// remove space above "Filter Schools"?
// the whole notebook page fix
// fonts


//// longer term condiersations -- nice to have
// add in google analytics to the page?
// fix overlapping icons
// add in a tally of # of elem / middle / high schools matched and put in upper right corner on map
// ranking the favorites

///// to discuss with others
// photoshop for the images -> must fix
// send out my excels -> to add the SARC performance reports 
// messaging to expalin attendance area - and how to use google maps w/ two fingers
// rate limiting



var map;
var infoWindow = new google.maps.InfoWindow({
  width: 150
});
var homeInfoWindow = new google.maps.InfoWindow({
  width: 150
});
var gtMdWidth, originalMapWidth;
var aarea, aaname;
var markers = [];
var homeMarker;
// var starMarkers = [];
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
    console.log("center is ",center);
    // map.addListener('bounds_changed', function(){
    //     map.setCenter(center);
    // });
    initAutocomplete();
    $("#show-favorites-btn").on("click", function() {
        $("#modal").modal('show');
        // showStarMarkers();
    });
    return map;
}


function initAutocomplete() {
   
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    
    var windowWidth = $(window).width();
    if (gtMdWidth) {
        var inputDiv = document.createElement('div');
    
        inputDiv.appendChild(input);

        inputDiv.index = 1;

        var homeSearch = document.getElementById("home-search");
        homeSearch.appendChild(inputDiv);
        
    } else {
        // set right size of the hamburger option
        
        var searchBarWidth = windowWidth - 80;
        $(".pac-card").width(searchBarWidth);
        $("#pac-input").width(searchBarWidth);
        $("#pac-input").css("flex-shrink", "1");
        $(".pac-card").css("flex-shrink", "1");

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

function onShowAttendanceArea() {
    var color = "#000";
                   
    if (homeInfoWindow.content.indexOf("Reset") !== -1) {
        resetAttendanceArea();

    } else {
        var resetContent = homeInfoWindow.content.replace(/Show only .* schools/, 'Reset');
        homeInfoWindow.setContent(resetContent);
       
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
                    
                    //high
                    if (array[index].icon.fillColor === "#414141") {
                        var fillColor = "#8c8c8c";
                        color = "#414141";
                    //middle
                    } else if (array[index].icon.fillColor === "#87CCE2") {
                        fillColor = "#b5dfed";
                        color = "#87CCE2";
                    // elem
                    } else if (array[index].icon.fillColor === "#F54900") {
                        fillColor = "#ff9f75";
                        color = "#F54900";
                    }
                    
                    var map_icon_label = marker.map_icon_label;
                    var starMarker = marker.customInfo.starMarker;
                    var html = marker.customInfo.html.replace(/id="city-wide"/, 'id="city-wide" style="color:' + color +'"');
                    
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
            fillOpacity: 1
        });
    }
    $("#show-attendance-area").on("click", onShowAttendanceArea);
}

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
    // $("#hide-side-nav").click();

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
            '<td>' + 
                '<button class="arrow-up"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button><br>' +
                '<button class="arrow-down"><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span></button>' +
            '</td>' + 
            '<td class="rank">' +
                (numRows + 1) +
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
                '<input class="comments" type="textarea">' +
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
                '<span id="address"><b>Address: </b>'+ address + '</span><br>' +
                '<span id="city-wide"><b>City-Wide School: </b>' + citySchool + '</span><br>' +
                '<b>Phone: </b>'+ '<a href="tel:' + phone +'">' + phone + '</a><br>' +
                '<b>Email: </b><a href="mailto:"' + email + '">' + email + '</a><br>' +
                '<b>Website: </b><span id="website-span"><a id="website">' + website + '</a></span><br>' +
            '</div>' +
            '<div id="instructions">' +
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
            
            marker.customInfo.starMarker.setMap(null);
            break;
        }
    }

    $row.remove();
    setRankOnSchoolComparison();
}

function onArrowUp(e) {
    var $button = $(e.currentTarget);
    var $td = $($button[0].parentElement);
    var $row = $($td[0].parentElement);    
    var currRowIndex = parseInt($row[0].rowIndex);

        
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
    var currRowIndex = parseInt($row[0].rowIndex);
    
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

function createMarker(lat, lng, name, address, phone, gradesServed, citySchool) {
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
        customInfo: {starred: "unstarred", type: "marker", citySchool: citySchool, name: name, address: address, phone: phone, lat: lat, lng: lng},
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
            marker.customInfo.starMarker.setMap(null);
            
        } else if (marker.customInfo.starred === "starred") {
            marker.customInfo.starMarker.setMap(map);
        }  
        infoWindow.setContent(html);
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
            marker.customInfo.starMarker.setMap(null);
            
        } else if (marker.customInfo.starred === "starred") {
            html = html.replace(/glyphicon-star-empty/, "glyphicon-star");
            // infoWindow.setContent(html);
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
        

        var html = getHtml(name, startTime, endTime,
                        principal, address, phone, fax, email, website, lat, lng, citySchool);

        var marker = createMarker(lat, lng, name, address, phone, gradesServed, citySchool);
        var starMarker = new Marker({
            name: name,
            customInfo: {starred: "starred", type: "starMarker", citySchool: citySchool, name: name, address: address, phone: phone, citySchool, lat: lat, lng: lng},
            position: {lat: lat, lng: lng},
            icon: "static/img/star.png",
            map: null,
            optimized: false,
            zIndex: 1000,
        });
        marker.customInfo.starMarker = starMarker;
        marker.customInfo.html = html;
        // starMarkers.push(starMarker);
        markers.push(marker);

        bindInfoWindow(marker, map, html);
        bindInfoWindowFavoriteStar(starMarker, map, html);
    }
}


$('#map-choices-form').on('submit', function (e) {
    e.preventDefault();

    // directionsDisplay.setMap(null);
    // directionsDisplay.setPanel(null);

    var inputs = $("#map-choices-form").serializeArray();

    $.get("/map-checked.json", inputs, addMarkers);
    if (homeMarker) {
        homeMarker.setMap(map);
    }

    $("#form-submit").val("Submit");
})


$(".check").change(function() {
    $("#form-submit").val("Refresh map");
});

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
        $(this)[0].labels[0].innerHTML = "&nbsp; Select All"
    }

    countCheckboxes(name);
});

$(".check").on("change", function() {
    var name = $(this)[0].name;
    countCheckboxes(name);
});

function countCheckboxes(name) {
    // var name = $(this)[0].name;
    var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
    $("#" + name + "-count").html(numChecked);
}

// change the arrow direction when toggling to collapse / show checkboxes
$(".arrow-collapse-link").on("click", function(e) {
    $(this).toggleClass("isExpanded")
    console.log("$this ", $(this));
    var isExpanded = $(this).hasClass("isExpanded");
    if (isExpanded) {
        $($(this)[0].children[0]).removeClass("glyphicon-chevron-right").addClass("glyphicon glyphicon-chevron-down");         
    } else {
        $($(this)[0].children[0]).removeClass("glyphicon glyphicon-chevron-down").addClass("glyphicon glyphicon-chevron-right");
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

function onShowFilters() {
    $('#wrapper').toggleClass("toggled");
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
    $printSection.appendChild(domClone);
    window.print();
}

$(document).ready(function() {
    // if user clicks back button during session
    if (window.history && window.history.pushState) {

      window.history.pushState('', null, '');

      $(window).on('popstate', function() {
        alert("Are you sure you want to leave?  \nYou'll lose any information saved in 'Compare Schools'");
      });

    }
    $(window).on("beforeunload", function() {
        return "bye";
    });


    var windowWidth = $(window).width();
    var MD_WIDTH = 992;

    $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
    });

    // setting up screen
    if (windowWidth >= MD_WIDTH) {
        gtMdWidth = true;
        // $("#show-side-nav").hide();
        // $("#wrapper").toggleClass("toggled");
        $("#menu-toggle").hide();
    } else {
        $("#wrapper").removeClass("toggled");
        gtMdWidth = false;
    }

    var headerHeight = $("#header").height();
    var mapHeight = $("#map").height();
    $("#map").height(mapHeight - headerHeight - 30);
    $("#header-row").height(headerHeight);
    
    
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

    // Tie breaker heirarchy buttons
    var elemTieHtml = "1. Applicant has an older sibling enrolled in school<br>" +
                      "2. Test score area<br>" +
                      "3. Applicant lives in the attendance area of the school <br>&nbsp;&nbsp;&nbsp;(does NOT apply for city-wide schools)<br>" +
                      "4. No-tiebreaker";
    $("#elem-tie-btn").on("click", function() {
        $("#elem-tie-btn").toggleClass("toggle");
        if ($("#elem-tie-btn").hasClass("toggle")) {
            $("#middle-tie-btn").removeClass("toggle");
            $("#high-tie-btn").removeClass("toggle");
            $("#middle-tie-btn").css("background-color", "");
            $("#high-tie-btn").css("background-color", "");

            $("#elem-tie-btn").css("background-color", "#fad355");
            $("#elem-tie-breaker-info").html(elemTieHtml);
            $("#middle-tie-breaker-info").hide();
            $("#high-tie-breaker-info").hide();
            $("#elem-tie-breaker-info").show();

            $("#map").css("margin-top",$("#elem-tie-breaker-info").height());
            $("#directions-panel").css("margin-top", $("#elem-tie-breaker-info").height());
        } else {
            $("#elem-tie-breaker-info").hide();            
            $("#elem-tie-btn").css("background-color", "");
     
            $("#map").css("margin-top",0);
            $("#directions-panel").css("margin-top", 0);
        }
    });

    var middleTieHtml = "1. Applicant has an older sibling enrolled the school<br>" +
                        "2. Applicants enrolled in the elementary school that feeds into the middle school<br>" +
                        "3. Applicants living in the 94124 zipcode and applying for Willie Brown Middle School<br>" +
                        "4. Test score area<br>" +
                        "5. No tie-breakers"
     $("#middle-tie-btn").on("click", function() {
        $("#middle-tie-btn").toggleClass("toggle");
        if ($("#middle-tie-btn").hasClass("toggle")) {
            $("#elem-tie-btn").removeClass("toggle");
            $("#high-tie-btn").removeClass("toggle");
            $("#middle-tie-btn").css("background-color", "#fad355");
            $("#elem-tie-btn").css("background-color", "");
            $("#high-tie-btn").css("background-color", "");

            $("#middle-tie-breaker-info").html(middleTieHtml);
            $("#elem-tie-breaker-info").hide();
            $("#high-tie-breaker-info").hide();
            $("#middle-tie-breaker-info").show();

            $("#map").css("margin-top",$("#middle-tie-breaker-info").height());
            $("#directions-panel").css("margin-top", $("#middle-tie-breaker-info").height());
            
        } else {
            $("#middle-tie-breaker-info").hide();
            $("#middle-tie-btn").css("background-color", "");

            $("#map").css("margin-top",0);
            $("#directions-panel").css("margin-top", 0);
        }
    });

    var highTieHtml = "1. Applicant has an older sibling enrolled in and will be attending the school<br>" +
                      "2. Applicants who completed grades 6-8 at Willie Brown Middle School<br>" +
                      "3. Test score area<br>" +
                      "4. No tie-breakers" 
    $("#high-tie-btn").on("click", function() {
        $("#high-tie-btn").toggleClass("toggle");
        if ($("#high-tie-btn").hasClass("toggle")) {
            $("#elem-tie-btn").removeClass("toggle");
            $("#middle-tie-btn").removeClass("toggle");
            $("#high-tie-btn").css("background-color", "#fad355");
            $("#elem-tie-btn").css("background-color", "");
            $("#middle-tie-btn").css("background-color", "");

            $("#high-tie-breaker-info").html(highTieHtml);
            $("#elem-tie-breaker-info").hide();
            $("#middle-tie-breaker-info").hide();
            $("#high-tie-breaker-info").show();

            $("#map").css("margin-top",$("#high-tie-breaker-info").height());
            $("#directions-panel").css("margin-top", $("#high-tie-breaker-info").height());
    
        } else {
            $("#high-tie-breaker-info").hide();
            $("#high-tie-btn").css("background-color", "");

            $("#map").css("margin-top",0);
            $("#directions-panel").css("margin-top", 0);
        }
    });

    // geolocate user by IP address
    $.get("https://freegeoip.net/json/github.com", function(data) {
        initialize(data.latitude, data.longitude);
        // instantiate map and populate counts on criteria
        var countArr = $(".count");
        
        for (var i=0; i < countArr.length; ++i) {
            var element = countArr[i];
            var name = ($(element).attr('id')).slice(0, -6);
            var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
            $(element).html(numChecked);            
        };
        

        $(".K-5").css("color", "#F54900");
        $(".K-8").css("color", "#F54900");
        $(".PreK-5").css("color", "#F54900");
        $(".PreK-8").css("color", "#F54900");
        $(".6-8").css("color", "#87CCE2");
        $(".9-12").css("color", "#414141");

        
        $("#map-choices-form").submit();

        $("#directions-panel").hide();

        $.get("/attendance-area-coordinates.json", populateAttendanceAreaPolygon);
        $.get("/ctip1-area-xy-coordinates.json", populateCtip1Polygon);

       
    });

});
