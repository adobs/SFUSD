// TODO
// add the complete elementary, middle, high school
// color code the e, m, h, school and add a key
// geocode the addresses of the schools (reverse geocode) to get the actual neighborhood

// general formatting
// messaging to expalin attendance area
// add all relevant commenting to code
// add directions to here/from here
// get school tour information
// add the CTIP to the info window


var map;
var infoWindow = new google.maps.InfoWindow({
  width: 150
});
var gtMdWidth;
var attendanceArea;

var markers = [];

function initialize() {
    var sanFrancisco = { lat: 37.760099, lng: -122.434633 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: sanFrancisco
    });

    
    initAutocomplete();

    return map;
}

function initAutocomplete() {
   
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    console.log("this._gtMdWidth is ", gtMdWidth);
    if (gtMdWidth) {
        var toggleButton = document.getElementById('toggle-search-div');
        var inputDiv = document.createElement('div');
    
        inputDiv.appendChild(toggleButton);
        inputDiv.appendChild(input);

        inputDiv.index = 1;
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(inputDiv);
    } else {
        // set right size of the hamburger option
        var menuWidth = $("#menu-toggle").width();
        var windowWidth = $(window).width();

        var searchBarWidth = windowWidth - menuWidth - 30;
        $(".pac-card").width(searchBarWidth);
        $("#pac-input").width(searchBarWidth);
        $("#pac-input").css("flex-shrink", "1");
        $(".pac-card").css("flex-shrink", "1");

    }

    
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    var homeMarkers = [];
    searchBox.addListener('places_changed', function() {

        var places = searchBox.getPlaces();

        if (places.length == 0) {
           return;
        }

        // Clear out the old markers.
        homeMarkers.forEach(function(marker) {
           marker.setMap(null);
        });
        homeMarkers = [];

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
            var homeMarker = new google.maps.Marker({
                map: map,
                animation: google.maps.Animation.DROP,
                icon: image,
                title: place.name,
                position: place.geometry.location
            });
            homeMarkers.push(homeMarker);
            var aaname;
            google.maps.event.addListener(homeMarker, "click", function(event) { 
                    attendanceAreaPolygonArray.forEach(function(element, index, array) {
                        if (google.maps.geometry.poly.containsLocation(event.latLng, element)) {
                            aaname = element.name; 
                        }
                   });
                    addHomeMarkerInfoWindow(homeMarker, { aaname: aaname })
                }); 
            
            // Bias the SearchBox results towards current map's viewport.
            map.setCenter(place.geometry.location);

        });
    
    });
}

function onShowAttendanceArea() {
    attendanceAreaPolygonArray.forEach(function(element) {
        markers.forEach(function(marker) {
            if (google.maps.geometry.poly.containsLocation(marker.position, element) && element.name !== attendanceArea) {
                marker.setMap(null);
            }  
        })
    });
    $("#form-submit").val("Redo Search")
}


function addHomeMarkerInfoWindow (homeMarker, data) {
    attendanceArea = data.aaname;
    // var ctipScore = data.ctip;
    var homeInfoWindow = new google.maps.InfoWindow({
        width: 150
    });

    var html = '<div id="home-info-window-content">' +
            '<b>Attendance Area: </b>'+ attendanceArea + '<br>' +
            // '<b>CTIP score: </b>'+ ctipScore + '<br>' +
            '<button id="showAttendanceArea" onclick="onShowAttendanceArea()">Show only ' + attendanceArea.toUpperCase() + ' schools</button>' +
        '</div>';
    
    bindInfoWindow(homeMarker, map, homeInfoWindow, html);
}



function getHtml(name, startTime, endTime, middleSchoolFeeder,
                        principal, address, phone, fax, email, website){
    html =
        '<div id="info-window-content">' +
            '<div id="content">' +
                '<b>' + name + '</b><br>' +
                '<b>Start Time: </b>'+ startTime + '<br>' +
                '<b>End Time: </b>'+ endTime + '<br>' +
                '<b>Feeder: </b>'+ middleSchoolFeeder + '<br>' +
                '<b>Principal: </b>'+ principal + '<br>' +
                '<span id="address"><b>Address: </b>'+ address + '</span><br>' +
                '<b>Phone: </b>'+ '<a href="tel:' + phone +'">' + phone + '</a><br>' +
                '<b>Fax: </b>'+ fax + '<br>' +
                '<p><b>Email: </b>'+ email + '<br>' +
                '<b>Website: </b>'+ '<a href="' + website + '">' + website + '</a><br>' +
                // '<hr>' +
            '</div>' +
            // '<div id="instructions">' +
            //     '<button id="directions-to-here" onclick="onDirectionsToHere()">Directions to here </button><br>' +
            //     '<a id="directions-from-here">Directions from here </a><br>' +
            // '</div>' +
        '</div>';
  
    
    return html;

}





function createMarker(lat, lng, name){
    var position = {lat: lat, lng: lng};

    var marker = new google.maps.Marker({
        position: position,
        title: name,
        map: map
    });

    return marker;
}

function removeAllMarkers() {
    for (var j = 0; j < markers.length; j++) {
        var marker = markers[j];
        marker.setMap(null);
    }
}

function bindInfoWindow(marker, map, infoWindow, html) {
    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.close();
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
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
        

        var html = getHtml(name, startTime, endTime, middleSchoolFeeder,
                        principal, address, phone, fax, email, website);

        var marker = createMarker(lat, lng, name);
        markers.push(marker);

        bindInfoWindow(marker, map, infoWindow, html);
    }

}


$('#map-choices-form').on('submit', function (e) {
    e.preventDefault();
    $("#form-submit").val("Submit");
    var inputs = $("#map-choices-form").serializeArray();

    $.get("/map-checked.json", inputs, addMarkers);

});


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
            attendanceAreaPolygon.addListener('click', getAttendanceAreaName);

            attendanceAreaPolygonArray.push(attendanceAreaPolygon);
        }
    }
}

function getAttendanceAreaName(event) {
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
    });
    
    $("#show-side-nav").click(function(e) {
        e.preventDefault();
        $("#hide-side-nav").show();
        $("#wrapper").toggleClass("toggled");
        $("#show-side-nav").hide();
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

    // instantiate map and populate counts on criteria
    var chart = initialize();
    var countArr = $(".count");
  
    for (var i=0; i < countArr.length; ++i) {
        var element = countArr[i];
        var name = ($(element).attr('id')).slice(0, -6);
        var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
        $(element).html(numChecked);            
    };
   
    
    $("#map-choices-form").submit();

    $.get("/attendance-area-coordinates.json", populateAttendanceAreaPolygon)

});
