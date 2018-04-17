const inquirer = require("inquirer");
const mysql = require("mysql");

//create the connection
const connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	//username
	user: "root",
	password: "baseball",
	database: "bamazon" 
});
//checking for error
connection.connect(function(err){
	if(!!err)
		throw err;
});

displayMenu(connection);

function displayMenu(connection){
	//ask the manager what they want to do
	inquirer.prompt([
		{
			type: "list",
			message: "Select Action:",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Products", "Exit"],
			name: "choice"
		}
		]).then(function(action){
			if(action.choice === "View Products for Sale"){
				//display items and reprompt
				displayItems(connection, false);
			}
			else if(action.choice === "View Low Inventory"){
				displayItems(connection, true);

			}
			else if(action.choice === "Add to Inventory"){
				//prompt the manager to add more of any existing item in the store
				inquirer.prompt([
				{
					message: "Enter the Product ID that you would like to Add Quantity",
					name: "id"
				},
				{
					message: "Enter Quantity (Default is 1)",
					name: "amount"
				}]).then(function(info){
					var amount = 0;
					if(info.amount < 1)
						amount = 1;
					else
						amount = info.amount;
					console.log("amount: " + amount);
					addQuantity(connection, parseInt(info.id), parseInt(amount));
				});
			}
			else if(action.choice === "Add New Products"){
				//prompt the manager to add more of any existing item in the store
				inquirer.prompt([
				{
					message: "Enter the Product Name to Add",
					name: "product_name"
				},
				{
					message: "Enter the Department Name to which the Product belongs",
					name: "deparment_name"
				},
				{
					message: "Enter the Price of the new Item",
					name: "price"
				},
				{
					message: "Enter the amount of the Item",
					name: "stock_quantity"
				}]).then(function(info){
					
					addItem(connection, info.product_name, info.deparment_name, parseInt(info.price), parseInt(info.stock_quantity));
				});

			}
			else if(action.choice === "Exit"){
				connection.end();
			}
		});
}

function addItem(connection, p_name, d_name, pric, quantity){
	connection.query("INSERT INTO products SET ?",{
			product_name: p_name,
			deparment_name: d_name,
			price: pric,
			stock_quantity: quantity
		}, 
		function(err, res){
			if(!!err)
				throw err;
			displayItems(connection, false);

		});
}

function displayItems(connection, viewLow){
	if(viewLow === true){
		//only show inventory of those that have a quantity lower than 5 items
		connection.query("SELECT * FROM products", (err, res) =>{
			if(!!err)
				throw err;
			//go through the array for pretty print
			for(var i = 0; i < res.length; i++){
				if(res[i].stock_quantity < 5){
					console.log(
	            	"Item ID: " + res[i].item_id + " || Product: " + res[i].product_name +" || Department Name: " + res[i].deparment_name +
	              " || Price: " +
	              res[i].price +
	              " || Quantity: " +
	              res[i].stock_quantity);
				}
			}
			//prompt the user
			displayMenu(connection);
		});
	}
	//just show the regular amount of items
	else{
		connection.query("SELECT * FROM products", (err, res) =>{
			if(!!err)
				throw err;
			//go through the array for pretty print
			for(var i = 0; i < res.length; i++){
				console.log(
	            "Item ID: " + res[i].item_id + " || Product: " + res[i].product_name +" || Department Name: " + res[i].deparment_name +
	              " || Price: " +
	              res[i].price +
	              " || Quantity: " +
	              res[i].stock_quantity);
			}
			//prompt the user
			displayMenu(connection);
		});
	}	
}

function addQuantity(connection, id, amount){
	//get the current amount
	var currentAmount = 0;
	connection.query("SELECT stock_quantity FROM products WHERE ?", [{item_id: id}], function(err, res){
		if(!!err)
			throw err;
		console.log(res);
		currentAmount = parseInt(res[0].stock_quantity) + amount;
		console.log(currentAmount);

		//amount now should be the updated value
		connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: currentAmount}, {item_id: id}], function(err, res){
			if(!!err)
				throw err;
			//display the available items
		displayItems(connection, false);
		});

	});
}