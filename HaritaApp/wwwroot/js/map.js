let map = null;

export function CreateMap(lat, lng, zoom, maxZoom) {

    if (map) {
        map.off();
        map.remove();
        map = null;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) return null;

    const openstreetmap = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: maxZoom }
    );

    const googlemap = L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        { maxZoom: maxZoom }
    );

    map = L.map('map', {
        center: [lat, lng],
        zoom: zoom,
        layers: [openstreetmap]
    });

    L.control.layers({
        "OpenStreetMap": openstreetmap,
        "Google": googlemap
    }).addTo(map);

    map.doubleClickZoom.disable();

    return map;
}

export function GetMap() {
    return map;
}