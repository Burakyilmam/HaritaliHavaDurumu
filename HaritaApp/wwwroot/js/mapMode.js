import { GetMap } from "./map.js";
import { GetCityLayer } from "./cityLayer.js";
import { GetLegendControl } from "./legend.js";
import { GetColorByTemperature, GetColorByWind, GetColorByRain, makeDraggableControl } from "./utility.js";

let currentMapMode = "temperature";
let modeControlInstance = null;

export function GetMapMode() {
    return currentMapMode;
}

export function AddMapModeControl() {

    const map = GetMap();
    if (!map) return;

    const ModeControl = L.Control.extend({
        options: { position: "topleft" },

        onAdd: function () {

            const div = L.DomUtil.create("div");

            Object.assign(div.style, {
                background: "white",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "13px",
                minWidth: "140px"
            });

            const modes = [
                { id: "temperature", label: "🌡️ Sıcaklık" },
                { id: "wind", label: "💨 Rüzgar" },
                { id: "rain", label: "🌧️ Yağış" },
            ];

            div._updateButtons = function () {
                Array.from(div.children).forEach(child => {
                    const modeId = child.dataset?.mode;
                    if (!modeId) return;

                    child.style.background =
                        modeId === currentMapMode ? "#e3f2fd" : "transparent";
                });
            };

            modes.forEach(m => {

                const btn = document.createElement("div");

                btn.textContent = m.label;
                btn.dataset.mode = m.id;

                Object.assign(btn.style, {
                    cursor: "pointer",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    transition: "0.2s",
                    background: m.id === currentMapMode ? "#e3f2fd" : "transparent"
                });

                btn.onmouseenter = () => btn.style.background = "#f1f1f1";
                btn.onmouseleave = () => div._updateButtons();

                btn.onclick = () => {
                    SetMapMode(m.id);
                    div._updateButtons();
                };

                div.appendChild(btn);
            });

            makeDraggableControl(div);

            return div;
        }
    });

    modeControlInstance = new ModeControl();
    map.addControl(modeControlInstance);
}

export function SetMapMode(mode) {

    currentMapMode = mode;

    const map = GetMap();
    const cityLayer = GetCityLayer();
    if (!map || !cityLayer) return;

    const legendControl = GetLegendControl();

    map.getContainer().style.cursor = 'wait';

    cityLayer.eachLayer(layer => {

        const weather = layer._weatherData;
        if (!weather) return;

        let color = "#ccc";

        switch (mode) {
            case "temperature":
                color = GetColorByTemperature(weather.temperature);
                break;
            case "wind":
                color = GetColorByWind(weather.windspeed);
                break;
            case "rain":
                color = GetColorByRain(weather.precipitation || 0);
                break;
        }

        layer.setStyle({
            fillColor: color,
            fillOpacity: 0.6
        });
    });

    setTimeout(() => {
        map.getContainer().style.cursor = '';
    }, 150);

    if (modeControlInstance?._container?._updateButtons) {
        modeControlInstance._container._updateButtons();
    }

    if (legendControl?._container?._renderLegend) {
        legendControl._container._renderLegend();
    }
}