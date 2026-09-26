/* ==========================================================
   Store Location Map
   Uses Leaflet for the map + Geoapify for:
     - Address Autocomplete API  (search bar suggestions)
     - Reverse Geocoding API     (drag pin / "use my location")
   ========================================================== */

// TODO: replace with your real Geoapify API key from https://myprojects.geoapify.com/
const GEOAPIFY_API_KEY = "9d177b0c49484117b5fe7addbf50bf56";

// Default map center/zoom shown before the user picks a location
const DEFAULT_CENTER = [20.5937, 78.9629]; // India, roughly centered
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 17;

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("location-search");
    const suggestionsBox = document.getElementById("location-suggestions");
    const locateBtn = document.getElementById("locate-me-btn");
    const resolvedBox = document.getElementById("resolved-address");
    const resolvedText = document.getElementById("resolved-address-text");
    const locationError = document.getElementById("location-error");
    const addressTextarea = document.getElementById("address");
    const latInput = document.getElementById("store_lat");
    const lonInput = document.getElementById("store_lon");

    if (!document.getElementById("store-map")) return; // block not present on this page

    // ---- Map setup ----
    const map = L.map("store-map").setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer(
        "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=" + GEOAPIFY_API_KEY,
        {
            attribution:
                '&copy; <a href="https://www.geoapify.com/">Geoapify</a> | &copy; OpenStreetMap contributors',
            maxZoom: 20
        }
    ).addTo(map);

    let marker = null;

    function placeMarker(lat, lon) {
        if (marker) {
            marker.setLatLng([lat, lon]);
        } else {
            marker = L.marker([lat, lon], { draggable: true }).addTo(map);
            marker.on("dragend", function () {
                const pos = marker.getLatLng();
                setCoordinates(pos.lat, pos.lng);
                reverseGeocode(pos.lat, pos.lng);
            });
        }
        map.setView([lat, lon], SELECTED_ZOOM);
    }

    // Clicking the map also places/moves the pin
    map.on("click", function (e) {
        placeMarker(e.latlng.lat, e.latlng.lng);
        setCoordinates(e.latlng.lat, e.latlng.lng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    function setCoordinates(lat, lon) {
        latInput.value = lat;
        lonInput.value = lon;
    }

    function showError(message) {
        locationError.textContent = message;
        locationError.style.display = "block";
    }

    function clearError() {
        locationError.style.display = "none";
        locationError.textContent = "";
    }

    // Build a readable "street, building, pincode, city" style line from
    // a Geoapify result's `properties` object (works for both autocomplete
    // and reverse geocoding responses).
    function formatAddressParts(props) {
        const parts = [];

        if (props.name && props.name !== props.street) parts.push(props.name); // building/POI name
        const streetLine = [props.housenumber, props.street].filter(Boolean).join(" ");
        if (streetLine) parts.push(streetLine);
        if (props.suburb) parts.push(props.suburb);
        if (props.city) parts.push(props.city);
        if (props.state) parts.push(props.state);
        if (props.postcode) parts.push(props.postcode);
        if (props.country) parts.push(props.country);

        return parts.length ? parts.join(", ") : (props.formatted || "");
    }

    function showResolvedAddress(props) {
        resolvedText.textContent = props.formatted || formatAddressParts(props);
        resolvedBox.style.display = "block";

        // Keep the store address field in sync with the pinned location
        addressTextarea.value = props.formatted || formatAddressParts(props);
    }

    // ---- Reverse geocoding (used on drag / map click / geolocation) ----
    async function reverseGeocode(lat, lon) {
        try {
            const url =
                "https://api.geoapify.com/v1/geocode/reverse?lat=" + lat +
                "&lon=" + lon +
                "&format=json&apiKey=" + GEOAPIFY_API_KEY;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Reverse geocoding failed");

            const data = await res.json();
            const result = data.results && data.results[0];

            if (result) {
                showResolvedAddress(result);
                clearError();
            } else {
                showError("Couldn't resolve an address for this location. You can still submit — the pin is saved.");
            }
        } catch (err) {
            showError("Couldn't look up the address for this location. The pin's coordinates are still saved.");
        }
    }

    // ---- Address Autocomplete (search bar) ----
    let debounceTimer = null;
    let activeSuggestionIndex = -1;
    let currentSuggestions = [];

    searchInput.addEventListener("input", function () {
        const text = searchInput.value.trim();
        clearTimeout(debounceTimer);

        if (text.length < 3) {
            closeSuggestions();
            return;
        }

        debounceTimer = setTimeout(() => fetchSuggestions(text), 300);
    });

    async function fetchSuggestions(text) {
        try {
            const url =
                "https://api.geoapify.com/v1/geocode/autocomplete?text=" +
                encodeURIComponent(text) +
                "&format=json&limit=5&apiKey=" + GEOAPIFY_API_KEY;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Autocomplete request failed");

            const data = await res.json();
            currentSuggestions = data.results || [];
            renderSuggestions();
        } catch (err) {
            showError("Address search is temporarily unavailable.");
        }
    }

    function renderSuggestions() {
        activeSuggestionIndex = -1;
        suggestionsBox.innerHTML = "";

        if (!currentSuggestions.length) {
            const empty = document.createElement("div");
            empty.className = "suggestion-empty";
            empty.textContent = "No matching addresses found";
            suggestionsBox.appendChild(empty);
            openSuggestions();
            return;
        }

        currentSuggestions.forEach((result, index) => {
            const item = document.createElement("div");
            item.className = "suggestion-item";
            item.innerHTML =
                '<i class="fa-solid fa-location-dot"></i><span>' +
                (result.formatted || formatAddressParts(result)) +
                "</span>";
            item.addEventListener("click", () => selectSuggestion(index));
            suggestionsBox.appendChild(item);
        });

        openSuggestions();
    }

    function selectSuggestion(index) {
        const result = currentSuggestions[index];
        if (!result) return;

        searchInput.value = result.formatted || formatAddressParts(result);
        closeSuggestions();

        placeMarker(result.lat, result.lon);
        setCoordinates(result.lat, result.lon);
        showResolvedAddress(result);
        clearError();
    }

    function openSuggestions() {
        suggestionsBox.classList.add("open");
    }

    function closeSuggestions() {
        suggestionsBox.classList.remove("open");
        suggestionsBox.innerHTML = "";
        currentSuggestions = [];
        activeSuggestionIndex = -1;
    }

    // Keyboard navigation for the suggestions list
    searchInput.addEventListener("keydown", function (e) {
        const items = suggestionsBox.querySelectorAll(".suggestion-item");
        if (!items.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, items.length - 1);
            updateActiveSuggestion(items);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
            updateActiveSuggestion(items);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeSuggestionIndex >= 0) selectSuggestion(activeSuggestionIndex);
        } else if (e.key === "Escape") {
            closeSuggestions();
        }
    });

    function updateActiveSuggestion(items) {
        items.forEach((el, i) => el.classList.toggle("active", i === activeSuggestionIndex));
        items[activeSuggestionIndex].scrollIntoView({ block: "nearest" });
    }

    // Close the dropdown when clicking elsewhere on the page
    document.addEventListener("click", function (e) {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            closeSuggestions();
        }
    });

    // ---- "Use My Current Location" button ----
    locateBtn.addEventListener("click", function () {
        if (!navigator.geolocation) {
            showError("Geolocation isn't supported by your browser.");
            return;
        }

        clearError();
        locateBtn.disabled = true;
        const originalHtml = locateBtn.innerHTML;
        locateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Locating...</span>';

        navigator.geolocation.getCurrentPosition(
            function (position) {
                const { latitude, longitude } = position.coords;
                placeMarker(latitude, longitude);
                setCoordinates(latitude, longitude);
                reverseGeocode(latitude, longitude);
                locateBtn.disabled = false;
                locateBtn.innerHTML = originalHtml;
            },
            function () {
                showError("Couldn't get your location. Please allow location access or search for your address instead.");
                locateBtn.disabled = false;
                locateBtn.innerHTML = originalHtml;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
});
