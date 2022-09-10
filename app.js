const request = require("request");
const express = require("express");
const { callbackify } = require("util");
const hbs = require("hbs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const publicDirectoryPath = path.join(__dirname, "./public");
const viewsPath = path.join(__dirname, "./templates/views");
const partialsPath = path.join(__dirname, "./templates/partials");

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath)

app.use(express.static(publicDirectoryPath));
app.use(bodyParser.urlencoded());

const timeZoneUrl = "http://worldtimeapi.org/api/timezone";

app.get("", async (req, res) => {
    request({url: timeZoneUrl, json: true}, (error, {body}) => {
        res.render("index.hbs", {result: body});
    })

})

app.post("/time", async (req, res) => {
    const region = req.body.region;
    const type = req.body.type;
    const timeUrl = "http://worldtimeapi.org/api/timezone/" + region;
    request({url: timeUrl, json: true}, (error, {body}) => {
        const time = body.datetime;
        const date = time.split("T")[0];
        const timeParsed = time.split("T")[1];
        const timeParsed2 = timeParsed.split("+")[0];
        const hoursMinutes = timeParsed2.split(":")[0] + ":" + timeParsed2.split(":")[1];
        let hours = hoursMinutes.split(":")[0];
        let sense = "";
        let finalTime = "";
        const second = timeParsed2.split(":")[2];
        const secondInt = parseInt(second);
        let finalSecond = secondInt.toString();
        if (finalSecond.length < 2){
            finalSecond = "0" + finalSecond;
        }

        if (type == "12"){
            if (hours > 12){
                hours = hours - 12;
                sense = "P.M.";
                finalTime = hours + ":" + timeParsed2.split(":")[1] + ":" + finalSecond + " " + sense;
            }else {
                sense = "A.M.";
                finalTime = hoursMinutes + ":" + finalSecond + " " + sense;
            }
        }else {
            finalTime = hoursMinutes + ":" + finalSecond;
        }

        res.render("time.hbs", {time: finalTime, date, region});
    })
})

app.listen(3000, () => {
    console.log("Port is up on Local Host 3000");
})

