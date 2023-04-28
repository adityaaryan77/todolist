const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<-- Hit this to delete a item",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = new mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  const day = date.getDate();
  Item.find().then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then();
      res.redirect("/");
    } else {
      res.render("lists", { listTitle: day, newItems: foundItems });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then((foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("lists", {
        listTitle: foundList.name,
        newItems: foundList.items,
      });
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName,
  });
  if (date.isDate(listName)) {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkFormId = req.body.checkbox;
  const listName = req.body.listTitle;
  if (date.isDate(listName)) {
    Item.findByIdAndRemove(checkFormId).then();
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkFormId } } }
    ).then();
    res.redirect("/" + listName);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
