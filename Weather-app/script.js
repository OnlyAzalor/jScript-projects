document.getElementById("getWeather").addEventListener("click", function () {
    const city = document.getElementById("cityInput").value;
    if (city) {
        getWeatherData(city);
    } else {
        alert("Please enter a city name.");
    }
});

async function getWeatherData(city) {
    try {
        const apiKey = "1584c4965b696317539b21e86badfab3";
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("City not found.");
        }

        const data = await response.json();
        console.log("Weather data:", data);

        const state = data.weather[0].main;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        const description = data.weather[0].description;
        const temp = data.main.temp;
        const humidity = data.main.humidity;

        document.getElementById("result").innerHTML = `
        <img src="${iconUrl}" class="weather-icon" alt="weather icon">
        Weather in ${city}: <br>
        <strong>${state} (${description})</strong> <br>
        Temperature: ${temp.toFixed(1)}°C <br>
        Humidity: ${humidity}%`;
    } catch (error) {
        document.getElementById("result").innerText =
            "Error fetching weather data. " + error.message;
        console.error(error);
    }
}
