/**
 *
 * @param { import("leaflet") } L
 */
async function main(L) {
  const center = { lat: 37.8761406467995, lng: -122.27620124816896 };

  const zoomLevel = 14;

  const map = L.map("map").setView(center, zoomLevel);

  globalThis.map = map;

  /*L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      maxZoom: 18,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
    }
  ).addTo(map); */

  const data = await fetchData();

  L.geoJSON(data, {
    style: function (feature) {
      const fill = feature.properties.color;
      return { color: fill, fill, fillOpacity: "1.0", weight: 0 };
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(() => {
        console.log(feature.properties);

        const net_tax_formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(feature.properties.net_taxable);

        return `
<pre>
APN:         ${feature.properties.apn}
Net Taxable: ${net_tax_formatted}
</pre>
        `;
      });
    },
  })

    /*.bindPopup(function (layer) {
      console.log(layer);
      return layer.feature.properties.net_taxable;
      // return layer.feature.properties.description;
    })*/
    .addTo(map);
}

async function fetchData() {
  const resp = await fetch("./berk-tax-map.geojson");
  const data = await resp.json();

  return data;
}

main(L).then(() => {});
