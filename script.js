//adresse de Bourges, INSA CVL
var origin = {lat: 47.081909, lng: 2.415426}
var infowindowMarker;
var infowindowOther;
//deux infowindow pour nos markers et pour les autres places

var map = null;
var panel;
var initialize;
var calculate;
var direction;

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: origin,
    zoom: 15,
    mapTypeId: 'roadmap'
  });

  direction = new google.maps.DirectionsRenderer({
    map   : map,
    panel : panel
  });


  // On crée la searchbox
  var input = document.getElementById('interestPoint');
  var input1 = document.getElementById('origin');
  var input2 = document.getElementById('destination');
  var searchBox = new google.maps.places.SearchBox(input);
  var searchBox1 = new google.maps.places.SearchBox(input1);
  var searchBox2 = new google.maps.places.SearchBox(input2);

  // On assigne les bords de la map a la searchbox
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = []; //tableau de marker
  var i=0; //pour compter les markers
  infowindowMarker = new google.maps.InfoWindow(); //pour avoir une infowindow quand on click sur un marker
  var infowindowContent = document.getElementById('infowindow-content'); //contenu de l'infowindow qui change à chaque fois

  // Ecoute les évènements quand un utilisateurs choisi une prédiction
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }

    // On enlève les anciens markers
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];
    i=0;

    // Pour chaque place on a les icons, etc...
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Pas de geometry pour cette place");
        return;
      }
      var icon = {
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      //Crée un marker pour chaque place
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      //On rempli l'infowindow pour chaque marker, et on lui ajoute le listener pour l'event 'click'
      var marker = markers[i];
      marker.addListener('click', function () {
        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = place.formatted_address;
        infowindowMarker.setContent(infowindowContent);
        if (infowindowOther) {
          infowindowOther.close();
        }
        infowindowMarker.open(map, this);
      });

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }

      //On incrémente pour le prochain marker a créer
      i+=1;
    });
    map.fitBounds(bounds);
  });

  var clickHandler = new ClickEventHandler(map, origin);
}

//Handler pour les évènements qui ne concernent pas nos markers. Les autres places, etc...
var ClickEventHandler = function(map, origin) {
  this.origin = origin;
  this.map = map;
  this.directionsService = new google.maps.DirectionsService;
  this.directionsDisplay = new google.maps.DirectionsRenderer;
  this.directionsDisplay.setMap(map);
  this.placesService = new google.maps.places.PlacesService(map);
  infowindowOther = new google.maps.InfoWindow;
  this.infowindowContent = document.getElementById('infowindow-content');
  infowindowOther.setContent(this.infowindowContent);

  //Ecoute pour les clicks sur la map
  this.map.addListener('click', this.handleClick.bind(this));
};

ClickEventHandler.prototype.handleClick = function(event) {
  // Si l'event a un placeId, on affiche une infowindow
  if (event.placeId) {

    event.stop();
    this.getPlaceInformation(event.placeId);
  }
};


ClickEventHandler.prototype.getPlaceInformation = function(placeId) {
  var me = this;
  this.placesService.getDetails({placeId: placeId}, function(place, status) {
    if (status === 'OK') {
      if (infowindowMarker) {
        infowindowMarker.close();
      }
      infowindowOther.close();
      infowindowOther.setPosition(place.geometry.location);
      me.infowindowContent.children['place-icon'].src = place.icon;
      me.infowindowContent.children['place-name'].textContent = place.name;
      me.infowindowContent.children['place-address'].textContent = place.formatted_address;
      infowindowOther.open(me.map);
    }
  });
};


function calculate(){
    origin      = document.getElementById('origin').value; // Le point départ
    destination = document.getElementById('destination').value; // Le point d'arrivé
    if(origin && destination){
        var request = {
            origin      : origin,
            destination : destination,
            travelMode  : google.maps.DirectionsTravelMode.DRIVING // Type de transport
        }
        var directionsService = new google.maps.DirectionsService(); // Service de calcul d'itinéraire
        directionsService.route(request, function(response, status){ // Envoie de la requête pour calculer le parcours
            if(status == google.maps.DirectionsStatus.OK){
                direction.setDirections(response); // Trace l'itinéraire sur la carte et les différentes étapes du parcours
            }
        });
    } //http://code.google.com/intl/fr-FR/apis/maps/documentation/javascript/reference.html#DirectionsRequest
};
