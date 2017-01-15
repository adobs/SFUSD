var map;

function initialize() {
    console.log("IN initialize");
    var sanFrancisco = { lat: 37.7833, lng: -122.4167 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: sanFrancisco
    });
    // $("#form-submit").on("click", function() {console.log("clicked button");});
    return map;

}



(function () {

    var infoWindow = new google.maps.InfoWindow({
      width: 150
    });
    var markers = [];

    function getHtml(name, startTime, endTime, middleSchoolFeeder,
                            principal, address, phone, fax, email, website){
        html =
            '<div id="content">' +
            '<p><b>' + name + '</b></p>' +
            '<p><b>Start Time: </b>'+ startTime + '</p>' +
            '<p><b>End Time: </b>'+ endTime + '</p>' +
            '<p><b>Feeder: </b>'+ middleSchoolFeeder + '</p>' +
            '<p><b>Principal: </b>'+ principal + '</p>' +
            '<p><b>Addresss: </b>'+ address + '</p>' +
            '<p><b>Phone: </b>'+ phone + '</p>' +
            '<p><b>Fax: </b>'+ fax + '</p>' +
            '<p><b>Email: </b>'+ email + '</p>' +
            '<p><b>Website: </b>'+ website + '</p>' +
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
        console.log("!!!!IN createMarker");
        var position = {lat: lat, lng: lng};

        var marker = new google.maps.Marker({
            position: position,
            title: name
        });
        // TODO -- add animation to marker with label
        // animation: google.maps.Animation.DROP

        return marker;
    }

    function bindInfoWindow(marker, map, infoWindow, html) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.close();
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
            console.log("inside bind infos");

        });
    }

        // Adds a marker to the map
    function addMarkers(data){
        console.log("data is ", data);
        removeAllMarkers();
        console.log("addMarkers");
        for (var school in data){
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
        console.log("in submit");
        // var inputs = {
        //     "neighborhood": ($('input[name="neighborhood"]:checked').serialize()),
        //     "grades-served": ($('input[name="grades-served"]:checked').serialize()),
        //     "before-school-program": ($('input[name="before-school-program"]:checked').serialize()),
        //     "before-school-program-offerings": ($('input[name="before-school-program-offerings"]:checked').serialize()),
        //     "multilingual-pathways": ($('input[name="multilingual-pathways"]:checked').serialize()),
        //     "after-school-program": ($('input[name="after-school-program"]:checked').serialize()),
        //     "after-school-program-offerings": ($('input[name="after-school-program-offerings"]:checked').serialize())
        // };
        var inputs = $("#map-choices-form").serializeArray();

        ajaxRequest = $.get("/map-checked.json", inputs, addMarkers);

    });


    //check all neighborhood checkboxes
    $("#check-all-neighborhood").change(function () {
        $("input[name='neighborhood']:checkbox").prop('checked', $(this).prop("checked"));
    });

    //check all grades served checkboxes
    $("#check-all-grades-served").change(function () {
        $("input[name='grades-served']:checkbox").prop('checked', $(this).prop("checked"));
    });

    //check all before school program checkboxes
    $("#check-all-before-school-program").change(function () {
        $("input[name='before-school-program']:checkbox").prop('checked', $(this).prop("checked"));
    });

    //check all before school program offerings checkboxes
    $("#check-all-before-school-program-offerings").change(function () {
        $("input[name='before-school-program-offerings']:checkbox").prop('checked', $(this).prop("checked"));
    });

    //check all multilingual checkboxes
    $("#check-all-multilingual-pathways").change(function () {
        $("input[name='multilingual-pathways']:checkbox").prop('checked', $(this).prop("checked"));
    });

    //check all after school program checkboxes
    $("#check-all-after-school-program").change(function () {
        $("input[name='after-school-program']:checkbox").prop('checked', $(this).prop("checked"));
    });

    //check all after school program offerings served checkboxes
    $("#check-all-after-school-program-offerings").change(function () {
        $("input[name='after-school-program-offerings']:checkbox").prop('checked', $(this).prop("checked"));
    });


    $(document).ready(function() {
        var chart = initialize();
    });

})();