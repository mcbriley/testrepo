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
  inquirer
    .prompt([
      {
        name: "choice",
        type: "list",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ],
        message: "What action would you like to take?"
      }
    ])
    .then(function(answer) {
      switch (answer.choice) {
        case "View Products for Sale":
          connection.query("SELECT * FROM products", function(err, results) {
            if (err) throw err;
            console.log("\n");
            for (var i = 0; i < results.length; i++) {
              console.log(
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
          });
          setTimeout(function() {
            start();
          }, 500);
          break;

        case "View Low Inventory":
          connection.query(
            "SELECT * FROM products WHERE stock_quantity < 5 ORDER BY item_id",
            function(err, results) {
              if (err) throw err;
              for (var i = 0; i < results.length; i++) {
                console.log(
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
            }
          );
          setTimeout(function() {
            start();
          }, 500);
          break;

        case "Add to Inventory":
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
                  message: "What item would you like to restock?"
                },
                {
                  name: "quantity",
                  type: "input",
                  message: "How many items would you like to add?"
                }
              ])
              .then(function(answer) {
                var chosenID = 1 + choiceArray.indexOf(answer.choice);
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                  if (results[i].item_id === chosenID) {
                    chosenItem = results[i];
                  }
                }
                var newQuantity =
                  parseInt(answer.quantity) +
                  parseInt(chosenItem.stock_quantity);
                connection.query(
                  "UPDATE products SET ? WHERE ?",
                  [
                    {
                      stock_quantity: newQuantity
                    },
                    {
                      item_id: chosenID
                    }
                  ],
                  function(error) {
                    if (error) throw error;
                    console.log(
                      chosenItem.product_name +
                        " now has " +
                        newQuantity +
                        " items in stock."
                    );
                  }
                );
                setTimeout(function() {
                  start();
                }, 500);
              });
          });
          break;

        case "Add New Product":
          var newItem = "";
          var newDepartment = "";
          var newPrice;
          var newQuantity;
          inquirer
            .prompt([
              {
                name: "item",
                type: "input",
                message: "What is the new product's name?"
              },
              {
                name: "department",
                type: "input",
                message: "What department would you like to add the item into?"
              },
              {
                name: "price",
                type: "input",
                message: "What would you like the price of the item to be?"
              },
              {
                name: "quantity",
                type: "input",
                message: "How many items would you like to add to inventory?"
              }
            ])
            .then(function(answer) {
              connection.query(
                "INSERT INTO products SET ?",
                {
                  product_name: answer.item,
                  department_name: answer.department,
                  price: answer.price,
                  stock_quantity: answer.quantity
                },
                function(err) {
                  if (err) throw err;
                  console.log(answer.item + " added to inventory!");
                }
              );
              setTimeout(function() {
                start();
              }, 500);
            });

          break;

        default:
          console.log("There was an error.");
          break;
      }
    });
}
