import { player, maze } from "../script.js";

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

export { onClick, onControlClick, onKeyDown };
