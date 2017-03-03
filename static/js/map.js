// TODO

/// current list
// when closing info window when in attendance area viewing mode - opening it should say reset
// why click twice on home info windwo??!
// change get to post so that people are prompted when resubmitting form submission or whatever

//// mobile specific fixes
// hide directions buttons in mobile
// click submit - hides the window on mobile
// link the address in mobile so that user can click using the q= thing
// better home mobile experience (entering home address)
// ->fix the mobile experience - not have polygons maybe?
// hide the favorite star buttons on the info window and the show my favorite schools button

//// longer term considerations -- need to do
// clean all the data, perfect the addresses for all the schools using googlemaps
// fix clicking on the website from the info window -> check if having correct http:// fixes it
// general / massive formatting
// add all relevant commenting to code
// add in remaining elementary school
// make map moveable/draggable -> is it the polygons?
// make map dynamically 100% height

//// longer term condiersations -- nice to have
// add in google analytics to the page?
// fix overlapping icons
// add in a tally of # of elem / middle / high schools matched and put in upper right corner on map
// ranking the favorites

///// to discuss with others
// photoshop for the images -> must fix
// send out my excels -> to add the SARC performance reports and the tours 
// messaging to expalin attendance area - and how to use google maps w/ two fingers
// rate limiting



var map;
var markerListener;
var toggled = true;
var firstTime = true;
var infoWindow = new google.maps.InfoWindow({
  width: 150
});
var gtMdWidth;
var aarea, aaname;
var markers = [];
var homeMarkers = [];
var starMarkers = [];
var infoWindowLat, infoWindowLng, infoWindowName;
var destinationLat, destinationLng;
var originAddress, destinationAddress;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();        
function initialize() {
    var sanFrancisco = { lat: 37.760099, lng: -122.434633 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: sanFrancisco,
        draggable: true
    });
    
    // map.addListener('bounds_changed', function(){
    //     map.setCenter(center);
    // });
    initAutocomplete();

    return map;
}


function initAutocomplete() {
   
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    console.log("this._gtMdWidth is ", gtMdWidth);
    var windowWidth = $(window).width();
    if (gtMdWidth) {
        var toggleButton = document.getElementById('toggle-search-div');
        var inputDiv = document.createElement('div');
    
        inputDiv.appendChild(toggleButton);
        inputDiv.appendChild(input);

        inputDiv.index = 1;

        var homeSearch = document.getElementById("home-search");
        homeSearch.appendChild(inputDiv);
        var div = document.createElement('div');
        div.innerHTML = '<a class="tool-tip" data-toggle="tooltip" data-placement="left" title="Tooltip here">' +
                            '<i id="info-sign" class="glyphicon glyphicon-info-sign"></i>' +
                        '</a>';
        var infoSign = div.firstChild;
        homeSearch.appendChild(infoSign);

        // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(inputDiv);
    } else {
        // set right size of the hamburger option
        var menuWidth = $("#menu-toggle").width();
        
        var searchBarWidth = windowWidth - menuWidth - 30;
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
        homeMarkers.forEach(function(marker) {
           marker.setMap(null);
        });

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
            var homeMarker = new Marker({
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
            
            homeMarkers.push(homeMarker);
            // var aaname;
            // var aarea;
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
                        console.log("TURESS");
                    } 
                });
                html = getHomeMarkerHtml(homeMarker, { ctip: ctip });

                infoWindow.close();
                infoWindow.setContent(html);
                // $("#show-attendance-area").toggleClass("toggled");
                // if ($("#show-attendance-area").hasClass("toggled")) {
                if (toggled) {
                        resetContent = infoWindow.content.replace(/Reset/, 'Show only ' + aaname.toUpperCase() + ' schools');
                        infoWindow.setContent(resetContent);
                } 
                else {
                        resetContent = infoWindow.content.replace(/Show only .* schools/, 'Reset');
                        infoWindow.setContent(resetContent);
                        $("#show-attendance-area").addClass("toggle");
                }

                infoWindow.open(map, homeMarker);

                $("#show-attendance-area").on("click", onShowAttendanceArea);
            });
            
            // Bias the SearchBox results towards current map's viewport.
            map.setCenter(place.geometry.location);

        });
    
    });
}


function getHomeMarkerHtml (homeMarker, data) {
    // attendanceArea = data.aaname;
    var ctipBool = data.ctip ? "Yes" : "No";
    // aarea = data.aarea;

    var html = '<div id="home-info-window-content">' +
            '<b>Attendance Area: </b>'+ aaname + '<br>' +
            '<b>Tie-breaker Area: </b>'+ ctipBool + '<br>' +
            '<button id="show-attendance-area">Show only ' + aaname.toUpperCase() + ' schools</button>' +
        '</div>';
    
    return html;
}


function onShowAttendanceArea() {
    var resetContent;
    if ($("#show-attendance-area").hasClass("toggled")) {
        toggled = true;
        $("#show-attendance-area").text("Show only " + aaname.toUpperCase() + " schools")
        resetContent = infoWindow.content.replace(/Reset/, 'Show only ' + aaname.toUpperCase() + ' schools');
        infoWindow.setContent(resetContent);
        // homeMarkers.forEach(function(homeMarker) {
        //     infoWindow.open(map, homeMarker);
        // });


        $("#map-choices-form").submit();
        showStarMarkers();
        aarea.setOptions({
            fillColor: "#000",
            fillOpacity: 0
        });

    } else {
        $("#show-attendance-area").text("Reset");
        toggled = false;
        // console.log("reser contnt ", infoWindow.content);
        resetContent = infoWindow.content.replace(/Show only .* schools/, 'Reset');
        // // markerListener.remove();
        // // bindInfoWindow(homeMarker, map, resetContent);
        infoWindow.setContent(resetContent);
        // // homeMarkers.forEach(function(homeMarker) {
            // infoWindow.open(map, homeMarker);
        // });

        attendanceAreaPolygonArray.forEach(function(element) {
            markers.forEach(function(marker) {
                if (google.maps.geometry.poly.containsLocation(marker.position, element) && element.name !== aaname) {
                    marker.setMap(null);
                }  
            });
            starMarkers.forEach(function(marker) {
                if (google.maps.geometry.poly.containsLocation(marker.position, element) && element.name !== aaname) {
                    marker.setMap(null);
                }  
            });
        });
        aarea.setOptions({
            fillColor: "#fad355",
            fillOpacity: 1
        });
    }
    

}

function getDirections(origin, destination, travelMode) {
    var center = map.getCenter();
    // hide the left side nav
    $("#hide-side-nav").click();

    var pageWidth = $("#page-content-wrapper").width() + 220;
    var mapWidth = 0.75 * pageWidth - 30;
    var directionsWidth = 0.25 * pageWidth - 50;
    
    $("#map").width(mapWidth);
    $("#directions-panel").width(directionsWidth);
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
    });

    // hide markers and home marker and starMarkers
    removeAllMarkers();
    homeMarkers.forEach(function(marker) {
       marker.setMap(null);
    });
    starMarkers.forEach(function(marker) {
        marker.setMap(null);
    });
    
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
    console.log("address-input ", $("#address-input")[0].value);
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
           '<button id="driving-directions-to-here">Get driving directions</button><button id="public-directions-to-here">Get public transit directions</button><br>' +    
       '</div>';

    infoWindow.setContent(html)

    var input = document.getElementById('address-input');
    
    if (address) {
        $("#address-input")[0].value = address;
        originAddress = address;
    }
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        originAddress = place.formatted_address;
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

function onFavoriteStarClick() {
    var el = document.querySelector('#content'); 
    var elInfoWindow = document.querySelector("#info-window-content");

    // // set up toggle for star
    $("#favorite-star").toggleClass("toggledStar");
    
    var name = el.dataset.name;
    var address = el.dataset.address;
    var phone = el.dataset.phone;
    var email = el.dataset.email;
    var website = el.dataset.website;
    var lat = parseFloat(elInfoWindow.dataset.lat);
    var lng = parseFloat(elInfoWindow.dataset.lng);
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
                phone + '<br>' +
                email + '<br>' +
                website + '<br>' + 
            '</td>' +
            '<td>' +
                '<input type="checkbox">' +
            '</td>' + 
            '<td>' + 
                '<input type="checkbox">' +
            '</td>' +
            '<td>' +
                '<input class="comments" type="textarea">' +
            '</td>' +
            '<td>' +
                '<button class="delete-row">Delete</button>'
            '</td>' + 
        '</tr>';

    if ( $("#favorite-star").hasClass("toggledStar") ) {

        addSchoolToComparison(row);

        var starMarker = new Marker({
            name: name,
            position: {lat: lat, lng: lng},
            icon: "static/img/star.png",
            map: map,
            optimized: false,
            zIndex: 1000,
  
        });
        starMarkers.push(starMarker);

        var html = elInfoWindow.outerHTML;
        bindInfoWindow(starMarker, map, html);
    } else {
        removeSchoolFromComparison(name);
    }
}

function getHtml(name, startTime, endTime, middleSchoolFeeder,
                        principal, address, phone, fax, email, website, lat, lng){
    var html =
        '<div id="info-window-content" data-lat="' + lat + '" data-lng="' + lng + '" data-name="' + name + '">' +
            '<div id="favorite-star-div">' + 
                '<button type="button" id="favorite-star-btn" aria-label="Left Align" onclick="onFavoriteStarClick()">' +
                    '<span id="favorite-star" class="glyphicon glyphicon-star-empty" aria-hidden="true"></span>' + 
                '</button>' +
            '</div>' + 
            '<div id="content" data-name="' + name + '" data-address="' + address + '" data-phone="' + phone + '" data-email="' + email + '" data-website="' + website + '">' +
                '<b>' + name + '</b><br>' +
                '<b>Start Time: </b>'+ startTime + '<br>' +
                '<b>End Time: </b>'+ endTime + '<br>' +
                '<b>Feeder: </b>'+ middleSchoolFeeder + '<br>' +
                '<b>Principal: </b>'+ principal + '<br>' +
                '<span id="address"><b>Address: </b>'+ address + '</span><br>' +
                '<b>Phone: </b>'+ '<a href="tel:' + phone +'">' + phone + '</a><br>' +
                '<b>Email: </b><a href="mailto:"' + email + '">' + email + '</a><br>' +
                '<b>Website: </b><span id="website-span"><a id="website">' + website + '</a></span><br>' +
            '</div>' +
            '<div id="instructions">' +
                '<button id="directions-from-here" onclick="onDirectionsFromHere()">Directions from here </button>' +
                '<button id="directions-to-here" onclick="onDirectionsToHere()">Directions to here </button><br>' +
              
            '</div>' +
        '</div>';
    
    return html;

}

function onDeleteRow(e){
    var $button = $(e.target);
    var $td = $($button[0].parentElement);
    var $row = $($td[0].parentElement);
    var id = $row.attr('id');

    for (var i=0; i<starMarkers.length; ++i) {
        if (starMarkers[i].name === id) {
            starMarkers[i].setMap(null);
            starMarkers = starMarkers.slice(0, i).concat(starMarkers.slice(i+1));
            break;
        }
    }

    $row.remove();
    setRankOnSchoolComparison();
}

function onArrowUp(e) {
    console.log("onArrowUp e ",e);
    var $button = $(e.currentTarget);
    var $td = $($button[0].parentElement);
    var $row = $($td[0].parentElement);    
    var currRowIndex = parseInt($row[0].rowIndex);

    console.log("onArrowUp::currRowIndex ", currRowIndex);

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
    console.log("onArrowDown e", e);
    var $button = $(e.currentTarget);
    var $td = $($button[0].parentElement);
    var $row = $($td[0].parentElement);    
    var currRowIndex = parseInt($row[0].rowIndex);
    
    var numRows = document.getElementById("favorites-table-body").rows.length;

    console.log("onArrowDown::currRowIndex ", currRowIndex);
    console.log("onArrowDown::numRows ", numRows);
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

    for (var i=0; i<starMarkers.length; ++i) {
        if (starMarkers[i].name === name) {
            starMarkers[i].setMap(null);
            starMarkers = starMarkers.slice(0, i).concat(starMarkers.slice(i+1));
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

function createMarker(lat, lng, name, gradesServed, website) {
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
        name: website,
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
        map_icon_label: '<span class="map-icon map-icon-school"><span class="marker-label"><br>' + grade + '</span></span>'
    });

    return marker;
}

function removeAllMarkers() {
    for (var i = 0; i < markers.length; ++i) {
        var marker = markers[i];
        marker.setMap(null);
    }
}


function showStarMarkers() {
    for (var i = 0; i < starMarkers.length; ++i) {
        var starMarker = starMarkers[i];
        starMarker.setMap(map);
    } 
}

// function bindHomeInfoWindow (marker, map, html) {
//     google.maps.event.addListener(marker, 'click', function (event) {
//         infoWindow.close();
//         infoWindow.setContent(html);
//         onShowAttendanceArea();
//     });
// }

function bindInfoWindow(marker, map, html) {
    google.maps.event.addListener(marker, 'click', function (event) {
        infoWindow.close();
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    google.maps.event.addListener(infoWindow,'closeclick',function(){
       directionsDisplay.setMap(null);
       directionsDisplay.setPanel(null);

    });
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
        var startTime = school.start_time;
        var endTime = school.end_time;
        var middleSchoolFeeder = school.middle_school_feeder;
        var principal = school.principal;
        var address = school.address;
        var phone = school.phone_number;
        var fax = school.fax_number;
        var email = school.email;
        var website = school.website;
        var gradesServed = school.grades_served[0];
        

        var html = getHtml(name, startTime, endTime, middleSchoolFeeder,
                        principal, address, phone, fax, email, website, lat, lng);

        var marker = createMarker(lat, lng, name, gradesServed);
        markers.push(marker);

        bindInfoWindow(marker, map, html);

    }
}


$('#map-choices-form').on('submit', function (e) {
    e.preventDefault();

    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);

    var inputs = $("#map-choices-form").serializeArray();

    $.get("/map-checked.json", inputs, addMarkers);
    starMarkers.forEach(function(marker) {
        marker.setMap(map);
    });
    homeMarkers.forEach(function(marker) {
        marker.setMap(map);
    });
})


//check all checkboxes
$(".check-all").change(function () {
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
    var isExpanded = $(this).hasClass("isExpanded");
    if (isExpanded) {
        $(this).removeClass("glyphicon-chevron-right").addClass("glyphicon glyphicon-chevron-down");         
    } else {
        $(this).removeClass("glyphicon glyphicon-chevron-down").addClass("glyphicon glyphicon-chevron-right");
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

            // Add a listener for the click event.
            // attendanceAreaPolygon.addListener('click', getAttendanceAreaName);

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

    var windowWidth = $(window).width();
    var MD_WIDTH = 992;

    $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
    });

    $("#hide-side-nav").click(function(e) {
        e.preventDefault();
        if (windowWidth >= MD_WIDTH) { 
            $("#show-side-nav").show();
        }
        $("#wrapper").toggleClass("toggled");
        $("#hide-side-nav").hide();

        // fix this
        $("#directions-panel").show();
        
    });

    
    $("#show-side-nav").click(function(e) {
        e.preventDefault();
        $("#hide-side-nav").show();
        $("#wrapper").toggleClass("toggled");
        $("#show-side-nav").hide();
        $("#directions-panel").hide();
        document.getElementById('map').style.width = '100%';

    });

    // setting up screen
    if (windowWidth >= MD_WIDTH) {
        gtMdWidth = true;
        $("#show-side-nav").hide();
        $("#wrapper").toggleClass("toggled");
        $("#menu-toggle").hide();
    } else {
        gtMdWidth = false;
        $("#show-side-nav").hide();
        $("#hide-side-nav").click();
        $("#hide-side-nav-div").hide();
    }

    var headerHeight = $("#header").height();
    var mapHeight = $("#map").height();
    $("#map").height(mapHeight - headerHeight - 60);
    $("#header-row").height(headerHeight);
    console.log("heder row height", 0.7 * $("#header-row").height());
    console.log("heaer height ", headerHeight);

    var headerImgWidth = 0.7 * $("#header-img").width();
    var headerImgHeight = 0.7 * $("#header-img").height();
    $("#header-img").width(headerImgWidth);
    $("#header-img").height(headerImgHeight);

    // instantiate map and populate counts on criteria
    var chart = initialize();
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

    $.get("/attendance-area-coordinates.json", populateAttendanceAreaPolygon);
    $.get("/ctip1-area-xy-coordinates.json", populateCtip1Polygon);

    // modal window set up
    var pageWidth = $("#page-content-wrapper").width();
    $(".modal-dialog").width(pageWidth * .75);
    $(".modal-body").height($("#map").height() * .75);
    $("#print-btn").on("click", function() { 
        printElement(document.getElementById("printThis"));
    });
    $("#show-favorites-btn").on("click", function() {$("#modal").modal('show');});
    
    $('body').on('click', '#website', function (e) { 
        var innerHtml = e.currentTarget.innerHTML;
        console.log("innerHtml is ", innerHtml);
        window.open(innerHtml, "_blank");
    });

});
