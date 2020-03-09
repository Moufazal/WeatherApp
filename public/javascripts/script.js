var etatVille = document.getElementById("cityValue").value;
var txtCityNotFound = document.getElementById("txtVilleIntrouvable");

    if (etatVille == 0){
        txtCityNotFound.classList.remove("d-none");
    };



// LEAFLET MAP (take example with openstreetmap not mapbox)
    //Documentation  -> https://leafletjs.com/reference-1.6.0.html

    // Initialize map
    var mymap = L.map('mapid',
              {
                center: [48.8756587, 2.3482884],
                zoom: 5
              }
            );

    // Dsiplay map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mymap);

    // Add marker and popup for each cities
    var citiesList = document.querySelectorAll('.allCities');
    var marker;

    for (var i=0; i < citiesList.length; i++){
        marker = L.marker([citiesList[i].dataset.lat, citiesList[i].dataset.lon]).addTo(mymap).bindPopup(citiesList[i].dataset.cityname, {autoClose:false}).openPopup();
    }

