var map;
// var directionsDisplay;
// var directionsService = new google.maps.DirectionsService();
// // call DirectionsService.route() to initiate a request to the Directions service, passing it a
// // DirectionsRequest object literal containing the input terms and a callback method to execute upon receipt of the response.
// var DirectionsRequestObjectLiteral = {
//   origin: LatLng | String | google.maps.Place,
//   destination: LatLng | String | google.maps.Place,
//   travelMode: TravelMode, //DRIVING | BICYCLING | TRANSIT | WALKING
//   transitOptions: TransitOptions,
//   drivingOptions: DrivingOptions,
//   unitSystem: UnitSystem,
//   waypoints[]: DirectionsWaypoint,
//   optimizeWaypoints: Boolean,
//   provideRouteAlternatives: Boolean,
//   avoidHighways: Boolean,
//   avoidTolls: Boolean,
//   region: String
// };
// directionsDisplay = new google.maps.DirectionsRenderer();


function initialize() {
    var sanFrancisco = { lat: 37.760099, lng: -122.434633 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: sanFrancisco
    });

    // directionsDisplay.setMap(map);
    // directionsDisplay.setPanel(document.getElementById('directionsPanel'));

    // var transitLayer = new google.maps.TransitLayer();
    // transitLayer.setMap(map);

    initAutocomplete();
   
    return map;
}

function initAutocomplete() {
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    // map.addListener('bounds_changed', function() {
    //     searchBox.setBounds(map.getBounds());
    // });

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
            homeMarkers = [new google.maps.Marker({
                map: map,
                // draggable: true,
                animation: google.maps.Animation.DROP,
                icon: image,
                title: place.name,
                position: place.geometry.location
            })];

            map.setCenter(place.geometry.location);

        });
    
    });
};

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

(function () {

    var infoWindow = new google.maps.InfoWindow({
      width: 150
    });
    var markers = [];

    function getHtml(name, startTime, endTime, middleSchoolFeeder,
                            principal, address, phone, fax, email, website){
        html =
            '<div id="content">' +
            '<b>' + name + '</b><br>' +
            '<b>Start Time: </b>'+ startTime + '<br>' +
            '<b>End Time: </b>'+ endTime + '<br>' +
            '<b>Feeder: </b>'+ middleSchoolFeeder + '<br>' +
            '<b>Principal: </b>'+ principal + '<br>' +
            '<b>Address: </b>'+ address + '<br>' +
            '<b>Phone: </b>'+ '<a href="tel:' + phone +'">' + phone + '</a><br>' +
            '<b>Fax: </b>'+ fax + '<br>' +
            '<p><b>Email: </b>'+ email + '<br>' +
            '<b>Website: </b>'+ '<a href="' + website + '">' + website + '</a><br>' +
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
        var num = "check-all".length;
        var name = ($(this).attr('id')).slice(num + 1);
        if ($(this).prop("checked")) {
            $("input[name='" + name + "']").removeProp("checked");
            $("input[name='" + name + "']").click();
        } else {
            $("input[name='" + name + "']").prop("checked");
            $("input[name='" + name + "']").click();
        }
        // $("input[name='" + name + "']:checkbox").prop('checked', $(this).prop("checked"));
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
        console.log("clicked on a checkbox");
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

    function populateAttendanceAreaPolygon () {
        var inputs = "test";

        $.get("/sf-attendance-area.json", inputs, populateSFAttendanceAreaPolygon);
    }

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
        populateAttendanceAreaPolygon();
        
    
    });

})();