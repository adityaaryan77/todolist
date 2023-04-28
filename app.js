const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", (req, res) => {
  const day = date.getDate();
  res.render("lists", { listTitle: day, newItems: items });
});

app.get("/works", (req, res) => {
  res.render("lists", { listTitle: "Work List", newItems: workItems });
});

app.post("/", (req, res) => {
  const newItem = req.body.newItem;
  if (req.body.list === "Work") {
    workItems.push(newItem);
    res.redirect("/works");
  } else {
    items.push(newItem);
    res.redirect("/");
  }
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
