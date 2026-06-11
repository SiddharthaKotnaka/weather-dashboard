const apiKey = "022c6252988856c2fc2bc1bffd7f9ee4";

let chart;

let forecastData;

const searchBtn = document.getElementById("searchBtn");

const locationBtn = document.getElementById("locationBtn");

searchBtn.addEventListener("click", () => {
    const city = document.getElementById("cityInput").value;

    if(city === ""){
        alert("Please enter a city name");
        return;
    }

    getWeather(city);

    localStorage.setItem("lastCity", city);
});

async function getWeather(city){

    document.getElementById("loading").style.display = "block";

    const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try{

        const response = await fetch(url);
        const data = await response.json();

        if(data.cod != 200){
            alert("City not found");
            return;
        }

        displayWeather(data);
        saveSearchHistory(city);
        getForecast(city);

        document.getElementById("loading").style.display = "none";

    } catch(error){

        document.getElementById("loading").style.display = "none";

        console.log(error);
        alert("Something went wrong");
    }
}

locationBtn.addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const url =
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            const response = await fetch(url);
            const data = await response.json();

            displayWeather(data);
            getForecast(data.name);

        },

        () => {
            alert("Location access denied");
        }
    );

});

function displayWeather(data){

    document.getElementById("cityName").innerText =
    data.name;

    document.getElementById("temperature").innerText =
    `${data.main.temp}°C`;

    document.getElementById("description").innerText =
    data.weather[0].description;

    document.getElementById("humidity").innerText =
    data.main.humidity;

    document.getElementById("wind").innerText =
    data.wind.speed;

    document.getElementById("analyticsFeels")
    .innerText =
    Math.round(data.main.feels_like) + "°C";

    document.getElementById("analyticsHumidity")
    .innerText =
    data.main.humidity + "%";

    document.getElementById("analyticsWind")
    .innerText =
    data.wind.speed + " km/h";

    document.getElementById("pressure")
    .innerText =
    data.main.pressure + " hPa";

    document.getElementById("visibility")
    .innerText =
    (data.visibility / 1000) + " km";

    document.getElementById("sunrise")
    .innerText =
    new Date(
    data.sys.sunrise * 1000
    ).toLocaleTimeString();

    document.getElementById("sunset")
    .innerText =
    new Date(
    data.sys.sunset * 1000
    ).toLocaleTimeString();

    document.getElementById("weatherIcon").src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const weather = data.weather[0].main;

    const bg =
    document.getElementById(
    "weatherBackground"
    );

    document.getElementById("weatherTitle")
    .innerText =
    data.weather[0].description;

    if(weather === "Clear"){

        bg.style.backgroundImage =
        "url('images/clear.jpg')";
    }

    else if(weather === "Clouds"){

        bg.style.backgroundImage =
        "url('images/clouds.jpg')";
    }

    else if(weather === "Rain"){

        bg.style.backgroundImage =
        "url('images/rain.jpg')";
    }

    else if(weather === "Thunderstorm"){

        bg.style.backgroundImage =
        "url('images/storm.jpg')";
    }

    else if(weather === "Snow"){

        bg.style.backgroundImage =
        "url('images/snow.jpg')";
    }

    const now = new Date();

    document.getElementById("dateTime").innerText =
    now.toLocaleString();
}

async function getForecast(city){

    const url =
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    forecastData = data;

    const forecastDiv =
    document.getElementById("forecast");

    forecastDiv.innerHTML = "";

    const labels = [];
    const temps = [];

    for(let i=0; i<data.list.length; i+=8){

        const day = data.list[i];

        labels.push(
            new Date(day.dt_txt)
            .toLocaleDateString()
        );

        temps.push(
            Math.round(day.main.temp)
        );

        forecastDiv.innerHTML += `
        <div
        class="forecast-card"
        onclick="showForecastDay(${i})">

        <p>${new Date(day.dt_txt).toLocaleDateString()}</p>

        <img
        src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">

        <p>${Math.round(day.main.temp)}°C</p>

        </div>
        `;
    }

    if(chart){
        chart.destroy();
    }

    const ctx =
    document
    .getElementById("tempChart")
    .getContext("2d");

    chart = new Chart(ctx,{
        type:"line",

        data:{
            labels:labels,

            datasets:[{
            label:"Hourly Temperature",
            data:temps,

            borderColor:"#00E5FF",
            backgroundColor:"rgba(0,229,255,0.2)",

            pointBackgroundColor:"#FFD60A",
            pointBorderColor:"#ffffff",

            pointRadius:6,

            borderWidth:4,
            tension:0.4,

            fill:true
        }]
        },

        options:{

            responsive:true,

            plugins:{
                legend:{
                    labels:{
                        color:"#ffffff"
                    }
                }
            },

            scales:{

                x:{
                    ticks:{
                        color:"#ffffff"
                    },
                    grid:{
                        color:"rgba(255,255,255,0.15)"
                    }
                },

                y:{
                    ticks:{
                        color:"#ffffff"
                    },
                    grid:{
                        color:"rgba(255,255,255,0.15)"
                    }
                }

            }
        }
    });

    showForecastDay(0);
}

const toggleTheme =
document.getElementById("toggleTheme");

toggleTheme.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark-mode")
    );

});

window.onload = () => {

    if(
    localStorage.getItem("theme")
    === "true"
    ){
        document.body.classList.add("dark-mode");
    }

    const city =
    localStorage.getItem("lastCity");

    if(city){
        getWeather(city);
    }

    loadCityWidgets();

};

setInterval(() => {

    const now = new Date();

    document.getElementById("dateTime")
    .innerText =
    now.toLocaleString();

},1000);

function showDayDetails(
temp,
feels,
humidity,
wind,
condition,
date
){

    document.getElementById("detailDate")
    .innerText = date;

    document.getElementById("detailTemp")
    .innerText =
    Math.round(temp) + "°C";

    document.getElementById("detailCondition")
    .innerText =
    condition;
}

function showForecastDay(startIndex){

    const day =
    forecastData.list[startIndex];

    showDayDetails(
        day.main.temp,
        day.main.feels_like,
        day.main.humidity,
        day.wind.speed,
        day.weather[0].description,
        new Date(day.dt_txt)
        .toLocaleDateString()
    );

    updateDayChart(startIndex);

}

function updateDayChart(startIndex){

    const labels = [];
    const temps = [];

    for(let i=startIndex;
        i<startIndex+8 &&
        i<forecastData.list.length;
        i++){

        labels.push(
            forecastData.list[i]
            .dt_txt
            .split(" ")[1]
            .slice(0,5)
        );

        temps.push(
            Math.round(
                forecastData.list[i]
                .main.temp
            )
        );
    }

    chart.destroy();

    const ctx =
    document
    .getElementById("tempChart")
    .getContext("2d");

    chart = new Chart(ctx,{

        type:"line",

        data:{
            labels:labels,

            datasets:[{
                label:"Hourly Temperature",
                data:temps,
                borderWidth:3,
                tension:0.4
            }]
        },

        options:{
            responsive:true
        }
    });
}

async function loadCityWidgets(){

    const cities = [
        "Hyderabad",
        "Delhi",
        "Mumbai",
        "London",
        "New York"
    ];

    const container =
    document.getElementById("cityWidgets");

    container.innerHTML = "";

    for(const city of cities){

        const response =
        await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        const data =
        await response.json();

        container.innerHTML += `
        <div
        class="city-widget"
        onclick="getWeather('${city}')">

            <h4>${city}</h4>

            <p>
            ${Math.round(data.main.temp)}°C
            </p>

            <p>
            ${data.weather[0].description}
            </p>

        </div>
        `;
    }
}

const settingsBtn =
document.getElementById("settingsBtn");

const settingsMenu =
document.getElementById("settingsMenu");

settingsBtn.addEventListener("click", () => {

    if(settingsMenu.style.display === "none"){

        settingsMenu.style.display = "block";

    }else{

        settingsMenu.style.display = "none";

    }

});

const autoLocation =
document.getElementById("autoLocation");

autoLocation.addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(

        async(position)=>{

            const lat =
            position.coords.latitude;

            const lon =
            position.coords.longitude;

            const url =
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            const response =
            await fetch(url);

            const data =
            await response.json();

            displayWeather(data);

            getForecast(data.name);

        }

    );

});

function saveSearchHistory(city){

    let history =
    JSON.parse(
        localStorage.getItem(
            "history"
        )
    ) || [];

    if(!history.includes(city)){

        history.unshift(city);

        history =
        history.slice(0,10);
    }

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );
}

const historyBtn =
document.getElementById(
"searchHistoryBtn"
);

historyBtn.addEventListener(
"click",
showHistory
);

function showHistory(){

    const history =
    JSON.parse(
        localStorage.getItem(
            "history"
        )
    ) || [];

    let text =
    "Recent Searches:\n\n";

    history.forEach(city=>{

        text += city + "\n";

    });

    alert(text);
}

const menuBtn =
document.getElementById("menuBtn");

const sidebar =
document.querySelector(".sidebar");

menuBtn.addEventListener("click",()=>{

    sidebar.classList.toggle("active");

});

document
.querySelectorAll(".sidebar li")
.forEach(item=>{

    item.addEventListener("click",()=>{

        if(window.innerWidth < 768){

            sidebar.classList.remove("active");

        }

    });

});

document.addEventListener("click",(e)=>{

    if(
        window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ){

        sidebar.classList.remove("active");

    }

});