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


//should display all items when started
displayItems(connection);

function displayItems(connection){
	
	//
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
		promptUser(connection);
	});
}

function promptUser(connection){
	//ask the user what they want to do
	inquirer.prompt([
		{
			type: "list",
			message: "Select Action:",
			choices: ["Buy an Item", "Exit"],
			name: "choice"
		}
		]).then(function(action){
			if(action.choice === "Buy an Item"){
				//prompt the user to enter the item ID
				inquirer.prompt([
				{
					message: "Enter the Product ID that you would like to purchase.",
					name: "id"
				},
				{
					message: "Enter Quantity (Default is 1)",
					name: "amount"
				}]).then(function(info){
					var amount = 0;
					if(parseInt(info.amount) < 1)
						amount = 1;
					else
						amount = parseInt(info.amount);
					console.log("amount: " + amount);
					buyItem(connection, parseInt(info.id), amount);
				});

			}
			else if(action.choice === "Exit"){
				connection.end();
			}
		});
}

function buyItem(connection, id, amount){
	//check to see if there is enough
	connection.query("SELECT stock_quantity FROM products WHERE ?", [{item_id: id}], function(err, res){
		if(!!err)
			throw err;
		//check to see if there is a sufficient amount of items
		if(amount > res[0].stock_quantity){
			console.log("Insufficient Amount of Selected Item!");
			promptUser(connection);
		}
		else{
			//update the database
			const amount2 = res[0].stock_quantity - amount;
			console.log("this is the new amount " + amount2);
			updateDatabase(connection, id, amount2);
		}
		//connection.end()
	});
}

function updateDatabase(connection, id, amount){
	//amount now should be the updated value
	connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: amount}, {item_id: id}], function(err, res){
		if(!!err)
			throw err;
	});
	//display the available items
	displayItems(connection);

}