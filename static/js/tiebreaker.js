/**
 * tiebreaker.js - events surrounding clicking the Tie Breaker Hierarchy buttons
 * 
 * EVENT HANDLERS
    onTieBreakerBtnClick
 * 
 */

/////////////////
/**
 * EVENT HANDLERS
 */
/////////////////

 /**
 * onTieBreakerBtnClick - event handler when user clicks to learn more about a given Tie Breaker Hierarchy
 *
 * @param      {Event}  e       - The event object
 */
function onTieBreakerBtnClick(e) {
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

    var $elem = $("#tie-breaker-info-elem");
    var $middle = $("#tie-breaker-info-middle");
    var $high = $("#tie-breaker-info-high");
    var tieBreakerHtmlHolder = [$elem, $middle, $high];

    currentHtml = $elem.html() || $middle.html() || $high.html();
    htmlIndex = parseInt(e.target.dataset.htmlindex);
    newHtml = tieBreakerHtml[htmlIndex];
  
    if (currentHtml === newHtml) {
        $(".tie-breaker-info").html("");
        $(e.target).css("background-color", "");
    } else {
        $(".tie-breaker-btn").css("background-color","");
        for (var i=0; i<tieBreakerHtmlHolder.length; ++i) {
            if (i === htmlIndex) {
                tieBreakerHtmlHolder[i].html(newHtml);
                $(e.target).css("background-color", "#fad355");
            } else {
                tieBreakerHtmlHolder[i].html("");
            }
        }
    }
};
