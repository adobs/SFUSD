/**
 * favorites.js - user adding / removing schools to "Show Favorites" table, through the star icon or in the modal window
 *
 *
 * PRIVATE FUNCTIONS
    loadStarMarkers
    loadFavoritesTable
    repopulateStarMarkers
    addSchoolToComparison
    removeSchoolFromComparison
    setRankOnSchoolComparison
    updateFavoritesTableCookies
    updateStarCookies
 *
 *
 * EVENT HANDLERS
    onFavoriteStarClick
    onArrowUp
    onArrowDown
    onDeleteRow
    onShowFavoritesModal
 * 
 */


////////////////////
/**
 * PRIVATE FUNCTIONS
 */
////////////////////

/**
 * repopulateStarMarkers - makes all favorited schools have a VISIBLE star marker
 */
function repopulateStarMarkers() {
    for (var i=0; i<markers.length; ++i) {
        var marker = markers[i];
        var starMarker = marker.customInfo.starMarker;
        if (marker.customInfo.starred === "starred" && marker.getMap()) {
            starMarker.setMap(map);
        } else {
            starMarker.setMap(null);
        }
    }    
}

/**
 * addSchoolToComparison - when a user toggles ON the favorite star button of a school
 *
 * @param      {Row}  row     The row / school to be added to the Favorites table (added at bottom)
 */
function addSchoolToComparison(row) {

    $("tbody").append(row);

    $(".delete-row").on("click", onDeleteRow);
    $(".arrow-up").on("click", onArrowUp);
    $(".arrow-down").on("click", onArrowDown);

    updateFavoritesTableCookies();
}   
 
/**
 * removeSchoolFromComparison - when a user toggles OFF the favorite star button of a school
 *
 * @param      {Row}  name    The row / school to be removed from the Favorites table
 */
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
            break;
        }
    }

    updateFavoritesTableCookies();
} 

/**
 * setRankonSchoolComparison - in the "Show Favorites" table, re-ranks (ascending) schools, compensating for deleted / added / moved schools
 */
function setRankOnSchoolComparison() {
    var $rank = $(".rank");
    
    for (var i=0; i < $rank.length; ++i) {
        var $currRank = $($rank[i]);
        $currRank.html(i + 1);
    }
    updateFavoritesTableCookies();
}

/**
 * updateFavoritesTableCookies - saves the latest state of "Show Favorites" table in a cookie
 */
function updateFavoritesTableCookies() {
    document.cookie = "favoritesTable=;";
    var favoritesTableBodyHtml = $("#favorites-table-body").html();
    document.cookie = "favoritesTable=" + favoritesTableBodyHtml + ";";
}

/**
 * updateStarCookies - saves the latest state of the starred markers in a cookie
 */
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



/////////////////
/**
 * EVENT HANDLERS
 */
/////////////////

/**
 * onFavoriteStarClick - event handler for when user clicks the star button on the info window of a school 
 *
 * @param      {Marker} marker  The marker clicked on to now favorite
 * @param      {Event}  e       event object
 */
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
    
    // marker is currently unstarred -> need to star it, and add it to the "Show Favorites" table, and make starMarker visible
    if (marker.customInfo.starred === "unstarred") {
        marker.customInfo.starred = "starred";

        html = html.replace(/glyphicon-star-empty/, "glyphicon-star");
        infoWindowContent = document.querySelector("#info-window-content");
        infoWindowContent.outerHTML = html;
        
        starMarker.setMap(map);
        
        addSchoolToComparison(row);
    
    // marker is currently starred -> need to unstar it, remove it from the "Show Favorites" table, and make starMarker invisible
    } else {
        
        marker.customInfo.starred = "unstarred";

        html = html.replace(/glyphicon-star/, "glyphicon-star-empty");
        infoWindowContent = document.querySelector("#info-window-content");
        infoWindowContent.outerHTML = html;
        
        starMarker.setMap(null);

        removeSchoolFromComparison(name);
    }
    
    bindInfoWindow(marker, html);

    // rebind event handler
    $("#favorite-star-btn").on("click", onFavoriteStarClick.bind(this, marker));
   
    // preserve changes in cookies for future session
    updateStarCookies();
    updateFavoritesTableCookies();

}

/**
 * onArrowUp - event handler for when user clicks up arrow inside of "Show Favorites" modal
 * moves current row (school) up by one row
 * updates the ranking
 *
 * @param      {Event}  e       event handler
 */
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

/**
 * onArrowDown - event handler for when user clicks down arrow inside of "Show Favorites" modal
 *
 * @param      {Event}  e       event handler
 */
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

/**
 * onDeleteRow - event handler for when user clicks on "Remove" button inside of the "Show Favorites" modal 
 *
 * @param      {Event}  e       event object
 */
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
            bindInfoWindow(marker, html);
            bindInfoWindowFavoriteStar(starMarker, html);
            break;
        }
    }
    
    repopulateStarMarkers();

    $row.remove();
    var numRows = $("#favorites-table-body")[0].children.length;

    // no schools have been added yet to the table
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

    // preserve changes in cookies for future session
    updateStarCookies();
    updateFavoritesTableCookies();
}      

/**
 * onShowFavoritesModal - event handler for when user clicks "Compare My Favorite Schools" button
 *
 * @param      {Event}  e       event objet
 */
function onShowFavoritesModal(e) {
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
    setRankOnSchoolComparison();
    $("#modal").modal('show');
}

/**
 * loadStarMarkers - retrieves latest state of starred markers from cookie 
 */
function loadStarMarkers() {
    var starCookiesString = getCookies("starNames");
    var starCookies = starCookiesString.split(",");
    for (var i=0; i<starCookies.length; ++i) {
        var starName = starCookies[i];
        markers.forEach(function(marker, index, array) {
            if (marker.name === starName) {
                array[index].customInfo.starred = "starred";
                array[index].customInfo.starMarker.setMap(map);
            }
        });
    }
}

/**
 * loadFavoritesTable - retrieves last state of "Show Favorites" table from cookie and rebinds event handlers
 */
function loadFavoritesTable() {
    var favoritesTableBodyHtml = getCookies("favoritesTable");
    $("#favorites-table-body").html(favoritesTableBodyHtml);
    
    // add back click events on buttons
    $(".arrow-up").on("click", onArrowUp);
    $(".arrow-down").on("click", onArrowDown);
    $(".delete-row").on("click", onDeleteRow);
}
