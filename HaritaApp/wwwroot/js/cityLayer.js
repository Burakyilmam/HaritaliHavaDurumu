import { UserLocation } from './user.js';
import { GetMap } from './map.js';
import { GetCurrentWeather } from './weather.js';
import { GetColorByTemperature } from './utility.js';
import { AddDynamicLegend } from './legend.js';
import { AddMapModeControl } from './mapMode.js';
import { DailyLeaderInfoPanel } from './dailyLeader.js';
import { weatherStats } from "./weatherData.js";
import { ShowWeatherPopup } from "./popup.js";
import { AddCityToTable } from "./cityTable.js";
import { AddCitySearchControl } from "./citySearch.js";

let cityNames = [];
let cityLayer = null;
const weatherCache = {};

export function GetCityLayer() {
    return cityLayer;
}

export function GetCityNames() {
    return cityNames;
}

export function TurkeyGeoJsonDatas() {

    const map = GetMap();
    if (!map) return;

    const geoUrl = "https://raw.githubusercontent.com/cihadturhan/tr-geojson/master/geo/tr-cities-utf8.json";

    fetch(geoUrl)
        .then(res => res.json())
        .then(data => {

            cityNames = data.features.map(f => f.properties.name);

            cityLayer = L.geoJSON(data, {
                style: () => ({
                    color: "#555",
                    weight: 1,
                    fill: true,
                    fillOpacity: 0.4
                }),

                onEachFeature: function (feature, layer) {

                    const center = layer.getBounds().getCenter();
                    const lat = center.lat;
                    const lng = center.lng;
                    const cityName = feature.properties.name;

                    GetCurrentWeather(lat, lng, cityName).then(weather => {

                        if(!weather) return;

                        if (!weatherStats.find(w => w.city === cityName)) {
                            weatherStats.push(weather);
                        }

                        layer._weatherData = weather;

                        if (weatherStats.length === 81) {
                            DailyLeaderInfoPanel();
                        }

                        AddCityToTable(cityName, lat, lng, weather);

                        layer.setStyle({
                            fillColor: GetColorByTemperature(weather.temperature)
                        });

                        layer.bindTooltip(`
                         <div style="
                             font-family: Arial;
                             font-size: 13px;
                             padding: 4px;
                         ">
                             <div style="font-weight:bold;">
                                 ${cityName}
                             </div>

                             <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                                 <img 
                                     src="" 
                                     style="width:20px;height:20px;"
                                 />
                                 <span style="color:${GetColorByTemperature(weather.temperature)}">
                                     ${weather.temperature} °C
                                 </span>
                             </div>

                             <div style="font-size:11px; margin-top:4px;">
                                 💨 ${weather.windspeed} km/s
                             </div>
                         </div>
                     `, {
                            sticky: true,
                            direction: "top",
                            offset: [0, -10]
                        });

                    });

                    layer.on('click', async function () {

                        let weather = weatherCache[cityName];

                        if (!weather) {
                            weather = await GetCurrentWeather(lat, lng, cityName);
                            if (!weather) return;

                            weatherCache[cityName] = weather;
                        }

                        ShowWeatherPopup(cityName, lat, lng, weather);
                    });

                    layer.on('mouseover', () => {
                        layer.setStyle({ weight: 3 });
                    });

                    layer.on('mouseout', () => {
                        layer.setStyle({ weight: 1 });
                    });
                }

            }).addTo(map);

            map.fitBounds(cityLayer.getBounds());

            AddDynamicLegend();
            AddMapModeControl();
            AddCitySearchControl();
            UserLocation();
        })
        .catch(err => console.error("GeoJSON yüklenemedi", err));
}

export function FlyToCity(cityName) {
    const map = GetMap();
    if (!map) return;

    if (!cityLayer) return;

    cityLayer.eachLayer(layer => {
        if (layer.feature.properties.name === cityName) {
            const center = layer.getBounds().getCenter();
            map.flyTo(center, 8, {
                animate: true,
                duration: 1.5
            });
        }
    });
}