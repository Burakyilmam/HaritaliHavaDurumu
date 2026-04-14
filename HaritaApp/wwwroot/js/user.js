import { GetMap } from "./map.js";

let userMarker = null;

export function UserLocation() {

    if (!navigator.geolocation) return;

    const map = GetMap();
    if (!map) return;

    navigator.geolocation.getCurrentPosition(pos => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        map.setView([lat, lng], 11);

        if (userMarker) {
            map.removeLayer(userMarker);
        }

        userMarker = L.marker([lat, lng], {
            title: "Mevcut Konumunuz",
            riseOnHover: true
        })
            .addTo(map)
            .bindPopup(`
            <div style="font-family:Arial; font-size:13px;">
                <b>X:</b> ${lat.toFixed(5)}<br/>
                <b>Y:</b> ${lng.toFixed(5)}
            </div>
        `)
            .openPopup(); // 🔥

    }, () => {
        console.warn("Konum alınamadı");
    });
}

export function GetUserMarker() {
    return userMarker;
}