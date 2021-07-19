//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDo List!!"
});

const item2 = new Item({
  name: "Hit the + button to add new tasks"
});

const item3 = new Item({
  name: "<~~~~ Hit this to delete finished tasks"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  var today = new Date();
  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  var day = today.toLocaleDateString("en-US", options);

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted Successfully!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { kindOfDay: day, newListItem: foundItems});
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //if the list doesn't exist -> create
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();      }
      else {
        res.render("list", {kindOfDay: foundList.name, newListItem: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res) {
  const newItemName= req.body.newItem;
  const item = new Item({
    name: newItemName
  });
  item.save();
  res.redirect("/")
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  Item.findOneAndDelete({_id: checkedItemId},function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Delete Successfully!");
      res.redirect("/");
    }
   });
});

let port =;
if(port == null || port == ""){
  port = 2309;
}

app.listen(port, function(){
  console.log("Running");
});
