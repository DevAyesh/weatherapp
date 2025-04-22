import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import { WiDaySunny, WiRain, WiStrongWind, WiHumidity } from 'react-icons/wi'
import { getOrCreateVisitorId } from './recentSearches.js'

// Helper to select weather icon
function getWeatherIcon(weatherData) {
  if (!weatherData || !weatherData.weather || !weatherData.weather[0]) return null;
  const main = weatherData.weather[0].main.toLowerCase();
  if (main.includes('cloud')) return <WiDaySunny size={64} style={{ color: '#b0b0b0' }} />;
  if (main.includes('rain')) return <WiRain size={64} style={{ color: '#3498db' }} />;
  if (main.includes('clear')) return <WiDaySunny size={64} style={{ color: '#ffe066' }} />;
  if (main.includes('snow')) return <WiDaySunny size={64} style={{ color: '#b3e5fc' }} />;
  // Add more as needed
  return <WiDaySunny size={64} />;
}

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null)
  const [forecastData, setForecastData] = useState([])
  const [city, setCity] = useState('')
  const [unit, setUnit] = useState('metric')
  const [day, setDay] = useState('')
  const [recentSearches, setRecentSearches] = useState([])

  // No initial fetch on mount. Only fetch after search.

  const fetchWeather = async () => {
    try {
      // Current weather
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${import.meta.env.VITE_Open_Weather_API}`
      )
      setWeatherData(weatherRes.data)

      // Forecast (next 4 days, noon)
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${import.meta.env.VITE_Open_Weather_API}`
      )
      // Group by day, pick noon
      const daily = []
      const seen = {}
      forecastRes.data.list.forEach(item => {
        const date = new Date(item.dt * 1000)
        const dayStr = date.toLocaleDateString(undefined, { weekday: 'long' })
        if (!seen[dayStr] && date.getHours() === 12 && daily.length < 4) {
          daily.push({
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            day: dayStr,
            dt: item.dt
          })
          seen[dayStr] = true
        }
      })
      setForecastData(daily)
      setDay(new Date(weatherRes.data.dt * 1000).toLocaleDateString(undefined, { weekday: 'long' }))

      // --- Anonymous Search History ---
      const visitorId = getOrCreateVisitorId();
      // Save search to backend
      await axios.post('http://localhost:4000/api/search', {
        visitorId,
        city,
        lat: weatherRes.data.coord.lat,
        lon: weatherRes.data.coord.lon,
        weather: {
          temp: weatherRes.data.main.temp,
          main: weatherRes.data.weather[0].main,
          description: weatherRes.data.weather[0].description
        },
        time: new Date().toISOString()
      });
      // Fetch recent searches
      fetchRecentSearches(visitorId);
      // --- End Anonymous Search History ---
    } catch (error) {
      setWeatherData(null)
      setForecastData([])
      alert('Could not fetch weather data. Try another city.')
    }
  }

  const handleCityChange = (e) => setCity(e.target.value)
  const handleUnitChange = (e) => setUnit(e.target.value)
  const handleSearch = () => {
  if (city.trim() !== '') fetchWeather()
}

// Fetch recent searches for visitor
const fetchRecentSearches = async (visitorId) => {
  try {
    const res = await axios.get(`http://localhost:4000/api/searches/${visitorId}`);
    setRecentSearches(res.data);
  } catch (e) {
    setRecentSearches([]);
  }
}

// On mount, fetch recent if visitorId exists
useEffect(() => {
  const visitorId = localStorage.getItem('visitorId');
  if (visitorId) fetchRecentSearches(visitorId);
}, []);

  return (
    <div className="weather-frame">
      <div className="weather-main">
        <div className="weather-header">
          <span>Right now in,</span>
          <input className="city-input" value={city} onChange={handleCityChange} placeholder="Enter city name" />
          <button className="search-btn" onClick={handleSearch}>🔍</button>
        </div>
        {/* Recent Searches UI */}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <strong>Recent Searches:</strong>
            <ul>
              {recentSearches.map((s, idx) => (
                <li key={idx}>
                  {s.city} ({s.weather.main}, {Math.round(s.weather.temp)}°)
                  <span style={{fontSize: '0.8em', color: '#888', marginLeft: 8}}>{new Date(s.time).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="privacy-note">No login required. No personal data stored.</div>
          </div>
        )}
        {weatherData ? (
          <>
            <div className="weather-center">
              <div className="weather-icon">{getWeatherIcon(weatherData)}</div>
              <div className="weather-temp">
                <span className="temp-main">{Math.round(weatherData.main.temp)}</span>
                <span className="temp-unit">°{unit === 'metric' ? 'C' : 'F'}</span>
                <div className="temp-range">{weatherData.main.temp_min} / {weatherData.main.temp_max}</div>
                <div className="weather-day">{day}</div>
              </div>
              <div className="weather-details">
                <div className="weather-detail"><WiStrongWind size={28} /> {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mp/h'}</div>
                <div className="weather-detail"><WiHumidity size={28} /> {weatherData.main.humidity}%</div>
                <div className="weather-detail"><WiRain size={28} /> {weatherData.rain ? weatherData.rain['1h'] : 0}%</div>
              </div>
            </div>
            <div className="forecast-row">
              {forecastData.map((f, i) => (
                <div className="forecast-card" key={i}>
                  <div className="forecast-range">{f.temp_min} / {f.temp_max}</div>
                  <div className="forecast-day">{f.day}</div>
                </div>
              ))}
            </div>
            <button className="unit-toggle" onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}>
              °{unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
            </button>
          </>
        ) : (
          <div className="no-data-message">Please search for a city to see weather information.</div>
        )}
      </div>
    </div>
  )
}

export default WeatherApp
