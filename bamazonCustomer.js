var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

function start() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    var choiceArray = [];
    for (var i = 0; i < results.length; i++) {
      choiceArray.push(
        "ID: " +
          results[i].item_id +
          " | Product: " +
          results[i].product_name +
          " | Price: $" +
          results[i].price +
          " | Quantity: " +
          results[i].stock_quantity
      );
    }
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: choiceArray,
          message: "What item would you like to purchase?"
        },
        {
          name: "quantity",
          type: "input",
          message: "What quantity would you like to purchase?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenID = 1 + choiceArray.indexOf(answer.choice);
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_id === chosenID) {
            chosenItem = results[i];
          }
        }
        if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
          var update_quantity = chosenItem.stock_quantity - answer.quantity;
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: update_quantity
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw error;
              var totalCost = answer.quantity * chosenItem.price;
              console.log("Purchase made successfully!");
              console.log("Your total is: $" + totalCost);
              start();
            }
          );
        } else {
          console.log("Not enough stock remaining to complete purchase.");
          start();
        }
      });
  });
}
