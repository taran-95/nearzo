/*

* NearZo Business Registration Map
*
* Requirements:
* * Leaflet
* * Geoapify API key
*
* HTML elements expected:
*
* #location              -> existing address textarea
* #location-search       -> address search input
* #location-map          -> map container
* #use-my-location       -> location button
* #location-status       -> status text
* #selected-location     -> selected-location container
* #selected-location-details -> address details container
*
* Exposes:
* window.businessMap.getCoordinates()
*
* Returns:
* {
* 
   latitude: Number,
  
* 
   longitude: Number
  
* }
  */

/* =========================================================
CONFIGURATION
========================================================= */

// Put your Geoapify API key here.
const GEOAPIFY_API_KEY = "9d177b0c49484117b5fe7addbf50bf56";

/* =========================================================
ELEMENTS
========================================================= */

const locationInput =
document.getElementById("location");

const locationSearch =
document.getElementById("location-search");

const locationSuggestions =
document.getElementById("location-suggestions");

const clearSearchButton =
document.getElementById("clear-location-search");

const locationMapElement =
document.getElementById("location-map");

const useMyLocationButton =
document.getElementById("use-my-location");

const locationStatus =
document.getElementById("location-status");

const selectedLocation =
document.getElementById("selected-location");

const selectedLocationDetails =
document.getElementById("selected-location-details");

/* =========================================================
VALIDATE REQUIRED ELEMENTS
========================================================= */

if (!locationMapElement) {


console.error(
    "Business map: #location-map was not found."
);

throw new Error(
    "Business map: #location-map is required."
);


}

if (!locationSearch) {


console.error(
    "Business map: #location-search was not found."
);


}

if (!locationInput) {


console.error(
    "Business map: #location was not found."
);


}

/* =========================================================
LOCATION STATE
========================================================= */

let selectedLatitude = null;
let selectedLongitude = null;

let selectedAddress = null;

let marker = null;

let autocompleteTimeout = null;

let reverseGeocodeRequestId = 0;

/* =========================================================
INITIALIZE MAP
========================================================= */

const initialMapCenter = [
20.5937,
78.9629
];

const map = L.map(
locationMapElement
).setView(
initialMapCenter,
5
);

/* =========================================================
GEOAPIFY TILE LAYER
========================================================= */

L.tileLayer(
`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${encodeURIComponent(GEOAPIFY_API_KEY)}`,
{
maxZoom: 20,


    attribution:
        '&copy; OpenStreetMap contributors | &copy; Geoapify'
}


).addTo(map);

/* =========================================================
CREATE / MOVE MARKER
========================================================= */

function createOrMoveMarker(
latitude,
longitude,
centerMap = true
) {


selectedLatitude = Number(latitude);
selectedLongitude = Number(longitude);


/*
 * Create marker the first time.
 */

if (!marker) {

    marker = L.marker(
        [
            selectedLatitude,
            selectedLongitude
        ],
        {
            draggable: true
        }
    ).addTo(map);


    /*
     * Marker dragging finished.
     */

    marker.on(
        "dragend",
        function() {

            const position =
                marker.getLatLng();


            updateLocationFromCoordinates(
                position.lat,
                position.lng
            );

        }
    );

} else {

    marker.setLatLng([
        selectedLatitude,
        selectedLongitude
    ]);

}


/*
 * Center map on marker.
 */

if (centerMap) {

    map.setView(
        [
            selectedLatitude,
            selectedLongitude
        ],
        Math.max(
            map.getZoom(),
            16
        )
    );

}


}

/* =========================================================
MAP CLICK
========================================================= */

map.on(
"click",
function(event) {


    const latitude =
        event.latlng.lat;

    const longitude =
        event.latlng.lng;


    createOrMoveMarker(
        latitude,
        longitude,
        false
    );


    updateLocationFromCoordinates(
        latitude,
        longitude
    );

}


);

/* =========================================================
REVERSE GEOCODING
========================================================= */

async function updateLocationFromCoordinates(
latitude,
longitude
) {


selectedLatitude = Number(latitude);
selectedLongitude = Number(longitude);


/*
 * Each request receives an ID.
 *
 * If the user moves the marker again before the
 * previous request finishes, the old response will
 * be ignored.
 */

const requestId =
    ++reverseGeocodeRequestId;


setStatus(
    "Finding address..."
);


try {

    const url =
        "https://api.geoapify.com/v1/geocode/reverse" +
        `?lat=${encodeURIComponent(latitude)}` +
        `&lon=${encodeURIComponent(longitude)}` +
        "&apiKey=" +
        encodeURIComponent(
            GEOAPIFY_API_KEY
        );


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Reverse geocoding failed."
        );

    }


    const result =
        await response.json();


    /*
     * Ignore an old request.
     */

    if (
        requestId !==
        reverseGeocodeRequestId
    ) {

        return;

    }


    if (
        !result.features ||
        result.features.length === 0
    ) {

        selectedAddress = null;


        if (locationInput) {

            locationInput.value = "";

        }


        displayCoordinatesOnly(
            latitude,
            longitude
        );


        setStatus(
            "No address was found for this location."
        );


        return;

    }


    const properties =
        result.features[0].properties;


    selectedAddress =
        properties;


    /*
     * Get formatted address.
     */

    const formattedAddress =
        properties.formatted ||
        buildAddress(
            properties
        );


    /*
     * Update the existing Store Address textarea.
     */

    if (locationInput) {

        locationInput.value =
            formattedAddress || "";

    }


    /*
     * Display detailed address.
     */

    displaySelectedLocation(
        properties,
        latitude,
        longitude
    );


    setStatus(
        "Location selected. You can drag the pin to adjust it."
    );


} catch (error) {

    console.error(
        "Geoapify reverse geocoding error:",
        error
    );


    displayCoordinatesOnly(
        latitude,
        longitude
    );


    setStatus(
        "Could not determine the address. The coordinates were saved."
    );

}


}

/* =========================================================
BUILD ADDRESS
========================================================= */

function buildAddress(properties) {


const parts = [];


if (properties.housenumber) {

    parts.push(
        properties.housenumber
    );

}


if (properties.street) {

    parts.push(
        properties.street
    );

}


if (properties.suburb) {

    parts.push(
        properties.suburb
    );

}


if (properties.city) {

    parts.push(
        properties.city
    );

}


if (properties.state) {

    parts.push(
        properties.state
    );

}


if (properties.postcode) {

    parts.push(
        properties.postcode
    );

}


if (properties.country) {

    parts.push(
        properties.country
    );

}


return parts.join(", ");


}

/* =========================================================
DISPLAY SELECTED LOCATION
========================================================= */

function displaySelectedLocation(
properties,
latitude,
longitude
) {


if (
    !selectedLocation ||
    !selectedLocationDetails
) {

    return;

}


selectedLocation.style.display =
    "block";


const rows = [];


/*
 * Building / place name
 */

if (properties.name) {

    rows.push(
        createDetailRow(
            "Building / Place",
            properties.name
        )
    );

}


/*
 * House number
 */

if (properties.housenumber) {

    rows.push(
        createDetailRow(
            "Building / House No",
            properties.housenumber
        )
    );

}


/*
 * Street
 */

if (properties.street) {

    rows.push(
        createDetailRow(
            "Street",
            properties.street
        )
    );

}


/*
 * Locality / suburb
 */

const locality =
    properties.suburb ||
    properties.locality ||
    properties.district;


if (locality) {

    rows.push(
        createDetailRow(
            "Locality",
            locality
        )
    );

}


/*
 * City
 */

if (properties.city) {

    rows.push(
        createDetailRow(
            "City",
            properties.city
        )
    );

}


/*
 * State
 */

if (properties.state) {

    rows.push(
        createDetailRow(
            "State",
            properties.state
        )
    );

}


/*
 * PIN / postcode
 */

if (properties.postcode) {

    rows.push(
        createDetailRow(
            "PIN / Postcode",
            properties.postcode
        )
    );

}


/*
 * Country
 */

if (properties.country) {

    rows.push(
        createDetailRow(
            "Country",
            properties.country
        )
    );

}


/*
 * Coordinates
 */

rows.push(
    createDetailRow(
        "Coordinates",
        `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
    )
);


selectedLocationDetails.innerHTML =
    rows.join("");


}

/* =========================================================
DISPLAY COORDINATES WHEN ADDRESS UNAVAILABLE
========================================================= */

function displayCoordinatesOnly(
latitude,
longitude
) {


if (
    !selectedLocation ||
    !selectedLocationDetails
) {

    return;

}


selectedLocation.style.display =
    "block";


selectedLocationDetails.innerHTML =
    createDetailRow(
        "Coordinates",
        `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
    );


}

/* =========================================================
CREATE DETAIL ROW
========================================================= */

function createDetailRow(
label,
value
) {


return `
    <div class="location-detail-row">
        <span class="location-detail-label">
            ${escapeHtml(label)}:
        </span>

        <span>
            ${escapeHtml(value)}
        </span>
    </div>
`;


}

/* =========================================================
ADDRESS AUTOCOMPLETE
========================================================= */

if (locationSearch) {


locationSearch.addEventListener(
    "input",
    function() {

        const query =
            locationSearch.value.trim();


        if (clearSearchButton) {

            clearSearchButton.style.display =
                query.length > 0
                    ? "block"
                    : "none";

        }


        clearTimeout(
            autocompleteTimeout
        );


        if (query.length < 3) {

            hideSuggestions();

            return;

        }


        /*
         * Delay request slightly to avoid making an
         * API request for every single keystroke.
         */

        autocompleteTimeout =
            setTimeout(
                function() {

                    fetchAddressSuggestions(
                        query
                    );

                },
                300
            );

    }
);


}

/* =========================================================
FETCH ADDRESS SUGGESTIONS
========================================================= */

async function fetchAddressSuggestions(
query
) {


try {

    const url =
        "https://api.geoapify.com/v1/geocode/autocomplete" +
        `?text=${encodeURIComponent(query)}` +
        "&limit=5" +
        "&lang=en" +
        "&apiKey=" +
        encodeURIComponent(
            GEOAPIFY_API_KEY
        );


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Address autocomplete failed."
        );

    }


    const result =
        await response.json();


    renderSuggestions(
        result.features || []
    );


} catch (error) {

    console.error(
        "Geoapify autocomplete error:",
        error
    );


    hideSuggestions();

}


}

/* =========================================================
RENDER SUGGESTIONS
========================================================= */

function renderSuggestions(
features
) {


if (!locationSuggestions) {
    return;
}


locationSuggestions.innerHTML =
    "";


if (!features.length) {

    hideSuggestions();

    return;

}


features.forEach(
    function(feature) {

        const properties =
            feature.properties;


        const suggestion =
            document.createElement(
                "div"
            );


        suggestion.className =
            "location-suggestion";


        const title =
            properties.name ||
            properties.street ||
            properties.city ||
            "Location";


        const address =
            properties.formatted ||
            buildAddress(
                properties
            );


        suggestion.innerHTML = `
            <div class="location-suggestion-title">
                ${escapeHtml(title)}
            </div>

            <div class="location-suggestion-address">
                ${escapeHtml(address)}
            </div>
        `;


        suggestion.addEventListener(
            "click",
            function() {

                selectAddressFeature(
                    feature
                );

            }
        );


        locationSuggestions.appendChild(
            suggestion
        );

    }
);


locationSuggestions.style.display =
    "block";


}

/* =========================================================
SELECT SEARCH RESULT
========================================================= */

function selectAddressFeature(
feature
) {


const properties =
    feature.properties;


let latitude =
    properties.lat;

let longitude =
    properties.lon;


/*
 * Fallback to GeoJSON geometry.
 */

if (
    (latitude === undefined ||
     longitude === undefined) &&
    feature.geometry &&
    feature.geometry.coordinates
) {

    longitude =
        feature.geometry.coordinates[0];

    latitude =
        feature.geometry.coordinates[1];

}


if (
    latitude === undefined ||
    longitude === undefined
) {

    setStatus(
        "This search result did not contain coordinates."
    );

    return;

}


latitude =
    Number(latitude);

longitude =
    Number(longitude);


const formattedAddress =
    properties.formatted ||
    buildAddress(
        properties
    );


/*
 * Update search box.
 */

if (locationSearch) {

    locationSearch.value =
        formattedAddress || "";

}


if (clearSearchButton) {

    clearSearchButton.style.display =
        "block";

}


hideSuggestions();


/*
 * Move marker.
 */

createOrMoveMarker(
    latitude,
    longitude,
    true
);


/*
 * Immediately show the search result.
 */

selectedAddress =
    properties;


if (locationInput) {

    locationInput.value =
        formattedAddress || "";

}


displaySelectedLocation(
    properties,
    latitude,
    longitude
);


setStatus(
    "Address selected. Drag the pin to fine-tune the location."
);


/*
 * Reverse-geocode the exact coordinates as well.
 */

updateLocationFromCoordinates(
    latitude,
    longitude
);


}

/* =========================================================
CLEAR SEARCH
========================================================= */

if (clearSearchButton) {


clearSearchButton.addEventListener(
    "click",
    function() {

        if (locationSearch) {

            locationSearch.value =
                "";

            locationSearch.focus();

        }


        clearSearchButton.style.display =
            "none";


        hideSuggestions();

    }
);


}

/* =========================================================
HIDE SUGGESTIONS
========================================================= */

function hideSuggestions() {


if (!locationSuggestions) {
    return;
}


locationSuggestions.style.display =
    "none";


}

/* =========================================================
CLOSE SUGGESTIONS ON OUTSIDE CLICK
========================================================= */

document.addEventListener(
"click",
function(event) {


    if (!locationSearch ||
        !locationSuggestions) {

        return;

    }


    if (
        !locationSearch.contains(
            event.target
        ) &&
        !locationSuggestions.contains(
            event.target
        )
    ) {

        hideSuggestions();

    }

}


);

/* =========================================================
USE MY LOCATION
========================================================= */

if (useMyLocationButton) {


useMyLocationButton.addEventListener(
    "click",
    function() {

        if (!navigator.geolocation) {

            setStatus(
                "Geolocation is not supported by this browser."
            );

            return;

        }


        useMyLocationButton.disabled =
            true;


        setStatus(
            "Finding your location..."
        );


        navigator.geolocation.getCurrentPosition(

            function(position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                const accuracy =
                    position.coords.accuracy;


                /*
                 * Move marker to user's position.
                 */

                createOrMoveMarker(
                    latitude,
                    longitude,
                    true
                );


                /*
                 * Display browser-reported
                 * positioning accuracy.
                 */

                if (
                    Number.isFinite(
                        accuracy
                    )
                ) {

                    setStatus(
                        `Location found. Accuracy: approximately ${Math.round(accuracy)} m. Finding address...`
                    );

                } else {

                    setStatus(
                        "Location found. Finding address..."
                    );

                }


                /*
                 * Reverse-geocode coordinates.
                 */

                updateLocationFromCoordinates(
                    latitude,
                    longitude
                );


                useMyLocationButton.disabled =
                    false;

            },


            function(error) {

                let message =
                    "Unable to determine your location.";


                switch (error.code) {

                    case error.PERMISSION_DENIED:

                        message =
                            "Location permission was denied. Please allow location access in your browser.";

                        break;


                    case error.POSITION_UNAVAILABLE:

                        message =
                            "Your location is currently unavailable.";

                        break;


                    case error.TIMEOUT:

                        message =
                            "Location request timed out. Please try again.";

                        break;

                }


                setStatus(
                    message
                );


                useMyLocationButton.disabled =
                    false;

            },


            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    }
);


}

/* =========================================================
STATUS
========================================================= */

function setStatus(
message
) {


if (!locationStatus) {
    return;
}


locationStatus.textContent =
    message;


}

/* =========================================================
ESCAPE HTML
========================================================= */

function escapeHtml(
value
) {


if (
    value === null ||
    value === undefined
) {

    return "";

}


return String(value)
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );


}

/* =========================================================
PUBLIC API
========================================================= */

window.businessMap = {


/*
 * Get currently selected coordinates.
 */

getCoordinates: function() {

    if (
        selectedLatitude === null ||
        selectedLongitude === null
    ) {

        return null;

    }


    return {

        latitude:
            selectedLatitude,

        longitude:
            selectedLongitude

    };

},


/*
 * Get the currently selected Geoapify
 * address properties.
 */

getAddress: function() {

    return selectedAddress;

},


/*
 * Get the Leaflet map instance.
 */

getMap: function() {

    return map;

}


};
