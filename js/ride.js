/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};
var exp1 = 0, exp2 = 0, exp3 = 0, lv1 = 1, lv2 = 1, lv3 = 1, value = 4;
(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestUnicorn(pickupLocation) {
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
                alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
    }

function completeRequest(result) {
    var unicorn;
    var pronoun;
    console.log('Response received from API: ', result);
    unicorn = result.Unicorn;
    pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
    if(unicorn.Color === 'Golden') {
        exp1 = exp1 + 10;
        if (exp1 === 50) {
            lv1 = lv1 + 1;
            exp1 = 0;
            value = 1;
        }
        displayUpdate('Unicorn name: ' + unicorn.Name + '. Color: ' + unicorn.Color +  '\nUnicorn level: ' + lv1 + ' Current Exp: ' + exp1 +'.');
    } else if (unicorn.Color === 'White') {
        exp2 = exp2 + 10;
        if (exp2 === 50) {
            lv2 = lv2 + 1;
            exp2 = 0;
            value = 2;
        }
        displayUpdate('Unicorn name: ' + unicorn.Name + '. Color: ' + unicorn.Color +  '\nUnicorn level: ' + lv2 + ' Current Exp: ' + exp2 +'.');
    } else {
        exp3 = exp3 + 10;
        if (exp3 === 50) {
            lv3 = lv3 + 1;
            exp3 = 0;
            value = 3; 
        }
        displayUpdate('Unicorn name: ' + unicorn.Name + '. Color: ' + unicorn.Color +  '\nUnicorn level: ' + lv3 + ' Current Exp: ' + exp3 +'.');
    }
    
    animateArrival(function animateCallback() {
        WildRydes.map.unsetLocation();
        $('#request').prop('disabled', 'disabled');
        $('#request').text('Set Pickup');
    });
}

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(WildRydes.map).on('pickupChange', handlePickupChanged);

        WildRydes.authToken.then(function updateAuthMessage(token) {
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
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = WildRydes.map.selectedPoint;
        event.preventDefault();
        document.getElementsByTagName('audio')[0].play();
        if (value === 1) {
           document.getElementsByTagName('audio')[1].play();
        } else if (value === 2) {
           document.getElementsByTagName('audio')[2].play();
        } else {document.getElementsByTagName('audio')[3].play();}
        requestUnicorn(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = WildRydes.map.selectedPoint;
        var origin = {};

        if (dest.latitude > WildRydes.map.center.latitude) {
            origin.latitude = WildRydes.map.extent.minLat;
        } else {
            origin.latitude = WildRydes.map.extent.maxLat;
        }

        if (dest.longitude > WildRydes.map.center.longitude) {
            origin.longitude = WildRydes.map.extent.minLng;
        } else {
            origin.longitude = WildRydes.map.extent.maxLng;
        }

        WildRydes.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
