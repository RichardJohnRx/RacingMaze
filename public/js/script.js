// Partie socket.io

var socket = io();

var messages = document.getElementById("messages");
var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("submit", function (e) {
	e.preventDefault();
	if (input.value) {
		socket.emit("chat message", input.value);
		input.value = "";
	}
});

socket.on("chat message", function (msg) {
	console.log(msg);
	var item = document.createElement("li");
	item.textContent = msg;
	messages.appendChild(item);
	window.scrollTo(0, document.body.scrollHeight);
});

let ctx;
let canvas;
let maze;
let mazeHeight;
let mazeWidth;
let player;

// Variable pour stocker tous les coffres
let chests = [];
// Variable pour stocker le nombre de coffres récupérés par l'utilisateur (de base aucun coffre récupéré donc 0)
let chestsFound = 0;

// Variable pour gérer le countdown
let monTimer;
// Variable pour gérer le nombre de minutes en fonction du niveau de jeu :
let minutesNumber;

// Le joueur
class Player {
	constructor() {
		this.reset();
	}

	reset() {
		this.col = 0;
		this.row = 0;
	}
}

// Les cellules du labyrinthe
class MazeCell {
	constructor(col, row) {
		this.col = col;
		this.row = row;

		this.eastWall = true;
		this.northWall = true;
		this.southWall = true;
		this.westWall = true;

		// this.chest = true;

		this.visited = false;
	}
}

class Maze {
	constructor(cols, rows, cellSize, chests, minutesNumber, mazeGenerated) {
		this.backgroundColor = "#ffffff";
		this.cols = cols;
		// this.endColor = "#88FF88";
		this.mazeColor = "#000000";
		// this.playerColor = "#880088";
		this.rows = rows;
		this.cellSize = cellSize;

		this.chests = chests;

		// this.chestColor = "#000088";

		this.playerImage = new Image();
		this.playerImage.src = "images/player.png";

		this.endImage = new Image();
		this.endImage.src = "images/end.png";

		this.chestImage = new Image();
		this.chestImage.src = "images/chest.png";

		this.keyImage = new Image();
		this.keyImage.src = "images/key.png";

		this.minutesNumber = minutesNumber;

		// Vérifier si le labyrinthe existe déjà
		this.mazeGenerated = mazeGenerated;

		this.cells = [];

		if (typeof mazeGenerated !== "undefined" && mazeGenerated.length > 0) {
			this.cells = mazeGenerated;
			this.redraw();
		} else {
			this.generate();
		}
	}

	generate() {
		// On vide d'abord le tableau des coffres pour éviter qu'ils se cumulent à l'infini lorsqu'on génère un nouveau labyrinthe
		chests = [];
		chestsFound = 0;

		// On vide le timer pour ne pas accumuler les minuteurs
		clearInterval(monTimer);

		mazeHeight = this.rows * this.cellSize;
		mazeWidth = this.cols * this.cellSize;

		canvas.height = mazeHeight;
		canvas.width = mazeWidth;
		canvas.style.height = mazeHeight;
		canvas.style.width = mazeWidth;

		for (let col = 0; col < this.cols; col++) {
			this.cells[col] = [];
			for (let row = 0; row < this.rows; row++) {
				this.cells[col][row] = new MazeCell(col, row);
			}
		}

		let rndCol = Math.floor(Math.random() * this.cols);
		let rndRow = Math.floor(Math.random() * this.rows);

		let stack = [];
		stack.push(this.cells[rndCol][rndRow]);

		let currCell;
		let dir;
		let foundNeighbor;
		let nextCell;

		while (this.hasUnvisited(this.cells)) {
			currCell = stack[stack.length - 1];
			currCell.visited = true;
			if (this.hasUnvisitedNeighbor(currCell)) {
				nextCell = null;
				foundNeighbor = false;
				do {
					dir = Math.floor(Math.random() * 4);
					switch (dir) {
						case 0:
							if (
								currCell.col !== this.cols - 1 &&
								!this.cells[currCell.col + 1][currCell.row].visited
							) {
								currCell.eastWall = false;
								nextCell = this.cells[currCell.col + 1][currCell.row];
								nextCell.westWall = false;
								foundNeighbor = true;
							}
							break;
						case 1:
							if (
								currCell.row !== 0 &&
								!this.cells[currCell.col][currCell.row - 1].visited
							) {
								currCell.northWall = false;
								nextCell = this.cells[currCell.col][currCell.row - 1];
								nextCell.southWall = false;
								foundNeighbor = true;
							}
							break;
						case 2:
							if (
								currCell.row !== this.rows - 1 &&
								!this.cells[currCell.col][currCell.row + 1].visited
							) {
								currCell.southWall = false;
								nextCell = this.cells[currCell.col][currCell.row + 1];
								nextCell.northWall = false;
								foundNeighbor = true;
							}
							break;
						case 3:
							if (
								currCell.col !== 0 &&
								!this.cells[currCell.col - 1][currCell.row].visited
							) {
								currCell.westWall = false;
								nextCell = this.cells[currCell.col - 1][currCell.row];
								nextCell.eastWall = false;
								foundNeighbor = true;
							}
							break;
					}
					if (foundNeighbor) {
						stack.push(nextCell);
					}
				} while (!foundNeighbor);
			} else {
				currCell = stack.pop();
			}
		}

		// Partie du minuteur
		// On stocke dans la variable globale le nombre de secondes qui on été passé en paramètre (en fonction de la difficulté)
		minutesNumber = this.minutesNumber * 60 - 1;

		// Appel de la fonction qui démarre le minuteur
		var display = document.getElementById("counter");
		startTimer(minutesNumber, display);

		// Fonction pour chronométrer le temps de la partie (minuteur) :
		function startTimer(duration, display) {
			var timer = duration,
				minutes,
				seconds;

			monTimer = setInterval(function () {
				minutes = parseInt(timer / 60, 10);
				seconds = parseInt(timer % 60, 10);

				minutes = minutes < 10 ? "0" + minutes : minutes;
				seconds = seconds < 10 ? "0" + seconds : seconds;

				display.innerHTML = minutes + ":" + seconds;

				if (--timer < 0) {
					timer = duration;

					// Si le minuteur arrive à 0 seconde, la partie se termine et le minuteur s'arrête
					if (seconds == 0) {
						alert("Votre temps est écoulé ! La partie est terminée.");
						clearInterval(monTimer);
					}
				}
			}, 1000);
		}

		// Fonction pour générer autant de coffres que demandé et chacun à une position aléatoire que l'on stocke dans le tableau "chests"
		for (let chest = 0; chest < this.chests; chest++) {
			// Génération d'une colonne et ligne aléatoire
			let randomCol = Math.floor(Math.random() * this.cols);
			let randomRow = Math.floor(Math.random() * this.rows);

			// Boucle de condition pour que le coffre ne puisse pas être généré sur la case de départ, d'arrivée, et pas non plus sur une case déjà occupée par un autre coffre.
			while (
				(randomCol === 0 && randomRow === 0) ||
				(randomCol === this.cols - 1 && randomRow === this.rows - 1) ||
				chests.indexOf(this.cells[randomCol][randomRow]) !== -1
			) {
				randomCol = Math.floor(Math.random() * this.cols);
				randomRow = Math.floor(Math.random() * this.rows);
			}

			// On pousse la position du coffre dans le tableau dédié (variable globale)
			chests.push(this.cells[randomCol][randomRow]);
		}
		// On affiche le nombre total de coffres à l'écran (pour indiquer l'avancée de l'utilisateur)
		document.getElementById("totalChests").innerHTML =
			chestsFound + " / " + chests.length + " coffres trouvés";

		// Stocker les données de la génération du labyrinthe
		// var mazeCells = JSON.stringify(this.cells);
		// this.cells = JSON.parse(mazeCells);
		// console.log(this.cells);
		socket.emit("maze", this.cells);

		// Stocker les données de la génération des coffres
		// var chestsCells = JSON.stringify(chests);
		// chests = JSON.parse(chestsCells);
		// console.log(chests);
		socket.emit("chests", chests);

		//-----------------------------

		this.redraw();
	}

	hasUnvisited() {
		for (let col = 0; col < this.cols; col++) {
			for (let row = 0; row < this.rows; row++) {
				if (!this.cells[col][row].visited) {
					return true;
				}
			}
		}
		return false;
	}

	hasUnvisitedNeighbor(mazeCell) {
		return (
			(mazeCell.col !== 0 &&
				!this.cells[mazeCell.col - 1][mazeCell.row].visited) ||
			(mazeCell.col !== this.cols - 1 &&
				!this.cells[mazeCell.col + 1][mazeCell.row].visited) ||
			(mazeCell.row !== 0 &&
				!this.cells[mazeCell.col][mazeCell.row - 1].visited) ||
			(mazeCell.row !== this.rows - 1 &&
				!this.cells[mazeCell.col][mazeCell.row + 1].visited)
		);
	}

	redraw() {
		// Les grandes bordures du labyrinhe
		ctx.fillStyle = this.backgroundColor;
		ctx.fillRect(0, 0, mazeHeight, mazeWidth);

		// Affichage du labyrinthe
		ctx.strokeStyle = this.mazeColor;
		ctx.strokeRect(0, 0, mazeHeight, mazeWidth);

		for (let col = 0; col < this.cols; col++) {
			for (let row = 0; row < this.rows; row++) {
				if (this.cells[col][row].eastWall) {
					ctx.beginPath();
					ctx.moveTo((col + 1) * this.cellSize, row * this.cellSize);
					ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
					ctx.stroke();
				}
				if (this.cells[col][row].northWall) {
					ctx.beginPath();
					ctx.moveTo(col * this.cellSize, row * this.cellSize);
					ctx.lineTo((col + 1) * this.cellSize, row * this.cellSize);
					ctx.stroke();
				}
				if (this.cells[col][row].southWall) {
					ctx.beginPath();
					ctx.moveTo(col * this.cellSize, (row + 1) * this.cellSize);
					ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
					ctx.stroke();
				}
				if (this.cells[col][row].westWall) {
					ctx.beginPath();
					ctx.moveTo(col * this.cellSize, row * this.cellSize);
					ctx.lineTo(col * this.cellSize, (row + 1) * this.cellSize);
					ctx.stroke();
				}
			}
		}

		// Affichage des coffres à partir du tableau "chests" (version avec la couleur)
		// for (var chest in chests) {
		// 	ctx.fillStyle = this.chestColor;
		// 	ctx.fillRect(
		// 		chests[chest].col * this.cellSize + 2,
		// 		chests[chest].row * this.cellSize + 2,
		// 		this.cellSize - 4,
		// 		this.cellSize - 4
		// 	);
		// }

		// Affichage des coffres à partir du tableau "chests" (version avec l'image)
		this.chestImage.onload = () => {
			for (var chest in chests) {
				ctx.drawImage(
					this.chestImage,
					chests[chest].col * this.cellSize + 2,
					chests[chest].row * this.cellSize + 2,
					this.cellSize - 4,
					this.cellSize - 4
				);
			}
		};

		for (var chest in chests) {
			ctx.drawImage(
				this.chestImage,
				chests[chest].col * this.cellSize + 2,
				chests[chest].row * this.cellSize + 2,
				this.cellSize - 4,
				this.cellSize - 4
			);
		}

		// Suppression du coffre lorsque le joueur passe dessus et informations sur le nombre de coffres restants
		if (
			chests.find(
				(element) => element.col === player.col && element.row === player.row
			)
		) {
			var indexChest = chests.indexOf(this.cells[player.col][player.row]);
			chests.splice(indexChest, 1);
			// On actualise le nombre de coffres trouvés en rajoutant + 1 à la variable globale "chestsFound" et on modifie le suivi (pour indiquer l'avancée de l'utilisateur)
			let totalChests = document.getElementById("totalChests");
			totalChests.innerHTML = totalChests.innerHTML.replace(
				chestsFound,
				chestsFound + 1
			);
			chestsFound = chestsFound + 1;

			// var item = document.createElement("li");
			// item.textContent = msg;
			// messages.appendChild(item);
			// TESTS
			var adversaire = document.getElementById("adversaire");

			socket.emit("adversaire", chestsFound);

			socket.on("adversaire", function (data) {
				if (data > 1) {
					adversaire.innerHTML = "Antonin : " + data + " coffres trouvés";
				} else {
					adversaire.innerHTML = "Antonin : " + data + " coffre trouvé";
				}
			});

			// S'il reste encore des coffres dans le labyrinthe, on affiche combien il en reste dans une alerte pour lui indiquer son avancée
			if (chests.length > 0) {
				alert(
					"Il vous manque " +
						chests.length +
						" coffres pour pouvoir sortir du labyrinthe."
				);
			}
			// S'il n'y a plus de coffres à récupérer, il faut vite se diriger vers la sortie !
			else {
				alert(
					"Bravo vous avez récupéré tous les coffres, dirigez-vous vite vers la sortie qui vient de s'ouvrir pour terminer la partie !"
				);
			}
		}

		// Affichage du joueur (version avec la couleur)
		// ctx.fillStyle = this.playerColor;
		// ctx.fillRect(
		// 	player.col * this.cellSize + 2,
		// 	player.row * this.cellSize + 2,
		// 	this.cellSize - 4,
		// 	this.cellSize - 4
		// );

		// Affichage du joueur et son avatar (version avec l'image)
		this.playerImage.onload = () => {
			ctx.drawImage(
				this.playerImage,
				player.col * this.cellSize + 2,
				player.row * this.cellSize + 2,
				this.cellSize - 4,
				this.cellSize - 4
			);
		};

		ctx.drawImage(
			this.playerImage,
			player.col * this.cellSize + 2,
			player.row * this.cellSize + 2,
			this.cellSize - 4,
			this.cellSize - 4
		);

		// On affiche la sortie du labyrinthe seulement si tous les coffres ont été récupérés, donc si le tableau des coffres est vide
		if (chests.length === 0) {
			// Affichage de la sortie du labyrinthe (version avec la couleur)
			// ctx.fillStyle = this.endColor;
			// ctx.fillRect(
			// 	(this.cols - 1) * this.cellSize,
			// 	(this.rows - 1) * this.cellSize,
			// 	this.cellSize,
			// 	this.cellSize
			// );

			// Affichage de la sortie du labyrinthe (version avec l'image)
			ctx.drawImage(
				this.endImage,
				(this.cols - 1) * this.cellSize,
				(this.rows - 1) * this.cellSize,
				this.cellSize - 4,
				this.cellSize - 4
			);

			if (this.cols === 3 && this.rows === 3) {
			}
			ctx.drawImage(
				this.keyImage,
				Math.floor(Math.random() * this.cols) * this.cellSize,
				Math.floor(Math.random() * this.rows) * this.cellSize,
				this.cellSize - 4,
				this.cellSize - 4
			);

			// Alerte pour montrer que le joueur a gagné lorsqu'il touche la sortie en affichant le temps qu'il a mis pour terminer
			if (player.col === this.cols - 1 && player.row === this.rows - 1) {
				alert(
					"Bravo ! Vous êtes sortis du labyrinthe ! Voici le temps que vous avez mis : " +
						convertMinutesSecondsToSeconds(
							document.getElementById("counter").innerHTML
						)
				);
				// clearTimeout(monTimer);
				// Arrêt du minuteur lorsqu'on sort du labyrinthe
				clearInterval(monTimer);
			}
		}
	}
}

// Conversion du format mm:ss en secondes
function convertMinutesSecondsToSeconds(time) {
	// On récupère les minutes + secondes
	// On enlève les ":"
	var minutesSeconds = time.split(":");
	// On convertit les minutes en secondes et on les additionne avec le reste des secondes
	var seconds = +minutesSeconds[0] * 60 + +minutesSeconds[1];

	// On soustrait le résultat avec le temps du minuteur initial (exemple : 120 (2minutes) - 100 (1minute40))
	var secondsResult = minutesNumber - seconds + 1;
	var mins = Math.floor((secondsResult % 3600) / 60);
	var secs = Math.floor(secondsResult % 60);

	// Conversion des secondes en un format plus lisible pour l'utilisateur
	var result = "";

	if (mins <= 0) {
		result += "" + secs + " secondes";
	} else if (mins === 1) {
		result += "" + mins + " minute " + (secs < 10 ? "0" : "");
		result += "" + secs;
	} else {
		result += "" + mins + " minutes " + (secs < 10 ? "0" : "");
		result += "" + secs;
	}

	return result;
}

// Fonction pour générer un labyrinthe en fonction du niveau choisi, chaque niveau possède différents paramètres pour générer le labyrinthe (le nombre de colonnes, lignes, coffres, minutes du minuteur)
function onClick(event) {
	player.reset();
	document.getElementById("counter").innerHTML = "";

	if (document.getElementById("menuFacile").checked == true) {
		maze.cols = 4;
		maze.rows = 4;
		maze.chests = 3;
		maze.minutesNumber = 2;
	} else if (document.getElementById("menuIntermediaire").checked == true) {
		maze.cols = 8;
		maze.rows = 8;
		maze.chests = 5;
		maze.minutesNumber = 3;
	} else if (document.getElementById("menuDifficile").checked == true) {
		maze.cols = 11;
		maze.rows = 11;
		maze.chests = 7;
		maze.minutesNumber = 4;
	} else {
		alert("veuillez choisir le niveau de jeu");
		return 0;
	}

	// Condition pour vérifier que le nombre de coffres n'est pas trop élevé
	if (maze.chests > maze.cols * maze.rows - 2) {
		alert(
			"Impossible d'avoir plus de coffres que de cellules moins celle de l'arrivée et de départ."
		);
	} else {
		maze.generate();
	}
}

// Code pour permettre au joueur de se déplacer en cliquant sur les icones (pratique pour les joueurs mobiles)
function onControlClick(event) {
	switch (event.target.id) {
		case "left":
			if (!maze.cells[player.col][player.row].westWall) {
				player.col -= 1;
			}
			break;
		case "right":
			if (!maze.cells[player.col][player.row].eastWall) {
				player.col += 1;
			}
			break;
		case "down":
			if (!maze.cells[player.col][player.row].southWall) {
				player.row += 1;
			}
			break;
		case "up":
			if (!maze.cells[player.col][player.row].northWall) {
				player.row -= 1;
			}
			break;
		default:
			break;
	}
	maze.redraw();
}

// Code pour permettre au joueur de se déplacer en utilisant ses flèches directionnelles ou ZQSD
function onKeyDown(event) {
	switch (event.keyCode) {
		case 37: // Flèche directionnelle gauche
		case 81: // Q
			if (!maze.cells[player.col][player.row].westWall) {
				player.col -= 1;
			}
			break;
		case 39: // Flèche directionnelle droite
		case 68: // D
			if (!maze.cells[player.col][player.row].eastWall) {
				player.col += 1;
			}
			break;
		case 40: // Flèche directionnelle bas
		case 83: // S
			if (!maze.cells[player.col][player.row].southWall) {
				player.row += 1;
			}
			break;
		case 38: // Flèche directionnelle haut
		case 90: // Z
			if (!maze.cells[player.col][player.row].northWall) {
				player.row -= 1;
			}
			break;
		default:
			break;
	}
	maze.redraw();
}

function onLoad() {
	// Création du canvas et du joueur
	canvas = document.getElementById("mainForm");
	ctx = canvas.getContext("2d");
	player = new Player();

	// Nombre de colonnes
	var col = 4;
	// Nombre de lignes
	var row = 4;
	// Taille des cellules
	var size = 50;
	// Nombre de coffres
	var chest = 3;
	// Durée en minutes du minuteur de la partie
	var minutesNumber = 60;
	// Savoir s'il y a déjà un labyrinthe existant
	var mazeGenerated = [];

	socket.on("maze", (data) => {
		console.log(data);
		mazeGenerated = data;
		// console.log(mazeGenerated[0][0].southWall);
		socket.on("chests", (data) => {
			console.log(data);
			chests = data;
		});
	});

	console.log(mazeGenerated);

	document.getElementById("menuFacile").checked = true;

	// Condition pour vérifier que le nombre de coffres n'est pas trop élevé
	if (chest > col * row - 2) {
		alert(
			"Impossible d'avoir plus de coffres que de cellules moins celle de l'arrivée et de départ."
		);
	} else {
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
}
