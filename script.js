document.addEventListener("DOMContentLoaded", function(){
    const userTab = document.querySelector("[data-user-weather]");
    const searchTab = document.querySelector("[data-search-weather]");
    const grantAccess = document.querySelector(".grant-location");
    const searchForm = document.querySelector(".form-container");
    const loadingScreen = document.querySelector(".loading-container");
    const userInfoContainer = document.querySelector(".user-info-container");
    const grantAccessButton = document.querySelector(".grant-location-button");
    const searchInput = document.querySelector("[data-search-input]");
    const searchButton = document.querySelector(".search-button");

    // initial variables
    const API_key = "5dc48ebe53a6985db45d785a31efb547";
    let currTab = userTab;
    currTab.classList.add("curr-tab")
    grantAccess.classList.add("active");

    // render data on screen
    function renderWeatherInfo(data){
        const cityName = document.querySelector("[data-city-name]");
        const countryFlag = document.querySelector("[data-country-flag]");
        const weatherDesc = document.querySelector("[data-weather-description]");
        const weatherIcon = document.querySelector("[data-weather-icon]");
        const temperature = document.querySelector("[data-temperature]");
        const windSpeed = document.querySelector("[data-wind-speed]");
        const humidity = document.querySelector("[data-humidity]");
        const cloud = document.querySelector("[data-clouds]");

        cityName.innerText = data?.name;
        countryFlag.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
        weatherDesc.innerText = data?.weather?.[0]?.description;
        weatherIcon.src = `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
        temperature.innerText = `${data?.main?.temp} °C`;
        windSpeed.innerText = `${data?.wind?.speed}m/s`;
        humidity.innerText = `${data?.main?.humidity}%`;
        cloud.innerText = `${data?.clouds?.all}%`;
        console.log(data);
    }

    // fetch user weather info
    async function fetchUserWeather(coordinates){
        const {latitude, longitude} = coordinates;
        grantAccess.classList.remove("active");
        loadingScreen.classList.add("active");

        try{
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_key}&units=Metric`);
            const data = await response.json();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
        catch(err){
            grantAccess.classList.add("active");
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            alert("Oops! Failed to fetch weather data. Please check your internet connection or try again later.");
            console.error("Error fetching weather data:", err);
        }
    }

    // check if coordinates are already present in session storage
    function getFromSessionStorage(){
        const localCoordinates = sessionStorage.getItem("userCoordinates");
        if(!localCoordinates){
            grantAccess.classList.add("active");
        }
        else{
            const coordinates = JSON.parse(localCoordinates);
            fetchUserWeather(coordinates);
        }
    }

    // switch tab function
    function switchTab(tab){
        if(tab !== currTab){
            currTab.classList.remove("curr-tab");
            currTab = tab;
            currTab.classList.add("curr-tab");

            if(currTab === userTab){
                searchForm.classList.remove("active");
                userInfoContainer.classList.remove("active");
                getFromSessionStorage();
            }
            else{
                grantAccess.classList.remove("active");
                userInfoContainer.classList.remove("active");
                searchForm.classList.add("active");
            }
        }
    }

    userTab.addEventListener("click", ()=>{
        switchTab(userTab);
    });

    searchTab.addEventListener("click", ()=>{
        switchTab(searchTab);
    })

    // get local user coordinates
    function showPosition(position){
        const userCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
    }

    function getLocation(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(showPosition);
            getFromSessionStorage();
        }
        else{
            alert("Your system does not support geolocation services");
        }
    }

    grantAccessButton.addEventListener("click", getLocation);

    // search user input location
    async function searchLocation(city){
        loadingScreen.classList.add("active");
        try{
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.toLowerCase()}&appid=${API_key}&units=Metric`);
            const data = await response.json();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
        catch(err){
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            alert("Oops! Failed to fetch weather data. Please check your internet connection or try again later.");
            console.error("Error fetching weather data:", err);
        }
    }

    searchButton.addEventListener("click", (e)=>{
        e.preventDefault();
        let city = searchInput.value;
        userInfoContainer.classList.remove("active");
        if(city !== ""){
            searchLocation(city);
        } 
    });
});