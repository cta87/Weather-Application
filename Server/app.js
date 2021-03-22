const UTIL = require("./utilities");

// ===== Variable Declaration =====

// == APIs ==
const apiChchCurrent = "http://api.openweathermap.org/data/2.5/weather?q=Christchurch,nz&units=metric&APPID=";

// ===== Class Constructors ======

let CityCurrent = function(locationQuery, apikey){
    // ===== Properties =====
    this.location = locationQuery;
    this.apiKey = apikey;
    this.updateInterval = 300000;

    let my = this;

    // == APIs ==
    this.apiCurrentWeather = "http://api.openweathermap.org/data/2.5/weather?q=" + this.location + "&units=metric&APPID=" + this.apiKey;

    // == Data Storage ==
    this.dataCurrentWeather = null;
    this.dataTempHistory = [];

    // ===== Methods =====

    this.updateCurrent = async function(){
        this.dataCurrentWeather = await UTIL.getData(this.apiCurrentWeather);
    };

    // Function gets the latest data
    this.returnCurrentJson = async function(){
        await this.updateCurrent();
        return  this.dataCurrentWeather;
    };

    this.returnTemp = async function(){
        await this.updateCurrent();
        return this.dataCurrentWeather.main.temp;
    };

    // == Interval Methods ==

    // setInterval(async function(){
    //     console.log("Updating weather Data");
    //     await my.updateCurrent();
    //     let currentTemp = my.dataCurrentWeather.main.temp;
    //     my.dataTempHistory.push(currentTemp);
    //     console.log("Current temp, " + my.location + ": " + currentTemp);
    //     console.log(my.dataTempHistory);
    //     }, this.updateInterval);


}; // End of city Current Class

let EventClass = function(hour, minute, dayArray, smartState, maxTemp, description, weatherObject){
    // ===== Properties =====
    this.minute = minute;
    this.hour = hour;
    this.dayArray = dayArray;
    this.maxTemp = maxTemp;
    this.description = description;

    this.eventLog = [];

    let my = this;

    // ===== Methods =====

    this.action = function(){
        this.createLog( "Running Action function for: " + this.description);

        //check outlet state if current state matches the setstate value then do nothign

        // If no match then change outlet state
    };

    this.createLog = function(message){
        let time = getTime();
        let log = time.day + " " + time.hour + ":" + time.minute + ": " + message;
        this.eventLog.push(log);
        console.log(log);
    };

    // == Interval Methods ==

    // Below function runs every minute and checks to see if time settings match current time
    setInterval(async function(){
        console.log("\n == Checking event criteria for: " + my.description + "==");
        let currentTime = getTime();

        // Match day
        const found = my.dayArray.find(element => element === currentTime.day);
        if(!found){
            console.log("No day match found!");
            return
        }

        // == Match Hour ==

        // if hour properties is a single number match that number to current time
        if(typeof my.hour === "number"){
            if(my.hour !== currentTime.hour && my.hour !== null){
                console.log("No hour match found!");
                return
            } // End of if
        } else if(typeof my.hour === "object"){  // if hour properties is an arrary search that array for the current time
            const found = my.hour.find(element => element === currentTime.hour);
            if(!found){
                console.log("No hour match found in array!");
                return
            }
        }


        // == Match minute ==
        if(my.minute !== currentTime.minute && my.minute !== null){
            console.log("No minute match found!");
            return
        }

        //  == Match Temp ==
        if(await weatherObject.returnTemp() > my.maxTemp && my.maxTemp !== null){
            console.log("Current temp exheeds max temp!");
            return
        }

        //  == Run action == (this is run if all checks pass, if a check fails the function is ended)
        my.action();


    }, 60000);


}; //End of Eventclass

// ===== Other Functions ======

//FUNCTION, Returns: Literal object containing hour,minute,day of week
let getTime = function(){
    let date = new Date();
    return {hour: date.getHours(), minute: date.getMinutes(), day: getDayOfTheWeek()};
};

//FUNCTION, Returns: Day of the week string
let getDayOfTheWeek = function(){
    let date = new Date();
    switch(date.getDay()){
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 60:
            return "Saturday";
    }
};


// ===== Run Code ======


(async function(){

    let christchurch = new CityCurrent("Christchurch,nz", "");

    // Null means any value, if anyday all days need to be included in day array
    let eventTest = new EventClass(13, 45, ["Monday", "Tuesday"], "off", 20, "Testing:", christchurch);

    // event to turn heater on at 9PM if temp below 15 Degrees
    let eventPowerHourStart = new EventClass(21, 0, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "on", 15, "Hour of Power start:", christchurch);

    // Event to turn heater off at 10PM
    let eventPowerHourEnd = new EventClass(22, 0, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "off", null, "Hour of Power Finish:", christchurch);

    // Event to turn heater on at 6.30AM if temp below 15 Degrees
    let eventWakeupStart = new EventClass(6, 30, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "on", 15, "Weekday Wakeup Heater on:", christchurch);

    // Event to turn heater off at 730AM
    let eventWakeupEnd = new EventClass(7, 30, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "off", null, "Weekday Wakeup  Heater off:", christchurch);

    // Event to turn heater on during weekday if temp below 8 Degrees between times of 8AM - 5PM
    let eventDaytimeTempOn = new EventClass([8, 9, 10, 11, 12, 13, 14, 15, 16, 17], null, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "on", 19, "Weekday temp check, Boden:", christchurch);

    // Event to trun heater off during weekday if temp goes above 8 degrees between times of 8AM - 5PM todo Figure out how to set a minimum temp
    // let eventDaytimeTempOff = new EventClass([8, 9, 10, 11, 12, 13, 14, 15, 16, 17], null, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "on", 8, "Weekday temp check, Boden:", christchurch);


})();


// ===== Interval functions ======





