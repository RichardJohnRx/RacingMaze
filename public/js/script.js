// Partie socket.io

var socket = io();

// var messages = document.getElementById("messages");
// var form = document.getElementById("form");
// var input = document.getElementById("input");

// form.addEventListener("submit", function (e) {
// 	e.preventDefault();
// 	if (input.value) {
// 		socket.emit("chat message", input.value);
// 		input.value = "";
// 	}
// });

// socket.on("chat message", function (msg) {
// 	console.log(msg);
// 	var item = document.createElement("li");
// 	item.textContent = msg;
// 	messages.appendChild(item);
// 	window.scrollTo(0, document.body.scrollHeight);
// });

import { Maze } from "./classes/Maze.js";

import { Player } from "./classes/Player.js";

import { onClick, onControlClick, onKeyDown } from "./utils/tools.js";

let player;
let ctx;
let canvas;
let maze;

window.onload = function onLoad() {
	// Création du canvas et du joueur
	canvas = document.getElementById("mainForm");
	ctx = canvas.getContext("2d");
	player = new Player();
	// Nombre de colonnes
	let col = 4;
	// Nombre de lignes
	let row = 4;
	// Taille des cellules
	let size = 50;
	// Nombre de coffres
	let chest = 3;
	// Durée en minutes du minuteur de la partie
	let minutesNumber = 60;
	// Savoir s'il y a déjà un labyrinthe existant
	let mazeGenerated = [];

	// socket.on("maze", (data) => {
	// 	console.log(data);
	// 	mazeGenerated = data;
	// 	// console.log(mazeGenerated[0][0].southWall);
	// 	socket.on("chests", (data) => {
	// 		// console.log(chest);
	// 		console.log("ok");
	// 		chests = data;

	// 		callback(mazeGenerated, chests);
	// 	});
	// });

	// function callback(mazeGenerated, chests) {
	// 	console.log(mazeGenerated);
	// 	console.log(chests);
	// 	maze = new Maze(col, row, size, chests, minutesNumber, mazeGenerated);
	// }

	document.getElementById("menuFacile").checked = true;

	// Condition pour vérifier que le nombre de coffres n'est pas trop élevé
	if (chest > col * row - 2) {
		alert(
			"Impossible d'avoir plus de coffres que de cellules moins celle de l'arrivée et de départ."
		);
	} else {
		console.log("pas ok");
		maze = new Maze(col, row, size, chest, minutesNumber, mazeGenerated);
	}
	document.getElementById("quitterPartie").onclick = function () {
		alert("YES quitter");
	};

	// Les événements
	document.addEventListener("keydown", onKeyDown);
	document.getElementById("generate").addEventListener("click", onClick);
	document.getElementById("up").addEventListener("click", onControlClick);
	document.getElementById("right").addEventListener("click", onControlClick);
	document.getElementById("down").addEventListener("click", onControlClick);
	document.getElementById("left").addEventListener("click", onControlClick);
};

export { canvas, ctx, player, maze };
