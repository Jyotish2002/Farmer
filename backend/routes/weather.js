const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Determine whether to require auth for weather (allow public in dev or when PUBLIC_WEATHER=true)
const requireWeatherAuth = (process.env.PUBLIC_WEATHER === 'true') ? ((req, res, next) => next()) : verifyToken;

// Get weather data for a location
router.get('/', requireWeatherAuth, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    if (!process.env.OPENWEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    let url;
    if (lat && lon) {
      // Use coordinates
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else if (city) {
      // Use city name
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Please provide either coordinates (lat, lon) or city name' });
    }

    const response = await axios.get(url);

    // Format the weather data for frontend
    const weatherData = {
      location: {
        name: response.data.name,
        country: response.data.sys.country,
        coordinates: {
          lat: response.data.coord.lat,
          lon: response.data.coord.lon
        }
      },
      weather: {
        main: response.data.weather[0].main,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon
      },
      temperature: {
        current: Math.round(response.data.main.temp),
        feels_like: Math.round(response.data.main.feels_like),
        min: Math.round(response.data.main.temp_min),
        max: Math.round(response.data.main.temp_max)
      },
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      wind: {
        speed: response.data.wind.speed,
        direction: response.data.wind.deg
      },
      visibility: response.data.visibility,
      clouds: response.data.clouds.all,
      timestamp: response.data.dt
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get 5-day weather forecast
router.get('/forecast', requireWeatherAuth, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    if (!process.env.OPENWEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Please provide either coordinates (lat, lon) or city name' });
    }

    const response = await axios.get(url);

    // Group forecast by day and format with enhanced weather data
    const dailyForecast = {};
    
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date: new Date(item.dt * 1000),
          weather: item.weather[0],
          temperature: {
            min: item.main.temp_min,
            max: item.main.temp_max
          },
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          wind: {
            speed: item.wind.speed,
            direction: item.wind.deg || 0
          },
          rain: {
            amount: item.rain ? (item.rain['3h'] || 0) : 0,
            probability: Math.min(100, Math.max(0, item.clouds.all + (item.rain ? 20 : 0)))
          },
          clouds: item.clouds.all
        };
      } else {
        // Update min/max temperatures
        dailyForecast[date].temperature.min = Math.min(dailyForecast[date].temperature.min, item.main.temp_min);
        dailyForecast[date].temperature.max = Math.max(dailyForecast[date].temperature.max, item.main.temp_max);
        
        // Update rain data if this forecast has more rain
        if (item.rain && item.rain['3h'] > dailyForecast[date].rain.amount) {
          dailyForecast[date].rain.amount = item.rain['3h'];
          dailyForecast[date].rain.probability = Math.min(100, Math.max(0, item.clouds.all + 20));
        }
        
        // Update wind if stronger
        if (item.wind.speed > dailyForecast[date].wind.speed) {
          dailyForecast[date].wind.speed = item.wind.speed;
          dailyForecast[date].wind.direction = item.wind.deg || 0;
        }
      }
    });

    // Format the final forecast data
    const formattedForecast = Object.values(dailyForecast)
      .slice(0, 5)
      .map(day => ({
        date: day.date,
        weather: {
          main: day.weather.main,
          description: day.weather.description,
          icon: day.weather.icon
        },
        temperature: {
          min: Math.round(day.temperature.min),
          max: Math.round(day.temperature.max)
        },
        humidity: day.humidity,
        pressure: day.pressure,
        wind: {
          speed: Math.round(day.wind.speed * 10) / 10, // Round to 1 decimal
          direction: day.wind.direction
        },
        rain: {
          amount: Math.round(day.rain.amount * 10) / 10, // Round to 1 decimal
          probability: Math.round(day.rain.probability)
        }
      }));

    res.json({
      location: {
        name: response.data.city.name,
        country: response.data.city.country
      },
      forecast: formattedForecast
    });
  } catch (error) {
    console.error('Weather forecast API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

module.exports = router;