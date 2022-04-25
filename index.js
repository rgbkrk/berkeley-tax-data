/**
 *
 * @param { import("leaflet") } L
 */
async function main(L) {
  const center = { lat: 37.87414200707175, lng: -122.2753429412842 };

  const zoomLevel = 14;

  const map = L.map("map").setView(center, zoomLevel);

  globalThis.map = map;

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicmdia3JrIiwiYSI6ImNsMmV0YTQ0OTAzeG4zYnF6a2h6dnd6ZGgifQ.MSykZRjit-9UlrXKN4aK7A",
    {
      maxZoom: 18,
      attribution:
        'Parcel data <a href="https://data.cityofberkeley.info/">City of Berkeley Open Data</a>, ' +
        'Tax data <a href="https://acgov.org/MS/prop/index.aspx">Alameda County Assessor</a>, ' +
        'Analysis <a href="https://twitter.com/rgbkrk">Kyle Kelley</a>',
      id: "mapbox/dark-v10",
      tileSize: 512,
      zoomOffset: -1,
    }
  ).addTo(map);

  var legend = L.control({ position: "bottomleft" });
  legend.onAdd = function (map) {
    return Legend();
  };
  legend.addTo(map);

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

function Legend() {
  const div = document.createElement("div");
  div.innerHTML = `
  <div style="
    background-color: #ffffff99;
    padding: 5px 10px;
  ">
  <div
    style="
      vertical-align: middle;
      max-width: 258px;
      display: flex;
      justify-content: space-between;
    "
  >
    <strong style="float: left">Berkeley Property Tax Revenue</strong>
  </div>
  <div class="cmap">
    <img
      alt="colormap legend"
      title="Taxable Berkeley Legend"
      src="./heatmap.png"
    />
  </div>
  <div
    style="
      vertical-align: middle;
      max-width: 258px;
      display: flex;
      justify-content: space-between;
    "
  >
    <div style="float: left">
      <div
        title="#3b4cc0ff"
        style="
          display: inline-block;
          width: 1em;
          height: 1em;
          margin: 0;
          vertical-align: middle;
          border: 1px solid #555;
          background-color: #3b4cc0ff;
        "
      ></div>
      Low Revenue
    </div>
    <div style="float: right">
      High Revenue
      <div
        title="#b40426ff"
        style="
          display: inline-block;
          width: 1em;
          height: 1em;
          margin: 0;
          vertical-align: middle;
          border: 1px solid #555;
          background-color: #b40426ff;
        "
      ></div>
    </div>
  </div>
</div>`;
  return div;
}

async function fetchData() {
  const resp = await fetch("./berk-tax-map.geojson");
  const data = await resp.json();

  return data;
}

main(L).then(() => {});
