export function OpenWeatherDetail(lat, lng) {
    window.open(`https://www.windy.com/${lat}/${lng}`, '_blank');
}

export function OpenCityWiki(cityName) {
    const url = "https://tr.wikipedia.org/wiki/" + encodeURIComponent(cityName);
    window.open(url, "_blank", "noopener,noreferrer");
}
