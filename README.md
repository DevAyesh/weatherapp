# Weather App

This is a straightforward weather application that lets you check the current weather and forecast for any city. Your recent searches are saved anonymously (no login required) and stored in MongoDB Atlas. The app uses the OpenWeatherMap API for weather data.

## Features
- Search weather by city name
- See a 5-day forecast
- Anonymous, device-based search history
- Clean, mobile-friendly interface

## Quick Start

### Requirements
- Node.js 20 or newer
- npm
- MongoDB Atlas connection string (or use local MongoDB)
- OpenWeatherMap API key

### Local Setup
1. Clone this repo:
   ```sh
   git clone <your-repo-url>
   cd weatherapp
   ```
2. Add a `.env` file in the root:
   ```env
   MONGODB_URI=your-mongodb-uri
   PORT=4000
   VITE_Open_Weather_API=your-openweathermap-api-key
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Build the frontend:
   ```sh
   npm run build
   ```
5. Start the backend (serves both API & frontend):
   ```sh
   node server.js
   ```
   Visit [http://localhost:4000](http://localhost:4000)

### Using Docker
Build and run the app in a container:
```sh
docker build -t weather-app .
docker run -d -p 4000:4000 weather-app
```

### CI/CD
- GitHub Actions handle building, linting, testing, and Docker image pushes.

