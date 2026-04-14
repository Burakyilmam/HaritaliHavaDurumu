import { GetMap } from './map.js';
import { cityInfos } from "./cityData.js";
import { StartSlider } from "./slider.js";
import { makeDraggablePopup, GetWeatherIcon } from "./utility.js";

let activePopup = null;

export function ShowWeatherPopup(cityName, lat, lng, weather) {

    const map = GetMap();
    if (!map || !weather) return;

    // eski popup kapat
    if (activePopup && map.hasLayer(activePopup)) {
        map.closePopup(activePopup);
    }

    const infos = cityInfos[cityName] || [];
    if (infos.length === 0) return;

    const safeName = cityName.replace(/\s/g, "");
    const sliderId = `slider_${safeName}`;

    const popupContent = `
    <div class="weather-card">
        <div class="music-progress" id="progress_${safeName}">
                <div class="progress-fill" id="progressFill_${safeName}"></div>
        </div>
        <div class="weather-slider-wrapper">

            <div class="nav left"
                onclick="event.stopPropagation(); PrevSlide('${sliderId}')">‹</div>

            <div class="nav right"
                onclick="event.stopPropagation(); NextSlide('${sliderId}')">›</div>

            <div class="weather-slider" id="${sliderId}">
                ${infos.map(info => `
                    <div class="weather-slide"
                        data-title="${info.title}"
                        data-wiki="${info.wiki}"
                        style="background-image:url('${info.url}')">
                    </div>
                `).join("")}
            </div>

            <div class="weather-dots" id="dots_${safeName}">
                ${infos.map((_, i) => `
                    <div class="dot ${i === 0 ? 'active' : ''}"
                        onclick="event.stopPropagation(); SlideTo('${sliderId}', ${i})">
                    </div>
                `).join("")}
            </div>

            <div class="weather-overlay">
                <div class="weather-header">
                    <span class="weather-city">${cityName}</span>
                    <span class="weather-temp">
                        ${GetWeatherIcon(weather.weathercode)}
                        ${weather.temperature}°
                    </span>
                </div>

                <div class="photo-title" id="photoTitle_${safeName}">
                    ${infos[0]?.title || "-"}
                </div>

                <div class="weather-info">
                    💨 ${weather.windspeed} km/s<br/>
                    🌧️ ${weather.precipitation || 0} mm
                </div>

                <div class="weather-actions">
                    <button onclick="OpenWeatherDetail(${lat}, ${lng})">
                        🌦 Details
                    </button>

                    <button onclick="OpenChartPopup('${cityName}', ${lat}, ${lng})">
                       📈 Charts
                    </button>
                </div>

            </div>

        </div>
    </div>
    `;

    const popup = L.popup({
        closeOnClick: false,
        autoClose: false,
        className: "weather-popup"
    })
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);

    activePopup = popup;

    setTimeout(() => {
        StartSlider(sliderId, safeName);
    }, 100);

    setTimeout(() => {

        const container = document.getElementById(`progress_${safeName}`);
        const fill = document.getElementById(`progressFill_${safeName}`);

        if (!container || !fill) return;

        let percent = 0;

        const interval = setInterval(() => {
            percent += 1;

            fill.style.width = percent + "%";

            if (percent >= 100) {
                clearInterval(interval);
            }
        }, 100);

        let isDragging = false;

        function updateProgress(clientX) {

            const rect = container.getBoundingClientRect();
            let x = clientX - rect.left;

            let percent = x / rect.width;
            percent = Math.max(0, Math.min(1, percent));

            fill.style.width = (percent * 100) + "%";
        }

        container.addEventListener("click", (e) => {
            updateProgress(e.clientX);
        });

        container.addEventListener("mousedown", (e) => {
            isDragging = true;
            updateProgress(e.clientX);
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            updateProgress(e.clientX);
        });

        window.addEventListener("mouseup", () => {
            isDragging = false;
        });

    }, 200);

    makeDraggablePopup(popup);
}