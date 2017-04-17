/**
 * attendancearea.js - populating attendance area + low test score area polygons, and filtering markers based on that info
 *
 * PRIVATE FUNCTIONS
    showOnlyAttendanceArea
    resetAttendanceArea
 *
 * EVENT HANDLERS
    onShowAttendanceArea
 *
 * AJAX CALLBACKS
    populateAttendanceAreaPolygon
    populateCtip1Polygon
 * 
 */
 
////////////////////
/**
 * PRIVATE FUNCTIONS
 */
////////////////////

/**
 * showOnlyAttendanceArea - shows only markers that are in the attendance area, hides the rest
 */
function showOnlyAttendanceArea() {
    if (!aarea) {
        return;
    }

    markers.forEach(function(marker, index, array) { 
        if (!marker.getMap()) {
            return;
        }
        
        // iterate through each attendance area, and check if the given marker is in the attendance are
        // if it is, show the marker, and also have additional formatting if it is a city school
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

                // elem schools have special formatting if in an attendance area but IS ALSO a city school
                if (marker.customInfo.citySchool === "Yes" && array[index].icon.fillColor === "#F54900") {
                    fillColor = "#FF9F75";
                    color = "#F54900";
                    var html = marker.customInfo.html.replace(/id="city-wide"/, 'id="city-wide" style="color:' + color +'"').replace(/<span id="info-sign-span">/, '&nbsp;<span id="info-sign-span" class="glyphicon glyphicon-info-sign" aria-hidden="true" <span id="info-sign" class="glyphicon glyphicon-info-sign" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Attendance area tie-breaker does not apply for city-wide schools"></span>');    
                    customInfo.html = html;                
                } else {
                    html = marker.customInfo.html;
                }
                
                var starMarker = marker.customInfo.starMarker;
                console.log("IS THIS MARKER ", starMarker);
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

                bindInfoWindow(markers[index], html);
                bindInfoWindowFavoriteStar(starMarker, html);
            }
        });
    });

    // shade the attendance area
    aarea.setOptions({
        fillColor: "#fad355",
        fillOpacity: 0.8
    });
}

/**
 * resetAttendanceArea - removes any style changes, and resets markers to show regardless of attendance area
 */
function resetAttendanceArea() {

    // make all star markers that were visible before, visible again
    repopulateStarMarkers();

    // unshade the attendance area
    if (aarea) {
        aarea.setOptions({
            fillColor: "#000",
            fillOpacity: 0
        });
    }

    // remove any formatting for elementary schools that were applied in Show Attendance area mode
    markers.forEach(function(marker, index, array) {
        var elemGrades = ["PreK-5", "PreK-8", "K-5", "K-8"]
        if (marker.customInfo.citySchool === "Yes" && elemGrades.indexOf(marker.customInfo.gradesServed) !== -1) {
            marker.icon.fillColor = "#F54900";
            var html =  marker.customInfo.html.replace(/style="color:#F54900"/, '');
            marker.customInfo.html = html;
            bindInfoWindow(marker, html);
            array[index] = marker;
        }
    });
}

/////////////////
/**
 * EVENT HANDLERS
 */
/////////////////

/**
 * onShowAttendanceArea - event handler when user clicks on "Show <attendance area> only" button
 *
 * @param      {Event}  e       - event object
 */
function onShowAttendanceArea(e) {
    // user clicked on the button to Reset, so now will show all markers, and change the text on the button
    if (homeInfoWindow.content.indexOf("Reset") !== -1) {
        isOnlyAttendanceArea = false;

        var resetContent = homeInfoWindow.content.replace(/Reset/, "Show only " + aaname.toUpperCase() + " schools");
        homeInfoWindow.setContent(resetContent);
       
        $("#map-choices-form").submit();       

    // user clicked on the button to show only attendance area, so now will show only valid markers, and change text on button
    } else {
        isOnlyAttendanceArea = true;
        resetContent = homeInfoWindow.content.replace(/Show only .* schools/, 'Reset');
        homeInfoWindow.setContent(resetContent);

        showOnlyAttendanceArea();      
    }

    // rebind the handler to the button
    $("#show-attendance-area").on("click", onShowAttendanceArea);
}

//////////////////
/**
 * AJAX CALLBACKS
 */
//////////////////

/**
 * populateAttendanceAreaPolygon - AJAX callbcak that adds attendance area polygons on the map
 *
 * @param      {JSON}  data    - The attendance area data: a list of dictionaries [{name: [coordinates]}]
                                  where coordinates = [lat, lng] 
                                  => [{name: [[lat, lng],[lat, lng]]}]
 */
function populateAttendanceAreaPolygon (data) {
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

/**
 * populateCtip1Polygon - AJAX callback that uses data to create the low test score CTIP1 Google maps polygons
 *
 * @param      {JSON}  data    - The data containing polygon geographical permiter information
 */
function populateCtip1Polygon(data) {
    // use the ArcGIS API to parse through this data format - https://developers.arcgis.com/javascript/3/jsapi/esri.geometry.webmercatorutils-amd.html
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
