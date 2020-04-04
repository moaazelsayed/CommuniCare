// An emergency care app to assist those in the community in need of assistance or at high risk with no means to access help in a pandemic.
// Modules
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var connectionString = "mongodb+srv://@cluster0-37iwx.mongodb.net/communicare?retryWrites=true&w=majority";

// App settings
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on("error",(err)=>{
    console.log("err", err);
});

mongoose.connection.on("connected",(err,res) => {
    console.log("Mongoose is connected");
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));


// Mongoose scheme
var requestSchema = new mongoose.Schema({
	fname: String,
	lname: String,
	DOB: String,
	phoneNumber: Number,
	address: String, 
	dateTime: String,
	requestType: String,
	request: String,
	status: String
});


// Onboarded stores
var stores = [
	{name:"Walmart", site:"https://walmart.ca"},
	{name:"Shoppers", site:"https://shoppersdrugmart.ca"},
	{name:"Costco", site:"https://costco.ca"},
	{name:"Freshco", site:"https://freshco.com"},
	{name:"Metro", site:"https://metro.ca"}
]

var Request = mongoose.model("requests", requestSchema);

app.get("/request", function(req, res) {
	res.render("request.ejs", {stores: stores});
});

app.get("/confirmed", function(req, res) {
	res.render("confirmedRequest.ejs");
});

// Get DB info 
app.get("/helper", function(req, res){
	Request.find({}, function(err, requestList){
		if (err) console.log (err);
		else {
			var completed = 0;
			var notCompleted = 0;
			var total = 0;
			requestList.forEach((element) => {
			  if (element.status == "Completed"){
			  	completed++;
			  }else{
			  	notCompleted++;
			  }
			  total++;
			})
			res.render("helper.ejs", {requests: requestList, totalReq: total, completedReq: completed, notCompletedReq: notCompleted});
		}
	})
});

app.post("/helper", function(req, res){
	//console.log(req.body.reqUpdate);
	var updates = req.body.reqUpdate;
	if (typeof(updates) != "string"){
		for (var i = 0 ; i < updates.length; i++){
			//console.log(updates[i]);
			Request.findById(updates[i], function(err, request) {
				if (err) console.log (err);
				else {
					//console.log(request)
				    // do your updates here
				    request.status = "Completed";
				    request.save(function(err) {
				      if (err)
				        console.log('Error')
				      else
				        console.log('Successfully updated DB')
				    });
			  	}
			});
		}
	} else {
		Request.findById(updates, function(err, request) {
				if (err) console.log (err);
				else {
					//console.log(request)
				    // do your updates here
				    request.status = "Completed";
				    request.save(function(err) {
				      if (err)
				        console.log('Error')
				      else
				        console.log('Successfully updated DB')
				    });
			  	}
			});
	}
	res.redirect("/helper");
});

// Submit button route
app.post("/request", function(req, res){
	console.log("request submitted");
	var newRequest = new Request({
		fname: req.body.fName,
		lname: req.body.lName,
		DOB: req.body.dob,
		phoneNumber: req.body.phone,
		address: req.body.address, 
		dateTime: req.body.dateTime,
		requestType: req.body.requestType,
		request: req.body.request,
		status: "notCompleted"	
	})
	Request.create(newRequest, function(err, Request){
		if (err) console.log(err);
		else {
			console.log("Inserted request: " + newRequest);
		}
	})
	res.redirect("/request");
});

// Catch all other routes
app.get("*", function(req, res){
	res.send("<h1>Path invalid</h1>");
});

// Server listen on port 3000
app.listen(process.env.PORT || 3000, function(){
	console.log("Server started on port 3000");
});