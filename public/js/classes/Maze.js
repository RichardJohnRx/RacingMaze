import { canvas, ctx, player } from "../script.js";

let mazeHeight;
let mazeWidth;
// Variable pour stocker tous les coffres
let chests = [];
// Variable pour stocker le nombre de coffres récupérés par l'utilisateur (de base aucun coffre récupéré donc 0)
let chestsFound = 0;
// Variable pour stocker la position de la clé
let key = [];
// Variable pour gérer le countdown
let monTimer;
// Variable pour gérer le nombre de minutes en fonction du niveau de jeu :
let minutesNumber;

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
		console.log(mazeGenerated);

		this.cells = [];

		if (typeof mazeGenerated !== "undefined" && mazeGenerated.length > 0) {
			this.cells = mazeGenerated;
			console.log("redraw");
			this.redraw();
		} else {
			console.log("generate");
			this.generate();
		}
	}

	generate() {
		// On vide d'abord le tableau des coffres pour éviter qu'ils se cumulent à l'infini lorsqu'on génère un nouveau labyrinthe, de même pour la clé
		chests = [];
		chestsFound = 0;
		key = [];

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

		let randomColCell = Math.floor(Math.random() * this.cols);
		let randomRowCell = Math.floor(Math.random() * this.rows);

		let stack = [];
		stack.push(this.cells[randomColCell][randomRowCell]);

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
			let timer = duration,
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
			// Génération d'une colonne et ligne aléatoire pour la position de chaque coffre
			let randomColChest = Math.floor(Math.random() * this.cols);
			let randomRowChest = Math.floor(Math.random() * this.rows);

			// Boucle de condition pour que le coffre ne puisse pas être généré sur la case de départ, d'arrivée, et pas non plus sur une case déjà occupée par un autre coffre
			while (
				(randomColChest === 0 && randomRowChest === 0) ||
				(randomColChest === this.cols - 1 &&
					randomRowChest === this.rows - 1) ||
				chests.indexOf(this.cells[randomColChest][randomRowChest]) !== -1
			) {
				randomColChest = Math.floor(Math.random() * this.cols);
				randomRowChest = Math.floor(Math.random() * this.rows);
			}

			// On pousse la position du coffre dans le tableau dédié (variable globale)
			chests.push(this.cells[randomColChest][randomRowChest]);
		}
		// On affiche le nombre total de coffres à l'écran (pour indiquer l'avancée de l'utilisateur)
		document.getElementById("totalChests").innerHTML =
			chestsFound + " / " + chests.length + " coffres trouvés";

		// Génération d'une colonne et ligne aléatoire pour la position de la clé
		let randomColKey = Math.floor(Math.random() * this.cols);
		let randomRowKey = Math.floor(Math.random() * this.rows);
		// Boucle de condition pour que la clé ne puisse pas être générée sur la case d'arrivée et pas non plus sur une case déjà occupée par un coffre
		while (
			(randomColKey === this.cols - 1 && randomRowKey === this.rows - 1) ||
			chests.indexOf(this.cells[randomColKey][randomRowKey]) !== -1
		) {
			randomColKey = Math.floor(Math.random() * this.cols);
			randomRowKey = Math.floor(Math.random() * this.rows);
		}
		// On pousse la position de la clé dans le tableau dédié (variable globale)
		key.push(this.cells[randomColKey][randomRowKey]);
		// console.log(key[0].col);
		// console.log(key[0].row);

		// Stocker les données de la génération du labyrinthe
		// console.log(JSON.stringify(this.cells));
		// var mazeCells = JSON.stringify(this.cells);
		// this.cells = JSON.parse(mazeCells);
		// console.log(this.cells);

		// socket.emit("maze", this.cells);

		// Stocker les données de la génération des coffres
		// var chestsCells = JSON.stringify(chests);
		// chests = JSON.parse(chestsCells);
		// console.log(chests);
		// socket.emit("chests", chests);

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
			for (let chest in chests) {
				ctx.drawImage(
					this.chestImage,
					chests[chest].col * this.cellSize + 2,
					chests[chest].row * this.cellSize + 2,
					this.cellSize - 4,
					this.cellSize - 4
				);
			}
		};

		for (let chest in chests) {
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
			let indexChest = chests.indexOf(this.cells[player.col][player.row]);
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
			// let adversaire = document.getElementById("adversaire");

			// socket.emit("adversaire", chestsFound);

			// socket.on("adversaire", function (data) {
			// 	if (data > 1) {
			// 		adversaire.innerHTML = "Antonin : " + data + " coffres trouvés";
			// 	} else {
			// 		adversaire.innerHTML = "Antonin : " + data + " coffre trouvé";
			// 	}
			// });

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
					"Bravo vous avez récupéré tous les coffres, allez vite récupérer la clé pour ouvrir la sortie !"
				);
			}
		}

		// S'il n'y a plus de coffre dans le labyrinthe et que la clé n'a pas encore été récupérée, on affiche la clé et la sortie
		if (chests.length === 0 && key.length > 0) {
			// Affichage de la position de la clé
			ctx.drawImage(
				this.keyImage,
				key[0].col * this.cellSize + 2,
				key[0].row * this.cellSize + 2,
				this.cellSize - 4,
				this.cellSize - 4
			);

			// Affichage de la sortie du labyrinthe (version avec l'image)
			ctx.drawImage(
				this.endImage,
				(this.cols - 1) * this.cellSize,
				(this.rows - 1) * this.cellSize,
				this.cellSize - 4,
				this.cellSize - 4
			);

			// Si le joueur essaye de sortir du labyrinthe sans avoir récupéré la clé (si la variable globale "key" n'est pas vide), on indique qu'il manque la clé
			if (
				player.col === this.cols - 1 &&
				player.row === this.rows - 1 &&
				typeof key !== "undefined" &&
				key.length > 0
			) {
				alert("Il vous manque la clé pour pouvoir sortir !");
			}

			// On supprime de la clé lorsque le joueur passe dessus et on lui indique de se diriger vers la sortie
			if (
				key.find(
					(element) => element.col === player.col && element.row === player.row
				)
			) {
				var indexKey = key.indexOf(this.cells[player.col][player.row]);
				key.splice(indexKey, 1);
				alert("Tu as récupéré la clé ! Dirige toi vite vers la sortie !");
			}
		} else if (chests.length === 0) {
			// Affichage de la sortie du labyrinthe (version avec l'image)
			ctx.drawImage(
				this.endImage,
				(this.cols - 1) * this.cellSize,
				(this.rows - 1) * this.cellSize,
				this.cellSize - 4,
				this.cellSize - 4
			);

			// Alerte pour montrer que le joueur a gagné lorsqu'il touche la sortie en ayant la clé en affichant aussi le temps qu'il a mis pour terminer
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

		// Conversion du format mm:ss en secondes pour le résultat du temps qu'a pris le joueur à terminer le labyrinthe
		function convertMinutesSecondsToSeconds(time) {
			// On récupère les minutes + secondes
			// On enlève les ":"
			let minutesSeconds = time.split(":");
			// On convertit les minutes en secondes et on les additionne avec le reste des secondes
			let seconds = +minutesSeconds[0] * 60 + +minutesSeconds[1];

			// On soustrait le résultat avec le temps du minuteur initial (exemple : 120 (2minutes) - 100 (1minute40))
			let secondsResult = minutesNumber - seconds + 1;
			let mins = Math.floor((secondsResult % 3600) / 60);
			let secs = Math.floor(secondsResult % 60);

			// Conversion des secondes en un format plus lisible pour l'utilisateur
			let result = "";

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
	}
}

export { Maze };
