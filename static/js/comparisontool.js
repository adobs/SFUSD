$(document).ready(function() {
    // tooltip for info button
   $('[data-toggle="tooltip"]').tooltip(); 

    // setting up screen (MD_WIDTH distinction based on Bootstrap measurements)
    var windowWidth = $(window).width();
    var MD_WIDTH = 992;
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
    $(".modal-dialog").width(pageWidth * .8);
    $(".modal-body").height($("#map").height() * .75);
    $("#print-btn").on("click", onPrintElement.bind(this, document.getElementById("printThis")));
   
    // enable all websites in future info windows to open correctly in a new tab
    $('body').on('click', '#website', function (e) { 
        var innerHtml = e.currentTarget.innerHTML;
        window.open(innerHtml, "_blank");
    });

    // initialize functionality
    initMapInfo();
    initGoogleMaps();
    initCounters();
    initAutocomplete(); 

    // callbacks
    $('#map-choices-form').on('submit', onSubmit);
    $(".arrow-collapse-link").on("click", onToggleArrow.bind(this));
    $(".tie-breaker-btn").on('click', onTieBreakerBtnClick);
    $("input:checkbox").on("change", onCheckboxChange);
    $("#show-favorites-btn").on("click", onShowFavoritesModal);
});
