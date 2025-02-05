import API_KEY from './config.js';

// Get weather details
async function getWeather() {
    const apiKey = API_KEY; 
    const city = document.getElementById('city-input').value.trim();

    try {
        let lat, lon;

        if (!city) {
            throw new Error('Please enter a city name');
        }

        const geoResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
        const weatherData = await geoResponse.json();

        if (!weatherData || weatherData.cod !== 200) {
            throw new Error('City not found');
        } else {
            lat = weatherData.coord.lat;
            lon = weatherData.coord.lon;
        }

        // If city is not provided, get user location
        if (!lat || !lon) {
            const location = await getWeatherByLocation();
            lat = location.lat;
            lon = location.lon;
        }

        // Fetch weather details
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const [weatherResponse, airResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(airUrl),
            fetch(forecastUrl)
        ]);

        const weather = await weatherResponse.json();
        const airData = await airResponse.json();
        const forecast = await forecastResponse.json();

        // Call function to display the data
        displayWeather(weather, airData, forecast);

    } catch (error) {
        document.getElementById('weather').innerText = error.message;
    }
}

// Get weather details based on current location
function getWeatherByLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(new Error('Unable to retrieve your location'));
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by your browser'));
        }
    });
}

// Display weather details
function displayWeather(weather, airData, forecast) {
    const city = document.getElementById('city');
    const description = document.getElementById('description');
    const weatherImg = document.getElementById('weather-img-x');
    const temperature = document.getElementById('temp');
    const tempHigh = document.getElementById('temp-high');
    const tempLow = document.getElementById('temp-low');
    const sunUp = document.getElementById('sunrise');
    const sunDown = document.getElementById('sunset');

    // Weather data
    const { country: countryAbbr } = weather.sys;
    const { name: cityName } = weather;
    const { description: weatherDesc, icon: iconCode } = weather.weather[0];
    const { temp, temp_max: highTemp, temp_min: lowTemp } = weather.main;
    const { sunrise, sunset } = weather.sys;

    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherImg.src = iconUrl;
    
    city.innerText = cityName + ", " + countryAbbr;
    description.innerText = weatherDesc;
    temperature.innerText = `${temp} °C`;
    tempHigh.innerText = `${highTemp} °C`;
    tempLow.innerText = `${lowTemp} °C`;
    sunUp.innerText = new Date(sunrise * 1000).toLocaleTimeString();
    sunDown.innerText = new Date(sunset * 1000).toLocaleTimeString();

    // Air quality
    const airQuality = document.getElementById('AQI');
    const air = airData.list[0].main.aqi;

    const airQualityText = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    airQuality.innerText = airQualityText[air - 1] || 'Unknown';

    // Additional data
    const windSpeed = document.getElementById('speed');
    const humidity = document.getElementById('humidity');
    const pressure = document.getElementById('pressure');
    const visibility = document.getElementById('visibility');
    const seaLevel = document.getElementById('sea-level');

    windSpeed.innerText = `${weather.wind.speed} m/s`;
    humidity.innerText = `${weather.main.humidity}%`;
    pressure.innerText = `${weather.main.pressure} hPa`;
    visibility.innerText = `${weather.visibility / 1000} km`;
    seaLevel.innerText = weather.main.sea_level
        ? `${weather.main.sea_level} hPa`
        : 'N/A';

    // Forecast
    const forecastElements = [
        { desc: 'one', index: 0 },
        { desc: 'two', index: 1 },
        { desc: 'three', index: 2 },
        { desc: 'four', index: 3 },
        { desc: 'five', index: 4 },
        { desc: 'six', index: 5 },
        { desc: 'seven', index: 6 }
    ];

    forecastElements.forEach(({ desc, index }) => {
        const weatherDescription = document.getElementById(
            `weather-description-${desc}`
        );
        const weatherTemp = document.getElementById(`temperature-${desc}`);
        const weatherImg = document.getElementById(`weather-img-${desc}`);
        const forecastTime = document.getElementById(`time-${desc}`);

        const forecastData = forecast.list[index];
        if (forecastData) {
            const { description: descText, icon } = forecastData.weather[0];
            const { temp: forecastTemp } = forecastData.main;
            const { dt_txt: forecastTimeText } = forecastData;

            weatherDescription.innerText = descText;
            weatherTemp.innerText = `${forecastTemp} °C`;
            weatherImg.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            forecastTime.innerText = forecastTimeText;
        }
    });
}

// Event listener for the search button
document.getElementById('search-btn').addEventListener('click', getWeather);

// Event listener for the get user location button
document.getElementById('current-location-btn').addEventListener('click', async () => {
    const location = await getWeatherByLocation();
    getWeather(location.lat, location.lon);
});
