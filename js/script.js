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
// Variables pour gérer le countdown
let monTimer=0;
//variable pour gérer le nombre de minutes en fonction du niveau de jeu : 
let nbrMinutes=0;

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
	constructor(cols, rows, cellSize, chests, monTimer) {
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

		this.monTimer = monTimer;
		this.generate();
	}
	
	generate() {
		
		// On vide d'abord le tableau des coffres pour éviter qu'ils se cumulent à l'infini lorsqu'on génère un nouveau labyrinthe
		chests = [];
		chestsFound = 0;
		
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
		// On affiche le nombre total de coffres à l'écran (pour indiquer l'avancée de l'utilisateur)
        document.getElementById("totalChests").innerHTML =
            chestsFound + " / " + chests.length + " coffres trouvés";
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
			// On actualise le nombre de coffres trouvés en rajoutant + 1 à la variable globale "chestsFound" et on modifie le suivi (pour indiquer l'avancée de l'utilisateur)
            let totalChests = document.getElementById("totalChests");
            totalChests.innerHTML = totalChests.innerHTML.replace(
                chestsFound,
                chestsFound + 1
            );
            chestsFound = chestsFound + 1;
			// S'il reste encore des coffres, on affiche combien il en reste
			if (chests.length > 0) {
				alert(
					"Il vous manque " +
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
				alert("Bravo ! Vous avez terminé : "+document.getElementById('timer').innerHTML);
			}
		}
	}
}

// Fonction pour générer un labyrinthe en fonction du niveau choisi : 
function onClick(event) {
	player.reset();
	document.getElementById("counter").innerHTML="";
	if(document.getElementById('menuFacile').checked ==true){
	    maze.cols = 4;
	    maze.rows = 4;
		maze.chests = 3;
		maze.nbrMinutes = 2;
	}
	else if (document.getElementById('menuIntermediaire').checked ==true){
		maze.cols = 8;
	    maze.rows = 8;
		maze.chests = 5;
		maze.nbrMinutes= 3;
	}else if (document.getElementById('menuDifficile').checked ==true){
		maze.cols = 11;
	    maze.rows = 11;
		maze.chests = 7;
		maze.nbrMinutes=4;
	}else{
		alert('veuillez choisir le niveau de jeu');
		return 0;
	}

	if (maze.chests > maze.cols * maze.rows - 2) {
		alert(
			"Impossible d'avoir plus de coffres que de cellules moins celle de l'arrivée et de départ."
		);
	} else {
		maze.generate();
		// on vite le timer pour ne pas accumuler les minuteurs  
		clearTimeout(monTimer);
		// appel de la fonction avec le parametres nbrMinutes récuperer dans les tests en dessus en fonction de la difficulté
		startTimer(maze.nbrMinutes);
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

//La partie qui va chronometrée le jeu (TIMER) : 
function startTimer(nbrMinute) {
	var seconds = 60;
    var mins = nbrMinute;
    function tick() {

        var counter = document.getElementById("counter");
        var current_minutes = mins-1;
        seconds--;
        counter.innerHTML = current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds);
        if( seconds > 0 ) {
			monTimer = setTimeout(tick, 1000);			
        } else {
            if(mins > 1){				
                startTimer(mins-1);           
            }
        }
    }
    tick();
}

function onLoad() {
	canvas = document.getElementById("mainForm");
	ctx = canvas.getContext("2d");
	player = new Player();
	var col = 4;
	var row = 4;
	var size = 50;
	var chest = 3;
	var testTimer = null;

	document.getElementById('menuFacile').checked=true;
	if (chest > col * row - 2) {
		alert(
			"Impossible d'avoir plus de coffres que de cellules moins celle de l'arrivée et de départ."
		);
	} else {
		maze = new Maze(col, row, size, chest, testTimer);
	}	
	document.getElementById("quitterPartie").onclick = function(){
		alert('YES quitter');
			
	}

	// Les evenements :
	document.addEventListener("keydown", onKeyDown);
	document.getElementById("generate").addEventListener("click", onClick);
	document.getElementById("up").addEventListener("click", onControlClick);
	document.getElementById("right").addEventListener("click", onControlClick);
	document.getElementById("down").addEventListener("click", onControlClick);
	document.getElementById("left").addEventListener("click", onControlClick);
	
}
