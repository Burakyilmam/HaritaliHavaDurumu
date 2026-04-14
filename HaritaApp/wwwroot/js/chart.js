import { GetWeatherHistory } from "./weather.js";
import { GetMap } from "./map.js";
import { makeDraggablePopup } from "./popup.js";

let activeChart = null;
export function OpenChartPopup(cityName, lat, lng) {

    map = GetMap();
    if (!map) return;

    if (chartPopup) {
        map.closePopup(chartPopup);
    }

    const safeName = cityName.replace(/\s/g, "");

    const popupContent = `
                                        <div style="width:340px;">
                                            <b>📈 ${cityName.toUpperCase()} - Son 24 Saat</b>

                                            <select
                                                style="
                                                    width:100%;
                                                    margin:6px 0;
                                                    padding:6px;
                                                    border-radius:6px;
                                                    border:1px solid #ccc;
                                                    font-size:13px;
                                                "
                                                onchange="RenderWeatherChart('chart_${safeName}', lastHistory, this.value)">

                                                <option value="line">📈 Line Chart</option>
                                                <option value="bar">📊 Bar Chart</option>
                                            </select>

                                            <canvas
                                                id="chart_${safeName}"
                                                style="background:white;border-radius:8px;padding:6px;margin-top:6px;height:260px;width:100%;">
                                            </canvas>
                                        </div>
                                    `;

    chartPopup = L.popup({
        closeOnClick: false,
        autoClose: false,
        maxWidth: 500,
        className: "chart-popup"
    })
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);

    GetWeatherHistory(lat, lng)
        .then(history => {
            RenderWeatherChart(`chart_${safeName}`, history);
        });

    makeDraggablePopup(chartPopup);
}

export function RenderWeatherChart(canvasId, history, type = "line") {

    lastHistory = history;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (activeChart) {
        activeChart.destroy();
    }

    const labels = history.hourly.time
        .slice(-24)
        .map(t => t.split("T")[1]);

    const temps = history.hourly.temperature_2m.slice(-24);

    activeChart = new Chart(canvas, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Sıcaklık (°C)',
                data: temps,
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255,152,0,0.4)',
                tension: 0.3,
                fill: type === "line"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}