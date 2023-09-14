//simple crossword puzzle server
//Debashish Buragohain
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3030;
const correctAns = require("./correct_ans").correct;

app.use(express.json());    //use the json parser
app.use(express.static(__dirname + "/public"))
//retrieve the success options dataset
let dataset = fs.readFileSync("./dataset/dataset.json", {
    encoding: 'utf-8',
    flag: 'r'
})
dataset = JSON.parse(dataset);
app.set("view engine", "ejs")
app.engine('html', require('ejs').renderFile);

app.post('/answer', (req, res) => {
    console.log("Received asnwer:", req.body.answer)
    if (req.body.answer == correctAns) {
        res.json({ redirect: correctAns })
    }
    else {
        res.json({ redirect: 'incorrect' })
    }
})

app.post("/winner_submission", (req, res) => {
    const { name, scholarid } = req.body;
    if (!name || !scholarid) {
        res.json({ error: 'Invalid name or scholar id.' })
    }
    else if (scholarid.length !== 7) {
        res.json({ error: 'Invalid scholar id.' })
    }
    else {
        let matched = false;
        for (let i = 0; i < dataset.length; i++) {
            if (scholarid == dataset[i].scholarid) {
                matched = true;
                break;
            }
        }
        if (matched) {
            res.json({ error: 'Scholar id already registered.' })
        }
        else {
            //save the new person in the dataset
            dataset.push({ name, scholarid, time: new Date().toLocaleString() })
            fs.writeFileSync("./dataset/dataset.json", JSON.stringify(dataset), { encoding: 'utf-8' })
            res.json({
                name: name,
                scholarid: scholarid
            })
        }
    }
})

//option to get the leaderboards
app.get(`/${correctAns}_winners`, (req, res) => {
    res.render("leaderboards");
})

//post method to get the winners
app.post("/get-winners", (req, res) => {
    res.json(dataset);
})

//crossword answer
app.get(`/${correctAns}`, (req, res) => {
    res.render("correct");
})

app.use("/incorrect", (req, res) => {
    res.render("incorrect");
})

app.use((req, res) => {
    res.status(404).send("The URL you entered must be invalid.");
})

app.listen(port, (err) => {
    if (err) console.error("Error starting server:", err)
    else console.log("Crossword server listening at port", port);
})
