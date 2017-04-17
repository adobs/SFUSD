/**
 * directions.js - creation of map and map objects such as markers, info windows, and handling of markers on user-generated events
 *
 * PRIVATE FUNCTIONS
    getDirections
    colorDirectionsButtons
    setOnDirectionsToHere
    setOnDirectionsFromHere
 *
 * EVENT HANDLERS
    onDirectionsToHere
    onToHere
    onFromHere
    onReverseFromHere
    onReverseToHere
    onReturn
 * 
 */

////////////////////
/**
 * PRIVATE FUNCTIONS
 */
////////////////////

/**
 * getDirections - gets Google Maps directions and dispalys in the #directions-panel
 *
 * @param      {String}  origin       - The origin address
 * @param      {String}  destination  - The destination address
 * @param      {String}  travelMode   - The travel mode (Driving / Public Transit)
 */
function getDirections(origin, destination, travelMode) {
    var center = map.getCenter();
    
    // hide the left side nav
    $("#wrapper").toggleClass("toggled");
    
    // fix mapWidth to compensate for directions showing up and left side nav disappearing   
    var pageWidth = $("#page-content-wrapper").width() + 220;
    var mapWidth = 0.75 * pageWidth - 30;
    var directionsWidth = 0.25 * pageWidth - 50;
    $("#map").width(mapWidth);

    map.setCenter(center);

    // Google maps textbook call for getting directions and displaying in the #directions-panel
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

/**
 * colorDirectionsButtons - when an address is enetered, change directions buttons colors from grey to yellow
 *
 * @param      {String}  address  - The address entered
 */
function colorDirectionsButtons(address) {
    if (address) {
        $("#driving-directions-to-here").css('background-color','#fad355');
        $("#public-directions-to-here").css('background-color','#fad355');
        $("#driving-directions-from-here").css('background-color','#fad355');
        $("#public-directions-from-here").css('background-color','#fad355');
    }   
}

/**
 * setOnDirectionsToHere - changes html so directions are now TO here (instead of FROM here)
 *
 * @param      {String}  address  The new destination address (previously the origin address)
 */
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

    // update info window to switch the beginning/end of route; color the directions buttons per expected 
    infoWindow.setContent(html)
    colorDirectionsButtons(address);

    // add autocomplete functionality to the input destination box
    var input = document.getElementById('address-input');    
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

/**
 * setOnDirectionsFromHere - changes html so directions are now FROM here (instead of TO here)
 *
 * @param      {String}  address  - The new origin address (previously the destination address)
 */
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
    
    // update info window to switch the beginning/end of route; color the directions buttons per expected 
    infoWindow.setContent(html)
    colorDirectionsButtons(address);
    
    var input = document.getElementById('address-input');
    if (address) {
        $("#address-input")[0].value = address;
        destinationAddress = address;
    }

    // add autocomplete functionality to the origin box
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

/////////////////
/**
 * EVENT HANDLERS
 */
/////////////////

/**
 * onDirectionsToHere - event handler for when user clicks on the "Directions" button inside a given school marker info window
 *
 * @param      {Event}  e       - the event object
 */
function onDirectionsToHere(e) {
    var el = document.querySelector('#info-window-content');
    infoWindowName = el.dataset.name;
    infoWindowAddress = el.dataset.address;
    setOnDirectionsToHere();
}

/**
 * onToHere - event handler when user clicks to get directions from home to school selected
 *
 * @param      {String}  travelMode - The travel mode (driving / public transit)The travel mode
 * @param      {Event}  e           - The event object
 */
function onToHere (travelMode, e) {
    var el = document.querySelector('#info-window-content');
    var destination = infoWindowAddress;
    if (!originAddress) {
        return;
    }
    getDirections(originAddress, destination, travelMode);
}

/**
 * onFromHere - event handler when user clicks to get directions from school selected to home
 *
 * @param      {String}  travelMode - The travel mode (driving / public transit)The travel mode
 * @param      {Event}  e           - The event object
*/
function onFromHere (travelMode, e) {
    var el = document.querySelector('#info-window-content');

    var origin = infoWindowAddress;
    if (!destinationAddress) {
        return;
    }
    getDirections(origin, destinationAddress, travelMode);
}

/**
 * onReverseToHere - event handler to switch from/to and get directions
 *
 * @param      {Event}  e       - The event object
 */
function onReverseToHere(e) {
    var address = $("#address-input")[0].value;
    setOnDirectionsFromHere(address);
}

/**
 * onReverseFromHere - event handler to switch to/from and get directions
 *
 * @param      {Event}  e       - The event object
 */
function onReverseFromHere(e) { 
    var address = $("#address-input")[0].value;
    setOnDirectionsToHere(address);
}

/**
 * onReturn - event handler for when user is viewing driving directions and clicks the "Return" button to go back to normal view
 *
 * @param      {Event}  e       - the event object
 */
function onReturn(e) {
    // expand left side nav, reset sizing for #page-content-wrapper, hide #directions panel
    $("#page-content-wrapper").width("100%");
    $("#wrapper").toggleClass("toggled");
    $("#directions-panel").hide();
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
    showMarkers();
}

