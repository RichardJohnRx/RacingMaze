let ctx;
let canvas;
let maze;
let mazeHeight;
let mazeWidth;
let player;
// Variable pour stocker tous les coffres
let chests = [];

class Player {
	constructor() {
		this.reset();
	}

	reset() {
		this.col = 0;
		this.row = 0;
	}
}

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
	constructor(cols, rows, cellSize, chests) {
		this.backgroundColor = "#ffffff";
		this.cols = cols;
		this.endColor = "#88FF88";
		this.mazeColor = "#000000";
		this.playerColor = "#880088";
		this.rows = rows;
		this.cellSize = cellSize;

		this.chests = chests;

		this.chestColor = "#000088";

		this.cells = [];

		this.generate();
	}

	generate() {
		// On vide d'abord le tableau des coffres pour éviter qu'ils se cumulent à l'infini lorsqu'on génère un nouveau labyrinthe
		chests = [];

		
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

		// Affichage des coffres à partir du tableau "chests"
		for (var chest in chests) {
			ctx.fillStyle = this.chestColor;
			ctx.fillRect(
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
			// S'il reste encore des coffres, on affiche combien il en reste
			if (chests.length > 0) {
				alert(
					"Il manque " +
						chests.length +
						" coffres pour pouvoir sortir du labyrinthe."
				);
			}
			// S'il n'y a plus de coffres il faut vite se diriger vers la sortie !
			else {
				alert(
					"Bravo vous avez récupéré tous les coffres, dirigez-vous vite vers la sortie qui vient de s'ouvrir pour terminer la partie !"
				);
			}
		}

		// Affichage du joueur
		ctx.fillStyle = this.playerColor;
		ctx.fillRect(
			player.col * this.cellSize + 2,
			player.row * this.cellSize + 2,
			this.cellSize - 4,
			this.cellSize - 4
		);

		// On affiche la sortie du labyrinthe seulement si tous les coffres ont été récupérés, donc si le tableau des coffres est vide
		if (chests.length === 0) {
			// La sortie du labyrinthe
			ctx.fillStyle = this.endColor;
			ctx.fillRect(
				(this.cols - 1) * this.cellSize,
				(this.rows - 1) * this.cellSize,
				this.cellSize,
				this.cellSize
			);
			// Alerte pour montrer que le joueur a gagné lorsqu'il touche la sortie
			if (player.col === this.cols - 1 && player.row === this.rows - 1) {
				alert("Bravo ! Vous avez terminé la partie ! ヾ(≧▽≦*)o");
				alert('Vous allez passé au niveau suivant,');
				if(maze.cols == 4){
					document.getElementById('menuIntermediaire').checked=true;
				    maze.cols = 8;
				    maze.rows = 8;
				    maze.chests = 5;
				}
				else if (maze.cols == 8){
					document.getElementById('menuDifficile').checked=true;
					maze.cols = 11;
				    maze.rows = 11;
				    maze.chests = 7;
				}
				/*
				maze.cols = document.getElementById("cols").value;
				maze.rows = document.getElementById("rows").value;
				maze.chests = document.getElementById("chests").value;
				*/
				maze.generate();
			}
		}
	}
}

// Fonction pour générer un labyrinthe en entrant des valeurs spécifiques directement depuis la page web
function onClick(event) {
	player.reset();
	if(document.getElementById('menuFacile').checked ==true){
	    alert('Facile');
	    maze.cols = 4;
	    maze.rows = 4;
	    maze.chests = 3;
	}
	else if (document.getElementById('menuIntermediaire').checked ==true){
		alert("Préparez-vous pour le niveau Intermediaire, puis clicker sur OK");
		maze.cols = 8;
	    maze.rows = 8;
	    maze.chests = 5;
	}else if (document.getElementById('menuDifficile').checked ==true){
		alert('Êtes-vous prêt pour le niveau difficile ?');
		maze.cols = 11;
	    maze.rows = 11;
	    maze.chests = 7;
	}else{
		alert('veuillez choisir le niveau de jeu');
		return 0;
	}
	/*
	maze.cols = document.getElementById("cols").value;
	maze.rows = document.getElementById("rows").value;
	maze.chests = document.getElementById("chests").value;
	*/

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
		case 37: // Left
		case 81: // Q
			if (!maze.cells[player.col][player.row].westWall) {
				player.col -= 1;
			}
			break;
		case 39: // Right
		case 68: // D
			if (!maze.cells[player.col][player.row].eastWall) {
				player.col += 1;
			}
			break;
		case 40: // Bottom
		case 83: // S
			if (!maze.cells[player.col][player.row].southWall) {
				player.row += 1;
			}
			break;
		case 38: // Top
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
	alert('hello');
	canvas = document.getElementById("mainForm");
	ctx = canvas.getContext("2d");

	player = new Player();
	var col = 4;
	var row = 4;
	var size = 50;
	var chest = 3;
	document.getElementById('menuFacile').checked=true;
	if (chest > col * row - 2) {
		alert(
			"Impossible d'avoir plus de coffres que de cellules moins celle de l'arrivée et de départ."
		);
	} else {
		maze = new Maze(col, row, size, chest);
	}

	document.addEventListener("keydown", onKeyDown);
	document.getElementById("generate").addEventListener("click", onClick);
	document.getElementById("up").addEventListener("click", onControlClick);
	document.getElementById("right").addEventListener("click", onControlClick);
	document.getElementById("down").addEventListener("click", onControlClick);
	document.getElementById("left").addEventListener("click", onControlClick);
}
