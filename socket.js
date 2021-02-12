// var express = require("express");
// var app = express();

// app.use(express.static("public"));

// app.get("/", function (req, res) {
// 	res.sendFile(__dirname + "/index.html");
// });

// app.listen(3000, function () {
// 	console.log("Example app listening on port 3000 !");
// });

var express = require("express");
var app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
	socket.on("chat message", (msg) => {
		io.emit("chat message", msg);
	});

	socket.on("adversaire", (data) => {
		io.emit("adversaire", data);
	});

	socket.on("maze", (data) => {
		console.log(data);
		io.emit("maze", data);
	});

	socket.on("chests", (data) => {
		console.log(data);
		io.emit("chests", data);
	});
});

http.listen(3000, () => {
	console.log("listening on *:3000");
});
