var map;
var infoWindow = new google.maps.InfoWindow({
  width: 150
});
var homeInfoWindow = new google.maps.InfoWindow({
  width: 150
});
var gtMdWidth, aarea, aaname;
var isOnlyAttendanceArea = false;
var markers = [];
var homeMarker;
var attendanceAreaPolygonArray = []
var ctip1PolygonArray = [];
var infoWindowName, infoWindowAddress;
var originAddress, destinationAddress;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();        

