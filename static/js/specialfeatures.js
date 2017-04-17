/**
 * specialfeatures.js - event handlers of enhanced features
 *
 *
 * EVENT HANDLERS
    onToggleArrow
    onPrintElement
    onTabClick
 * 
 */

/////////////////
/**
 * EVENT HANDLERS
 */
/////////////////

/**
 * onToggleArrow - event handler (in mobile) to toggle expanded view of screen / checkboxes
 *
 * @param      {Event}  e       - the event object
 */
function onToggleArrow (e) {
    $(this).toggleClass("isExpanded")
    
    var isExpanded = $(this).hasClass("isExpanded");
    if (isExpanded) {
        $($(this)[0].children[0].children[0]).removeClass("glyphicon-chevron-right").addClass("glyphicon glyphicon-chevron-down");         
    } else {
        $($(this)[0].children[0].children[0]).removeClass("glyphicon glyphicon-chevron-down").addClass("glyphicon glyphicon-chevron-right");
    }
}

/**
 * onPrintElement - event handler when clicking to print the "Show Favorites" table in the modal window
 *
 * @param      {DOM}  elem      - The element to print
 * @param      {Event}  e       - event object
 */
function onPrintElement(elem, e) {
    var domClone = elem.cloneNode(true);

    var $printSection = document.getElementById("printSection");

    if (!$printSection) {
        var $printSection = document.createElement("div");
        $printSection.id = "printSection";
        document.body.appendChild($printSection);
    }
    $("#tab-btn").remove();
    $printSection.innerHTML = "";
    var printHtml = $("#favorites-table").html();
    
    $("#printSection").html(printHtml);
    window.print();
}

/**
 * onTabClick - event handler (in mobile) when user clicks on tab to toggle the view
 *
 * @param      {Event}  e       - event object
 */
function onTabClick(e) {

    $("#wrapper").toggleClass("toggled");

    if ($("#tab-btn").hasClass("toggled")) {
        $("#tab-btn").html("&lt;&lt;");
    } else {
        $("#tab-btn").html("&gt;&gt;");

    }
    $("#tab-btn").toggleClass("toggled");
}
