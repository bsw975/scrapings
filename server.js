const l = console.log;
const express = require("express");
const PORT = 3000;

const bodyParser = require("body-parser");
const logger = require("morgan");

const mongoose = require("mongoose");

const db = require("./models");

const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(logger("dev"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost/hw9Scraper");

app.get("/scrapings", (req, res) => {
    for (let i = 2; i < 4; i++) {
        let URL = "https://www.fullstackacademy.com/student-gallery/page/" + i;
        axios.get(URL).then(function (response) {
            var $ = cheerio.load(response.data);
            $("article").each(function (i, element) {
                let content = {};
                content.title = $(this)
                    .children("div")
                    .children("h3")
                    .text() + "...from Full Stack Academy"
                content.desc = $(this)
                    .children("div")
                    .children("p")
                    .text().trim();
                content.link = $(this)
                    .children("div")
                    .children("a")
                    .attr("href");
                l(content);
                db.Article.create(content)
                    .then(dbArticle => l(dbArticle))
                    .catch(err => res.json(err));
            }); //end article grab
        }); //end axios get
    }; //end for loop
});

app.get("/articles", (req, res) => {
    db.Article.find()
    .then(dbArticles => {
        l("SQL returned " + dbArticles);
        res.json(dbArticles)
    })
    .catch(err => res.json(err));
       // If an error occurs, send the error back to the client
});

app.get("/articles/:id", (req,res) => {
    db.Article.findOne({"_id": req.params.id})
    .populate("note")
    .then(dbArticle => res.json(dbArticle))
    .catch(err => res.json(err));
});

app.post("/articles/:id", (req,res) => {
    db.Note.create(req.body)
    .then(dbNote => {
        return db.Article.findOneAndUpdate({
            _id: req.params.id }, {
                note: dbNote._id}, {
                    new: true
                });
        })
        .then(dbArticle => res.json(dbArticle))
        .catch(err => res.json(err));
    });

app.listen(PORT, () => l("Listening on port " + PORT));
