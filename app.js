const express = require("express")
const axios = require("axios")

const app = express()

app.set('trust proxy', true);

const PORT = process.env.PORT || 5000



app.get('/api/hello', async (req, res)=>{
    const visitorName = req.query.visitor_name;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (ip.startsWith('::ffff:')) {
      ip = ip.split(':').pop();
    }

    const geoApiUrl = `http://ip-api.com/json/${ip}`

    const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    const weatherApiKey = '3801e448da91ab5a9000a512105acef4'

    try {
        const response = await axios.get(geoApiUrl)
        const locationData = response.data

        if(locationData.status === 'success'){
            const { lat, lon, city, country } = locationData;

             // Get weather data based on latitude and longitude
            const weatherResponse = await axios.get(`${weatherApiUrl}`, {
                params: {
                lat: lat,
                lon: lon,
                appid: weatherApiKey,
                units: 'metric'  // For temperature in Celsius
                }
            });

            const weatherData = weatherResponse.data;
            const temperature = weatherData.main.temp;

            const data = {
                "client_ip": `${ip}`, // The IP address of the requester
                "location": `${country}`, // The city of the requester
                "greeting": `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celcius in ${country}`
              }
            res.status(200).json(data)
        }else{
            res.status(500).json({ error: `Failed to get location ${ip}` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

    
})

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})