/**
 * checkboxes.js - handling checking/unchecking of criteria
 *
 * INIT
    initCounters
 * 
 * PRIVATE FUNCTIONS
    selectAllCheck
    checkForSelectDeselect
    countCheckboxes
 *
 * EVENT HANDLERS
    onCheckboxChange
 *
 */

////////
/**
 * INIT
 */
////////

/**
 * initCounters - creates counters for the criteria checkboxes
 */
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

////////////////////
/**
 * PRIVATE FUNCTIONS
 */
////////////////////

/**
 * selectAllCheck - selects or deselects all checkboxes and toggles the Deselect/Select All prompt
 *
 * @param      {Event}   e       - the event object from the onCheckboxChange event handler
 * @param      {String}  name    - The name of the checkbox section checked
 */
function selectAllCheck(e, name) {
    if ($(e.currentTarget).prop("checked")) {
        // if the current Select/Deselect is has just been checked, then it used to say "Select All" (can't check Deselect, can only uncheck)
        // if user just clicked on what said would "Select All", then the prompt should toggle, and all checks should be checked
        $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Deselect All";
        $("input[name='" +name + "']").prop("checked", true);

    } else {
        // current Select/Deselect used to say "Deselect All"
        // the prompt should toggle (special formatting for city-schools), and all checks should be removed
        if (name === "c-s") {
            $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Select All Schools";
        } else {
            $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Select All";
        }
        $("input[name='" +name + "']").prop("checked", false);        
    }

    // update the count of checkboxes checked and resubmit form based on current boxes checked    
    countCheckboxes(name);
    $("#map-choices-form").submit();
}

/**
 * checkForSelectDeselect - checks to see if all / none of checkboxes are checked, and toggles the Select/Deselect prompt
 *
 * @param      {<type>}  e       { parameter_description }
 * @param      {string}  name    The name
 */
function checkForSelectDeselect (e, name) {
    var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
    var numTotal = $("#" + name + "-form").find($("input[name='"+ name  + "']")).length;

    // all boxes are checked => therefore all are Selected, and the option for "Deselect All" should be present
    if (numChecked === numTotal) {
        $("#check-all-" + name).prop("checked", true);
        $("input[name='" + name + "']").prop("checked", true);
        $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Deselect All";
   
    // 0 boxes are checked => therefore all are Deselected, and the option for "Select All" should be present
    } else if (numChecked === 0) {
        $("#check-all-"+name).prop("checked",false);
        $("input[name='" + name + "']").prop("checked", false);
    
        if (name === "c-s") {
            $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Select All Schools";
        } else {
            $("#check-all-"+name)[0].labels[0].innerHTML = "&nbsp; Select All";
        }
    
    } 

    // update the count of checkboxes checked and resubmit form based on current boxes checked    
    countCheckboxes(name);
    $("#map-choices-form").submit();
}

/**
 * coutCheckboxes - Counts the number of checkboxes checked / total checkboxes for each criteria section 
 *
 * @param      {String}  name    - The name of criteria section
 */
function countCheckboxes(name) {
    var numChecked = $("#" + name + "-form").find($("input[name='"+ name  + "']:checked")).length;
    var numTotal = $("#" + name + "-form").find($("input[name='"+ name  + "']")).length;
    $("#" + name + "-count").html(numChecked + " / "+ numTotal);
}

/////////////////
/**
 * EVENT HANDLERS
 */
/////////////////

/**
 * onCheckboxChange - event handler for when any checkbox is clicked on
 *
 * @param      {Event}  e       The event object
 */
function onCheckboxChange(e) {
    e.preventDefault();
    var name = $(this)[0].name;

    var num = "check-all-".length;
    // handler is for any checkbox - need to dinstinguish if it's the "Select All" or the individual criteria
    var isIndividualCheck = name.indexOf('check-all-') === -1;
    
    if (isIndividualCheck) {
        // check if this one individual click has now selected/deselected the entire list
        checkForSelectDeselect(e, name);

    } else {
        // enact appropriate response for Selecting or Deselecting All
        name = name.slice(num);
        selectAllCheck(e, name);   
    }   
}

