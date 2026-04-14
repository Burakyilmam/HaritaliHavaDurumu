export function GetCurrentWeather(lat, lng, cityName = "") {

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,apparent_temperature,precipitation,cloudcover,windspeed_10m&daily=sunshine_duration,precipitation_sum&current_weather=true`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Weather API error: " + response.status);
            }
            return response.json();
        })
        .then(data => {

            if (!data || !data.current_weather) return null;

            return {
                city: cityName,
                temperature: data.current_weather.temperature,
                windspeed: data.current_weather.windspeed,
                winddirection: data.current_weather.winddirection,
                weathercode: data.current_weather.weathercode,
                time: data.current_weather.time,
                precipitation: data.daily?.precipitation_sum?.[0] || 0
            };
        })
        .catch(err => {
            console.error("Hava durumu alınamadı:", err);
            return null;
        });
}

export function GetWeatherHistory(lat, lng) {
    return fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m&past_days=1&timezone=auto`
    ).then(r => r.json());
}