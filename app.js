//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require( "mongoose" );
const _ = require( "lodash" );

const app = express();

app.set('view engine', 'ejs');

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use(express.static("public"));

//mongoose.connect( "mongodb://localhost:27017/todolistDB", { useNewUrlParser: true } );
mongoose.connect( "mongodb+srv://admin-lb:test123@cluster0.zpwvx.mongodb.net/todolistDB", { useNewUrlParser: true } );
const itemsSchema = {
  name : String
};

const Item = mongoose.model( "Item", itemsSchema );
const item1 = new Item( {
  name: "Buy Food"
} );
const item2 = new Item( {
  name: "Cook Food"
} );
const item3 = new Item( {
  name: "Eat Food"
} );

const defaultItems = [ item1, item2, item3 ];

const listSchema = {
    name: String,
    items: [ itemsSchema ]
};

const List = mongoose.model( "List", listSchema );

Item.insertMany( defaultItems, function(err) {
  if ( err ) {
    console.log( err );
  }
});

app.get("/", function(req, res) {

  Item.find( {}, function( err, result ) {
      console.log( result );
      if ( err ) {
        console.log( err );
      }
      else if ( result.length === 0 ) {
        Item.insertMany( defaultItems, function(err) {       
        });
      }
      res.render("list", {listTitle: "Today", newListItems: result});
  } );

 } );

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item( {
    name: itemName
  } );

  if ( listName === "Today" ) {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne( { name: listName }, function( err, foundList ) {
        if ( !err ) {
          foundList.items.push( item );
          foundList.save();
          res.redirect( "/" + listName )
        }
        else {
          console.log( err );
        }
    } )
  }

});

app.post("/delete", function(req, res) {
    
    const itemId = req.body.checkbox
    const listName = req.body.listName

    console.log( itemId )

    if ( listName === "Today" ) {
        Item.findByIdAndRemove( itemId, function(err) {
            if (err) {
                console.log( err )
            }
            else {
              res.redirect("/");
            }
        })
    }
    else {
        List.findOneAndUpdate( 
                      { name: listName }, 
                      { $pull: { items: { _id: itemId } } }, 
                      function( err, foundList ) {
                          if ( !err ) {
                            res.redirect( "/" + listName )
                          }
                      } )
    }
} )

app.get( "/:customListName", function( req, res ) {
    const customListName = _.capitalize( req.params.customListName )  
    console.log(req.params)

    List.findOne( { name: customListName }, function( err, foundList ) {
        console.log( foundList )
        if  ( !err ) {
            if ( !foundList )  {
              const list = new List( {
                  name: customListName,
                  items: defaultItems
              } );
              list.save();
              res.redirect( "/" + customListName )
            }
            else {
              res.render("list", {  listTitle: foundList.name, 
                                    newListItems: foundList.items } );
            }
        }
    } )
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
