/**
 *
 * @param { import("leaflet") } L
 */
async function main(L) {
  const center = { lat: 37.8761406467995, lng: -122.27620124816896 };

  const zoomLevel = 14;

  const map = L.map("map").setView(center, zoomLevel);

  globalThis.map = map;

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicmdia3JrIiwiYSI6ImNsMmV0YTQ0OTAzeG4zYnF6a2h6dnd6ZGgifQ.MSykZRjit-9UlrXKN4aK7A",
    {
      maxZoom: 18,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: "mapbox/dark-v10",
      tileSize: 512,
      zoomOffset: -1,
    }
  ).addTo(map);

  const data = await fetchData();

  L.geoJSON(data, {
    style: function (feature) {
      const fill = feature.properties.color;
      return { color: fill, fill, fillOpacity: "1.0", weight: 0 };
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(() => {
        return TaxPopup(feature.properties);
      });
    },
  }).addTo(map);
}

/**
 *
 * @param {{apn: string, net_taxable: string, district: string}} props
 * @returns string
 */
function TaxPopup(props) {
  const net_tax_formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // Decimals are always .00 so we might as well remove them
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(props.net_taxable);

  return `
<pre>
APN:         <a href="${props.assessment_page}" target="_blank">${props.apn}</a>
Net Taxable: ${net_tax_formatted}
District:    ${props.district}
</pre>
  `;
}

async function fetchData() {
  const resp = await fetch("./berk-tax-map.geojson");
  const data = await resp.json();

  return data;
}

main(L).then(() => {});
