/*global BackToTheRide _config*/

var BackToTheRide = window.BackToTheRide || {};
BackToTheRide.map = BackToTheRide.map || {};

(function rideScopeWrapper($) {
    var authToken;
    BackToTheRide.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestRide(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your ride:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        var delorean;
        var pronoun;
        console.log('Response received from API: ', result);
        delorean = result.DeLorean;
        pronoun = delorean.Gender === 'Male' ? 'his' : 'her';
        displayUpdate(delorean.Name + ', driving your ' + delorean.Color + ' colored DeLorean ride, is on ' + pronoun + ' way.');
        animateArrival(function animateCallback() {
            displayUpdate(delorean.Name + ' has arrived. Time to travel');
            BackToTheRide.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(BackToTheRide.map).on('pickupChange', handlePickupChanged);

        BackToTheRide.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Ride');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = BackToTheRide.map.selectedPoint;
        event.preventDefault();
        requestRide(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = BackToTheRide.map.selectedPoint;
        var origin = {};

        if (dest.latitude > BackToTheRide.map.center.latitude) {
            origin.latitude = BackToTheRide.map.extent.minLat;
        } else {
            origin.latitude = BackToTheRide.map.extent.maxLat;
        }

        if (dest.longitude > BackToTheRide.map.center.longitude) {
            origin.longitude = BackToTheRide.map.extent.minLng;
        } else {
            origin.longitude = BackToTheRide.map.extent.maxLng;
        }

        BackToTheRide.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
