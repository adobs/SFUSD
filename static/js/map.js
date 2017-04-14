// TODO

//// FRIDAY 

//// SATURDAY data clean
// compare number of schools in excel vs some other source
// add websites; confirm all websites are correct
// correctly label all city schools
// add in all emails
// add in SARC url

//// SUNDAY
// add all relevant commenting to code
// APIs used
// add a comment section => come up w checklist
//// longer term condiersations -- nice to have
// add an FAQ / how to use page
// add in google analytics to the page?
// fix overlapping icons
// add in a tally of # of elem / middle / high schools matched and put in upper right corner on map


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
var infoWindowName, infoWindowAddress;
var originAddress, destinationAddress;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();        

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


function getHomeMarkerHtml (homeMarker, data) {
    var ctipBool = data.ctip ? "Tie-breaker" : "Not a tie-breaker";
    
    var html = '<div id="home-info-window-content">' +
            '<b>Test Score Area: </b>'+ ctipBool + '<br>' +
            '<b>Attendance Area: </b>'+ aaname + '<br>' +
            '<button id="show-attendance-area">Show only ' + aaname.toUpperCase() + ' schools</button>' +
        '</div>';
    
    return html;
}

function resetAttendanceArea() {

    repopulateStarMarkers();
    if (aarea) {
        aarea.setOptions({
            fillColor: "#000",
            fillOpacity: 0
        });
    }
    markers.forEach(function(marker, index, array) {
        var elemGrades = ["PreK-5", "PreK-8", "K-5", "K-8"]
        if (marker.customInfo.citySchool === "Yes" && elemGrades.indexOf(marker.customInfo.gradesServed) !== -1) {
            marker.icon.fillColor = "#F54900";
            var html =  marker.customInfo.html.replace(/style="color:#F54900"/, '');
            marker.customInfo.html = html;
            bindInfoWindow(marker, map, html);
            array[index] = marker;
        }
    });
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
        if (!marker.getMap()) {
            return;
        }
    
        attendanceAreaPolygonArray.forEach(function(element) {
            var markerAaname = undefined;
            
            if (google.maps.geometry.poly.containsLocation(marker.position, element)) {
                markerAaname = element.name;
            }
            
            if (markerAaname !== aaname) {
                marker.setMap(null);
                marker.customInfo.starMarker.setMap(null);
            
            } else { 
                var customInfo = marker.customInfo;
        
                fillColor = array[index].icon.fillColor;
                color = "#000";

                // elem
                if (marker.customInfo.citySchool === "Yes" && array[index].icon.fillColor === "#F54900") {
                    fillColor = "#FF9F75";
                    color = "#F54900";
                    var html = marker.customInfo.html.replace(/id="city-wide"/, 'id="city-wide" style="color:' + color +'"').replace(/<span id="info-sign-span">/, '&nbsp;<span id="info-sign-span" class="glyphicon glyphicon-info-sign" aria-hidden="true" <span id="info-sign" class="glyphicon glyphicon-info-sign" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Attendance area tie-breaker does not apply for city-wide schools"></span>');    
                    customInfo.html = html;                
                } else {
                    html = marker.customInfo.html;
                }
                
                var starMarker = marker.customInfo.starMarker;

                markers[index] = new Marker({
                                name: marker.name,
                                customInfo: customInfo,
                                map: map,
                                position: marker.position,
                                icon: {
                                    path: SQUARE_PIN,
                                    fillColor: fillColor,
                                    fillOpacity: 1,
                                    strokeColor: '#fff',
                                    strokeWeight: 0,
                                    scale: 0.7
                                },
                                map_icon_label: marker.map_icon_label
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
    if (homeInfoWindow.content.indexOf("Reset") !== -1) {
        isOnlyAttendanceArea = false;

        var resetContent = homeInfoWindow.content.replace(/Reset/, "Show only " + aaname.toUpperCase() + " schools");
        homeInfoWindow.setContent(resetContent);
       
        $("#map-choices-form").submit();       

    } else {
        
        isOnlyAttendanceArea = true;
        resetContent = homeInfoWindow.content.replace(/Show only .* schools/, 'Reset');
        homeInfoWindow.setContent(resetContent);

        showOnlyAttendanceArea();
        
       
    }

    $("#show-attendance-area").on("click", onShowAttendanceArea);
}


function onReturn() {
    $("#wrapper").toggleClass("toggled");
    $("#directions-panel").hide();
     directionsDisplay.setMap(null);
     directionsDisplay.setPanel(null);
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
    if (homeMarker) {
        homeMarker.setMap(null)
    }
}

function onToHere (travelMode) {
    var el = document.querySelector('#info-window-content');
    var destination = infoWindowAddress;
    if (!originAddress) {
        return;
    }
    getDirections(originAddress, destination, travelMode);
}

function onFromHere (travelMode) {
    var el = document.querySelector('#info-window-content');

    var origin = infoWindowAddress;
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

function colorDirectionsButtons(address) {
    if (address) {
        $("#driving-directions-to-here").css('background-color','#fad355');
        $("#public-directions-to-here").css('background-color','#fad355');
        $("#driving-directions-from-here").css('background-color','#fad355');
        $("#public-directions-from-here").css('background-color','#fad355');
    }
    
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
    
    colorDirectionsButtons(address);
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
    infoWindowAddress = el.dataset.address;
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
            '<button id="driving-directions-from-here" class="btn">Get driving directions</button>&nbsp;<button class="btn" id="public-directions-from-here">Get public transit directions</button><br>' +
        '</div>';
    
    infoWindow.setContent(html)
    
    var input = document.getElementById('address-input');
    
    if (address) {
        $("#address-input")[0].value = address;
        destinationAddress = address;
    }

    colorDirectionsButtons(address);
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        destinationAddress = place.formatted_address;
        $("#driving-directions-to-here").css('background-color','#fad355');
        $("#public-directions-to-here").css('background-color','#fad355');
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
    infoWindowAddress = el.dataset.address;
    
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
                '<textarea class="comments" wrap="on"></textarea>' +
            '</td>' +
            '<td>' +
                '<button class="delete-row">Remove</button>' +
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
   
    updateStarCookies();
    updateFavoritesTableCookies();

}

function getHtml(name, gradesServed, startTime, endTime,
                        principal, address, phone, fax, email, website, lat, lng, citySchool){

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
    updateStarCookies();
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

    updateFavoritesTableCookies();
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
    updateFavoritesTableCookies();
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
            strokeWeight: 0,
            scale: 0.7
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


function updateFavoritesTable() {
    var favoritesTableBodyHtml = getCookies("favoritesTable");
    $("#favorites-table-body").html(favoritesTableBodyHtml);
    
    // add back click events on buttons
    $(".arrow-up").on("click", onArrowUp);
    $(".arrow-down").on("click", onArrowDown);
    $(".delete-row").on("click", onDeleteRow);
}

function updateStarMarkers() {
    var starCookiesString = getCookies("starNames");
    var starCookies = starCookiesString.split(",");
    for (var i=0; i<starCookies.length; ++i) {
        var starName = starCookies[i];
        markers.forEach(function(marker, index, array) {
            if (marker.name === starName) {
                array[index].customInfo.starred = "starred";
                array[index].customInfo.starMarker.starred = "starred";
            }
        });

        starMarkers.forEach(function(starMarker, index, array) {
            if (starMarker.name === starName) {
                array[index].customInfo.starred = "starred";
            }
        });
    }
}

function getCookies(cookieName) {
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


function filterMarkers(checkedGradesServed, checkedCitySchool, checkedMP, checkedBeforeSchool, checkedAfterSchool) {
    var counter =0;
    var nullCounter = 0;
    markers.forEach(function(marker, index, array) {
        var customInfo = marker.customInfo;
        marker.setMap(null);
        marker.customInfo.starMarker.setMap(null);
        ++nullCounter;
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
            ++counter;
            if (marker.customInfo.starred === "starred") {
                marker.customInfo.starMarker.setMap(map);
            }
        }
    });
    
    return Promise.resolve();
}

$('#map-choices-form').on('submit', function (e) {
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
   

})

function onSelectAllCheck(e, name) {
    if ($(e.currentTarget).prop("checked")) {
        $("input[name='" +name + "']").prop("checked", true);
    } else {
        $("input[name='" +name + "']").prop("checked", false);        
    }
    checkforSelectDeselect(e, name);
}

function checkforSelectDeselect (e, name) {
    var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
    var numTotal = $("#" + name + "-form").find($("input[name='"+ name  + "']")).length;

    if (numChecked === numTotal) {
        $("#check-all-" + name).prop("checked", true);
        $("input[name='" + name + "']").prop("checked", true);
        $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Deselect All";
   
 
    } else if (numChecked === 0) {
        $("#check-all-"+name).prop("checked",false);
        $("input[name='" + name + "']").prop("checked", false);
    
        if (name === "c-s") {
            $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Select All Schools";
        } else {
            $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Select All";
        }
    
    } 
    countCheckboxes(name);
 
}

//check all checkboxes
// $(".check-all").on("change", checkforSelectDeselect);

function countCheckboxes(name) {
    // var name = $(this)[0].name;
    var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
    var numTotal = $("#" + name + "-form").find($("input[name='"+ name  + "']")).length;
    $("#" + name + "-count").html(numChecked + " / "+ numTotal);
}

// change the arrow direction when toggling to collapse / show checkboxes
$(".arrow-collapse-link").on("click", function(e) {
    $(this).toggleClass("isExpanded")
    
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
    $(".modal-body").height($(window).height() - 150);
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
    
    $("#printSection").html(printHtml);
    // $("#printSection").append($("#printThis").clone());
    window.print();
}

function onTabClick() {

    $("#wrapper").toggleClass("toggled");

    if ($("#tab-btn").hasClass("toggled")) {
        $("#tab-btn").html("&lt;&lt;");
    } else {
        $("#tab-btn").html("&gt;&gt;");

    }
    $("#tab-btn").toggleClass("toggled");
}

function initCounters() {
    var countArr = $(".count");
    
    for (var i=0; i < countArr.length; ++i) {
        var element = countArr[i];
        var name = ($(element).attr('id')).slice(0, -6);
        var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
        var numTotal = $("#" + name + "-form").find($("input[name='"+ name  + "']")).length;
        $(element).html(numChecked + " / " + numTotal);            
    };
}

function initMapInfo() {
    $.get("/map-checked.json", addMarkers);
    $.get("/attendance-area-coordinates.json", populateAttendanceAreaPolygon);
    $.get("/ctip1-area-xy-coordinates.json", populateCtip1Polygon);
    
    $("input:checkbox").on("change", function(e) {
        e.preventDefault();
        $("#map-choices-form").submit();
        var name = $(this)[0].name;

        var num = "check-all-".length;
        var isIndividualCheck = name.indexOf('check-all-') === -1;
        
        if (isIndividualCheck) {
            checkforSelectDeselect(e, name);
        } else {
            name = name.slice(num);
            onSelectAllCheck(e, name);   
        }
    });
    $("#show-favorites-btn").on("click", onShowFavoritesModal);
}

function initTieBreakerButtons() {
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

}

function updateFavoritesTableCookies() {
    document.cookie = "favoritesTable=;";
    var favoritesTableBodyHtml = $("#favorites-table-body").html();
    document.cookie = "favoritesTable=" + favoritesTableBodyHtml + ";";
}


function updateStarCookies() {
    document.cookie = "starNames=;";
    var starNames = [];
    for (var i=0; i<markers.length; ++i) {
        var marker = markers[i];
        if (marker.customInfo.starred === "starred") {
            starNames.push(marker.name);
        }
    }
    var starNamesString = starNames.join(",");
    document.cookie = "starNames=" + starNamesString + ";";
}


$(document).ready(function() {
    // tooltip for info button
   $('[data-toggle="tooltip"]').tooltip(); 

    var windowWidth = $(window).width();
  
    // setting up screen
    if (windowWidth >= MD_WIDTH) {
        gtMdWidth = true;
    } else {
        $("#wrapper").removeClass("toggled");
        gtMdWidth = false;
    }
  
    $("#directions-panel").hide();

    // map height set up
    var headerHeight = $("#header").height();
    $("#map").css("cssText", "height:" + ($(window).height() - headerHeight) + "px !important;");
    
    // modal window set up
    var pageWidth = $("#page-content-wrapper").width();
    $(".modal-dialog").width(pageWidth * .75);
    $(".modal-body").height($("#map").height() * .75);
    $("#print-btn").on("click", function() { 
        printElement(document.getElementById("printThis"));
    });
   
    // enable all websites in future info windows to open correctly
    $('body').on('click', '#website', function (e) { 
        var innerHtml = e.currentTarget.innerHTML;
        window.open(innerHtml, "_blank");
    });

    // initialize functionality
    initTieBreakerButtons();
    initMapInfo();
    initGoogleMaps();
    initCounters();
    initAutocomplete(); 
});
