import { weatherStats } from "./weatherData.js";
import { GetMap } from "./map.js";
import { makeDraggableControl } from "./utility.js";
import { FlyToCity } from './cityLayer.js';
import { SetMapMode } from './mapMode.js';

export function GetDailyLeaders() {

    if (!weatherStats || weatherStats.length === 0) return null;

    let hottest = weatherStats[0];
    let coldest = weatherStats[0];
    let windiest = weatherStats[0];
    let rainiest = weatherStats[0];

    weatherStats.forEach(w => {
        if (w.temperature > hottest.temperature) hottest = w;
        if (w.temperature < coldest.temperature) coldest = w;
        if ((w.windspeed || 0) > (windiest.windspeed || 0)) windiest = w;
        if ((w.precipitation || 0) > (rainiest.precipitation || 0)) rainiest = w;
    });

    return { hottest, coldest, windiest, rainiest };
}

export function DailyLeaderInfoPanel() {

    const map = GetMap();
    if (!map) return;

    const InfoControl = L.Control.extend({
        options: { position: 'topright' },

        onAdd: function () {

            const div = L.DomUtil.create('div');

            Object.assign(div.style, {
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                fontSize: '14px',
                overflow: 'hidden',
                minWidth: '300px'
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

            header.innerHTML = `
                <span>📊 Bugünün Özeti</span>
                <span id="hcToggle">▼</span>
            `;

            const stats = GetDailyLeaders();

            if (stats) {
                content.innerHTML = `
                    <div class="summary-item hot" data-city="${stats.hottest.city}" data-mode="temperature">
                        🔥 <b>En Sıcak</b> — ${stats.hottest.city} (${stats.hottest.temperature} °C)
                    </div>

                    <div class="summary-item cold" data-city="${stats.coldest.city}" data-mode="temperature">
                        ❄️ <b>En Soğuk</b> — ${stats.coldest.city} (${stats.coldest.temperature} °C)
                    </div>

                    <div class="summary-item wind" data-city="${stats.windiest.city}" data-mode="wind">
                        🌪️ <b>En Rüzgarlı</b> — ${stats.windiest.city} (${stats.windiest.windspeed || 0} km/s)
                    </div>

                    <div class="summary-item rain" data-city="${stats.rainiest.city}" data-mode="rain">
                        🌧️ <b>En Yağışlı</b> — ${stats.rainiest.city} (${stats.rainiest.precipitation || 0} mm)
                    </div>
                `;
            } else {
                content.innerHTML = "Veri yükleniyor...";
            }

            header.onclick = function () {
                const isOpen = content.style.display !== 'none';
                content.style.display = isOpen ? 'none' : 'block';
                header.querySelector('#hcToggle').innerHTML = isOpen ? '▼' : '▲';
            };

            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);

            div.appendChild(header);
            div.appendChild(content);

            makeDraggableControl(div);

            if (stats) {
                div.querySelectorAll('.summary-item').forEach(el => {
                    el.addEventListener('click', function () {
                        const city = this.dataset.city;
                        const mode = this.dataset.mode;
                        FocusLeader(city, mode);
                    });
                });
            }

            return div;
        }
    });

    map.addControl(new InfoControl());
}

export function FocusLeader(cityName, mode) {
    SetMapMode(mode);
    FlyToCity(cityName);
}