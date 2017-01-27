// TODO
 // 72 elementary schools, 13 middle schools, and 14 high schools to choose from

var map;
var infoWindow = new google.maps.InfoWindow({
  width: 150
});

function initialize() {
    var sanFrancisco = { lat: 37.760099, lng: -122.434633 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: sanFrancisco
    });

    initAutocomplete();

    return map;
}

function loadKmlLayer(src, map) {
    console.log("in load layer");
        var kmlLayer = new google.maps.KmlLayer(src, {
          suppressInfoWindows: true,
          preserveViewport: false,
          map: map
        });
        google.maps.event.addListener(kmlLayer, 'click', function(event) {
          var content = event.featureData.infoWindowHtml;
          // var testimonial = document.getElementById('capture');
          // testimonial.innerHTML = content;
        });
      }

function initAutocomplete() {
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(input);


    var homeMarkers = [];
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

            // get the CTIP info for the marker
            $.get("/ctip.json", {placeId: place.place_id}, addHomeMarkerInfoWindow.bind(this, homeMarker));
            
            // Bias the SearchBox results towards current map's viewport.
            map.setCenter(place.geometry.location);

        });
    
    });
}

var attendanceArea;
function addHomeMarkerInfoWindow (homeMarker, data) {
    attendanceArea = data.aaname;
    var ctipScore = data.ctip;
    var homeInfoWindow = new google.maps.InfoWindow({
        width: 150
    });

    var html =
        '<div id="home-info-window-content">' +
            '<b>Attendance Area: </b>'+ attendanceArea + '<br>' +
            '<b>CTIP score: </b>'+ ctipScore + '<br>' +
            // '<button id="showAttendanceArea" onclick="onShowAttendanceArea()">Show only schools in my attendance area</button>' +
        '</div>';
    
    bindInfoWindow(homeMarker, map, homeInfoWindow, html);
   

    
}
function onShowAttendanceArea() {
    // console.log("e is ", e);
    console.log("worked");
    console.log("attendacne area of ", attendanceArea);
    // $.get("/attendance-area.json", {attendanceArea: attendanceArea}, addMarkers);
    // console.log("this is ", this);
    // console.log("$(this) is ", $(this));
}
// function addHomeMarkerInfoWindow (homeMarker, data) {

//     var attendanceArea = data.aaname;
//     var ctipScore = data.ctip;
//     var html =
//         '<div id="home-info-window-content">' +
//             '<b>Attendance Area: </b>'+ attendanceArea + '<br>' +
//             '<b>CTIP score: </b>'+ ctipScore +
//         '</div>';

//     bindInfoWindow(homeMarker, map, homeInfoWindow, html);    
// }


// function calcRoute() {
//     var start = document.getElementById('start').value;
//     var end = document.getElementById('end').value;
//     var request = {
//         origin: start,
//         destination: end,
//         travelMode: 'DRIVING'
//     };

//     directionsService.route(request, function(response, status) {
//         if (status == 'OK') {
//             directionsDisplay.setDirections(response);
//         }
//     });
// }

var onDirectionsToHere = function() {
        // change this to feed and receive the lat and the long
        var address = $("#address")[0].innerText.slice("Address:".length + 1)
        console.log("this is ", $(this));
        console.log("address is ", address);

        return false;
};



var markers = [];

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



function removeAllMarkers() {
    for (var j = 0; j < markers.length; j++) {
        var marker = markers[j];
        marker.setMap(null);
    }
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
    var inputs = $("#map-choices-form").serializeArray();

    $.get("/map-checked.json", inputs, addMarkers);

});


//check all checkboxes
// TODO bind all checkboxes so that when they are clicked they are checked
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
});

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


$(".check").on("change", function(e) {
    var name = $(this)[0].name;
    var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
    $("#" + name + "-count").html(numChecked);
});



function populateSFAttendanceAreaPolygon(data) {
    for (var aaName in data) {
        
        // // skip loop if the property is from prototype
        if (!data.hasOwnProperty(aaName)) {
            continue;
        }

        var coordinates = data[aaName]
        
        // convert lat/lng from string to float
        for (var i=0; i<coordinates.length; ++i) {
            var coordinate = coordinates[i];
            coordinate.lat = parseFloat(coordinate.lat);
            coordinate.lng = parseFloat(coordinate.lng);
        }
    

        var polygon = new google.maps.Polygon({
            paths: coordinates,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.8
        });
        
        polygon.setMap(map);
    }
       
}


// function calculatePlaceId(data) {

//     console.log("STEP 3 in calculate Place Id");
//     console.log("data is ", data);
//     var placeIds = {};
//     var counter = 0;
//     var geocoder = new google.maps.Geocoder;
            
//     for (var aanameKey in data) {
//         console.log("aanameKey is", aanameKey);
//         var aanameArr = data[aanameKey];
//         console.log("aanameArr is ", aanameArr);
//         for (var i=0; i<aanameArr.length; ++i) {
//             var prop = aanameArr[i];
//             // console.log("key is ", key);
//             var lat = prop.lat;
//             var lng = prop.lng;
//             var ctip = prop.ctip;
//             var aaname = prop.aaname;
//             var sfaddress = prop.sfaddress;
            
//             var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
//             geocoder.geocode({'location': latlng}, function(results, status) {
//                 console.log("status: ",status);
//                 if (status === 'OK') {
//                     for (var j=0; j< results.length; ++j) {
//                         console.log("place_id: ", results[j].place_id, "; aaname: ", aaname);
//                         counter = counter +1;
//                         console.log("counter ", counter);
//                     }
//                 }
//             });
//         }
//     }
//     // $.get("/add-place-id-to-csv.json", placeIds, function(){console.log("suuccesss");});
// }

// function makePlaceIds() {
//     console.log("STEP 1 in make place Is")
//     var inputs = {hello:"hello"};
//     $.get("/make-place-ids.json", inputs, calculatePlaceId)
// }

// function populateAttendanceAreaPolygon () {
//     var inputs = "test";

//     // $.get("/sf-attendance-area.json", inputs, populateSFAttendanceAreaPolygon);
// }

$(document).ready(function() {
    var chart = initialize();
    var countArr = $(".count");
  
    for (var i=0; i < countArr.length; ++i) {
        var element = countArr[i];
        var name = ($(element).attr('id')).slice(0, -6);
        var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
        $(element).html(numChecked);            
    };
   
    
    $("#map-choices-form").submit();

    // change this to populate after filling out the house value
    // populateAttendanceAreaPolygon();
    
    // makePlaceIds();
});
