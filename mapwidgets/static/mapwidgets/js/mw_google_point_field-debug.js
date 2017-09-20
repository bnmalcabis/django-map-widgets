(function($) {

    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bSuper\b/ : /.*/;

    $.Class = function() {

    };

    $.Class.extend = function(prop) {
        var Super = this.prototype;

        initializing = true;
        var prototype = new this();
        initializing = false;

        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" && typeof Super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn) {
                return function() {
                    var tmp = this.Super;

                    this.Super = Super[name];

                    var ret = fn.apply(this, arguments);
                    this.Super = tmp;

                    return ret;
                };
            })(name, prop[name]) : prop[name];
        }

        function Class() {
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }

        Class.prototype = prototype;

        Class.constructor = Class;

        Class.extend = arguments.callee;

        return Class;
    };

    if (typeof Function.bind === 'undefined') {

        Function.prototype.bind = function(obj) {
            var method = this;

            tmp = function() {
                return method.apply(obj, arguments);
            };

            return tmp;
        };

    }

    if (!Array.indexOf){
        Array.prototype.indexOf = function(obj) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }

            return -1;
        };
    }

})(jQuery || django.jQuery);
(function($) {
  DjangoMapWidgetBase = $.Class.extend({

    init: function(options){
      $.extend(this, options);
      this.coordinatesOverlayToggleBtn.on("click", this.toggleCoordinatesOverlay.bind(this));
      this.coordinatesOverlayDoneBtn.on("click", this.handleCoordinatesOverlayDoneBtnClick.bind(this));
      this.coordinatesOverlayInputs.on("change", this.handleCoordinatesInputsChange.bind(this));
      this.addMarkerBtn.on("click", this.handleAddMarkerBtnClick.bind(this));
      this.myLocationBtn.on("click", this.handleMyLocationBtnClick.bind(this));
      this.deleteBtn.on("click", this.deleteMarker.bind(this));
      var autocomplete = new google.maps.places.Autocomplete(this.addressAutoCompleteInput, this.GooglePlaceAutocompleteOptions);
      google.maps.event.addListener(autocomplete, 'place_changed', this.handleAutoCompletePlaceChange.bind(this, autocomplete));
      google.maps.event.addDomListener(this.addressAutoCompleteInput, 'keydown', this.handleAutoCompleteInputKeyDown.bind(this));
      this.geocoder = new google.maps.Geocoder;
      this.initializeMap();
    },

    initializeMap: function(){
      console.warn("Implement initializeMap method.");
    },

    updateMap: function(lat, lng){
      console.warn("Implement updateMap method.");
    },

    addMarkerToMap: function(lat, lng){
      console.warn("Implement this method for your map js library.");
    },

    fitBoundMarker: function(){
      console.warn("Implement this method for your map js library.");
    },

    removeMarker: function(){
      console.warn("Implement this method for your map js library.");
    },

    dragMarker: function(e){
      console.warn("Implement dragMarker method.");
    },

    handleMapClick: function(e){
      console.warn("Implement handleMapClick method.");
    },

    handleAddMarkerBtnClick: function(e){
      console.warn("Implement handleAddMarkerBtnClick method.");
    },

    isInt : function(value) {
      return !isNaN(value) &&
        parseInt(Number(value)) === value &&
        !isNaN(parseInt(value, 10));
    },

    getLocationValues: function(){
      var latlng = this.locationInput.val().split(' ');
      var lat = latlng[2].replace(/[\(\)]/g, '');
      var lng = latlng[1].replace(/[\(\)]/g, '');
      return {
        "lat": lat,
        "lng": lng
      }
    },

    callPlaceTriggerHandler: function (lat, lng, place) {
      if (place === undefined){
                var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
        this.geocoder.geocode({'location' : latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                      var placeObj = results[0] || {};
                      $(this.addressAutoCompleteInput).val(placeObj.formatted_address || "");
                      this.fillInputs(placeObj);
                      $(document).trigger(this.placeChangedTriggerNameSpace,
                        [placeObj, lat, lng, this.wrapElemSelector, this.locationInput]
                      );
                    }
                }.bind(this));
      }else{  // user entered an address
        $(document).trigger(this.placeChangedTriggerNameSpace,
          [place, lat, lng, this.wrapElemSelector, this.locationInput]
        );
      }
    },

    updateLocationInput: function(lat, lng, place){
      var location_input_val = "POINT (" + lng + " " + lat + ")";
      this.locationInput.val(location_input_val);
      this.updateCoordinatesInputs(lat, lng);
      this.addMarkerToMap(lat, lng);
      if ($.isEmptyObject(this.locationFieldValue)){
        $(document).trigger(this.markerCreateTriggerNameSpace,
          [lat, lng, this.wrapElemSelector, this.locationInput]
        );
      }else{
        $(document).trigger(this.markerChangeTriggerNameSpace,
          [lat, lng, this.wrapElemSelector, this.locationInput]
        );
      }

      this.callPlaceTriggerHandler(lat, lng, place);
      this.locationFieldValue = {
        "lng": lng,
        "lat": lat
      };
      this.deleteBtn.removeClass("mw-btn-default disabled").addClass("mw-btn-danger");
    },

    deleteMarker: function(){
      if (!$.isEmptyObject(this.locationFieldValue)) {
        this.hideOverlay();
        this.locationInput.val("");
        this.coordinatesOverlayInputs.val("");
        $(this.addressAutoCompleteInput).val("");
        this.addMarkerBtn.removeClass("active");
        this.removeMarker();
        this.deleteBtn.removeClass("mw-btn-danger").addClass("mw-btn-default disabled");
        $(document).trigger(this.markerDeleteTriggerNameSpace,
          [
            this.locationFieldValue.lat,
            this.locationFieldValue.lng,
            this.wrapElemSelector,
            this.locationInput
          ]
        );
        this.locationFieldValue = null;
      }
    },

    toggleCoordinatesOverlay: function(){
      this.coordinatesOverlayToggleBtn.toggleClass("active");
      $(".mw-coordinates-overlay", this.wrapElemSelector).toggleClass("hide");
    },

    updateCoordinatesInputs: function(lat, lng){
      $(".mw-overlay-latitude", this.wrapElemSelector).val(lat || "");
      $(".mw-overlay-longitude", this.wrapElemSelector).val(lng || "");
    },

    handleCoordinatesInputsChange: function (e) {
      var lat = $(".mw-overlay-latitude", this.wrapElemSelector).val();
      var lng = $(".mw-overlay-longitude", this.wrapElemSelector).val();
      if (lat && lng){
        this.updateLocationInput(lat, lng);
        this.fitBoundMarker();
      }
    },

    handleCoordinatesOverlayDoneBtnClick: function(){
      $(".mw-coordinates-overlay", this.wrapElemSelector).addClass("hide");
    },

    handleMyLocationBtnClick: function(){
      this.showOverlay();
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
          this.handleCurrentPosition.bind(this),
          this.handlecurrentPositionError.bind(this)
        );
      }else{
        this.handlecurrentPositionError();
      }

    },

    handleCurrentPosition: function(location){
      this.updateLocationInput(location.coords.latitude, location.coords.longitude);
      this.hideOverlay();
      this.fitBoundMarker();
    },

    handlecurrentPositionError: function(){
      this.hideOverlay();
      alert("Your location could not be found.");
    },

    handleAutoCompleteInputKeyDown: function (e) {
      var keyCode = e.keyCode || e.which;
      if (keyCode === 13){  // pressed enter key
        e.preventDefault();
      }
    },

    handleAutoCompletePlaceChange: function (autocomplete) {
      var place = autocomplete.getPlace();
      var lat = place.geometry.location.lat();
      var lng = place.geometry.location.lng();
      this.updateLocationInput(lat, lng, place);
      this.fitBoundMarker()
      this.fillInputs(place);
    },

    showOverlay: function(){
      this.loaderOverlayElem.removeClass("hide")
    },

    hideOverlay: function(){
      this.loaderOverlayElem.addClass("hide")
    },

    fillInputs: function(place){
      if ($("#id_street_address").length === 1 ) {
          var addressComponents = place.address_components, streetAddress = '', city = '', state = '', addressComponent = null, addressTypes = '';
          for (var i = 0; i < addressComponents.length; i++) {
            addressComponent = addressComponents[i];
            addressTypes = addressComponent.types.join(", ");
            if (addressTypes.indexOf("administrative_area_level_1") != -1) {
              state = addressComponent.short_name;
            } else if (addressTypes.indexOf("locality") != -1) {
              city = addressComponent.long_name;
            } else if (addressTypes.indexOf("street_number") != -1) {
              streetAddress += addressComponent.long_name + ' ';
            } else if (addressTypes.indexOf("route") != -1) {
              streetAddress += addressComponent.long_name;
            }
          }
          if (streetAddress == '' && place.name) {
            streetAddress = place.name;
          }
          document.getElementById("id_street_address").value = streetAddress;
          document.getElementById("id_city").value = city;
          document.getElementById("id_state").value = state;
      }
    }
  });

})(jQuery || django.jQuery);

(function($) {
    DjangoGooglePointFieldWidget = DjangoMapWidgetBase.extend({

        initializeMap: function(){
            var mapCenter = this.mapCenterLocation;
            if (this.mapCenterLocationName){
                
                this.geocoder.geocode({'address' : this.mapCenterLocationName}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        var geo_location = results[0].geometry.location;
                        mapCenter = [geo_location.lat(), geo_location.lng()];
                    }else{
                        console.warn("Cannot find " + this.mapCenterLocationName + " on google geo service.")
                    }
                    this.map = new google.maps.Map(this.mapElement, {
                        center: new google.maps.LatLng(mapCenter[0], mapCenter[1]),
                        scrollwheel: false,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT
                        },
                        zoom: this.zoom
                    });
                    if (!$.isEmptyObject(this.locationFieldValue)){
                        this.updateLocationInput(this.locationFieldValue.lat, this.locationFieldValue.lng);
                        this.fitBoundMarker();
                    }

                }.bind(this));

            }else{
                this.map = new google.maps.Map(this.mapElement, {
                    center: new google.maps.LatLng(mapCenter[0], mapCenter[1]),
                    scrollwheel: false,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT
                    },
                    zoom: this.zoom
                });

                if (!$.isEmptyObject(this.locationFieldValue)){
                    this.updateLocationInput(this.locationFieldValue.lat, this.locationFieldValue.lng);
                    this.fitBoundMarker();
                }
            }

        },

        addMarkerToMap: function(lat, lng){
            this.removeMarker();
            var marker_position = {lat: parseFloat(lat), lng: parseFloat(lng)};
            this.marker = new google.maps.Marker({
                position: marker_position,
                map: this.map,
                draggable: true
            });
            this.marker.addListener("dragend", this.dragMarker.bind(this));
        },

        fitBoundMarker: function () {
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(this.marker.getPosition());
            this.map.fitBounds(bounds);
            if (this.markerFitZoom && this.isInt(this.markerFitZoom)){
                var markerFitZoom = parseInt(this.markerFitZoom);
                var listener = google.maps.event.addListener(this.map, "bounds_changed", function() {
                    if (this.getZoom() > markerFitZoom) {
                        this.setZoom(markerFitZoom)
                    }
                    google.maps.event.removeListener(listener);
                });
            }
        },

        removeMarker: function(e){
            if (this.marker){
                this.marker.setMap(null);
            }
        },

        dragMarker: function(e){
            this.updateLocationInput(e.latLng.lat(), e.latLng.lng())
        },

        handleAddMarkerBtnClick: function(e){
            $(this.mapElement).toggleClass("click");
            this.addMarkerBtn.toggleClass("active");
            if ($(this.addMarkerBtn).hasClass("active")){
                this.map.addListener("click", this.handleMapClick.bind(this));
            }else{
                google.maps.event.clearListeners(this.map, 'click');
            }
        },

        handleMapClick: function(e){
            google.maps.event.clearListeners(this.map, 'click');
            $(this.mapElement).removeClass("click");
            this.addMarkerBtn.removeClass("active");
            this.updateLocationInput(e.latLng.lat(), e.latLng.lng())
        }
    });

})(jQuery || django.jQuery);