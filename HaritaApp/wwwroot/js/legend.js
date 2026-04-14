import { GetMap } from "./map.js";
import { GetColorByTemperature, GetColorByWind, GetColorByRain, makeDraggableControl } from "./utility.js";
import { GetMapMode } from "./mapMode.js";

let legendControl = null;

export function GetLegendControl() {
    return legendControl;
}

export function AddDynamicLegend() {

    const map = GetMap();
    if (!map) return;

    if (legendControl) {
        map.removeControl(legendControl);
        legendControl = null;
    }

    legendControl = L.control({ position: 'bottomright' });

    legendControl.onAdd = function () {

        const div = L.DomUtil.create('div', 'info legend');

        Object.assign(div.style, {
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            fontSize: '13px',
            lineHeight: '18px',
            overflow: 'hidden',
            minWidth: '40px'
        });

        const header = document.createElement('div');
        const content = document.createElement('div');

        Object.assign(header.style, {
            padding: '8px 10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        });

        content.style.padding = '8px 10px';

        const title = document.createElement('span');
        const toggle = document.createElement('span');
        toggle.textContent = "▼";

        header.appendChild(title);
        header.appendChild(toggle);

        div.appendChild(header);
        div.appendChild(content);

        function renderLegend() {

            let ranges = [];
            const currentMapMode = GetMapMode();

            if (currentMapMode === "temperature") {
                title.textContent = "🌡️ Sıcaklık (°C)";
                ranges = [
                    { label: "-40+", color: GetColorByTemperature(-41) },
                    { label: "-40 – -30", color: GetColorByTemperature(-35) },
                    { label: "-30 – -20", color: GetColorByTemperature(-25) },
                    { label: "-20 – -10", color: GetColorByTemperature(-15) },
                    { label: "-10 – 0", color: GetColorByTemperature(-5) },
                    { label: "0 – 10", color: GetColorByTemperature(5) },
                    { label: "10 – 20", color: GetColorByTemperature(15) },
                    { label: "20 – 30", color: GetColorByTemperature(25) },
                    { label: "30 – 40", color: GetColorByTemperature(35) },
                    { label: "40 – 50", color: GetColorByTemperature(45) },
                    { label: "50+", color: GetColorByTemperature(55) }
                ];
            }

            if (currentMapMode === "wind") {
                title.textContent = "💨 Rüzgar";
                ranges = [
                    { label: "0 – 5", color: GetColorByWind(2) },
                    { label: "5 – 15", color: GetColorByWind(10) },
                    { label: "15 – 25", color: GetColorByWind(20) },
                    { label: "25 – 40", color: GetColorByWind(30) },
                    { label: "40+", color: GetColorByWind(50) }
                ];
            }

            if (currentMapMode === "rain") {
                title.textContent = "🌧️ Yağış";
                ranges = [
                    { label: "0", color: GetColorByRain(0) },
                    { label: "0 – 2", color: GetColorByRain(1) },
                    { label: "2 – 5", color: GetColorByRain(3) },
                    { label: "5 – 15", color: GetColorByRain(10) },
                    { label: "15+", color: GetColorByRain(20) }
                ];
            }

            content.innerHTML = ranges.map(r => `
    <div class="legend-item">
        <div class="legend-box" style="background:${r.color}">
            ${r.label}
        </div>
    </div>
`).join("");
        }

        renderLegend();

        header.onclick = function () {
            const isOpen = content.style.display !== 'none';
            content.style.display = isOpen ? 'none' : 'block';
            toggle.textContent = isOpen ? '▼' : '▲';
        };

        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div);

        makeDraggableControl(div);

        div._renderLegend = () => {
            if (typeof renderLegend === "function") {
                renderLegend();
            }
        };

        return div;
    };

    legendControl.addTo(map);
}
