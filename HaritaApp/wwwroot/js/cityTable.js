import { FlyToCity } from "./cityLayer.js";
import { GetColorByTemperature, GetColorByWind, GetColorByRain } from "./utility.js";
export function AddCityToTable(cityName, lat, lng, weather) {

    const tbody = document.querySelector("#cityTable tbody");

    const tr = document.createElement("tr");

    tr.innerHTML =
        `
     <td>${cityName}</td>
     <td>${lat.toFixed(4)}</td>
     <td>${lng.toFixed(4)}</td>

     <td>
         <span style=" color:${GetColorByTemperature(weather.temperature)}; font-weight:bold; ">
             ${weather.temperature}
         </span>
         <b>°C</b>
     </td>

     <td>
          <span style=" color:${GetColorByWind(weather.windspeed)};font-weight:bold;">
             ${weather.windspeed}
         </span>
          <b>km/s</b> 
     </td>

     <td>
          <span style=" color:${GetColorByRain(weather.precipitation)};font-weight:bold;">
             ${weather.precipitation}
         </span>
         <b>mm</b>
     </td>
    `;

    tr.onclick = () => {

        document.querySelectorAll("#cityTable tbody tr").forEach(r => r.classList.remove("selected"));

        tr.classList.add("selected");

        document.getElementById("map").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        FlyToCity(cityName);
    };
    tbody.appendChild(tr);
}