//Pour vérifier le choix de la partie (Publique/Privée)
function radioCheck(){
    if(document.getElementById('partiePublique').checked == true){
        document.getElementById('niveauJeu').style.display='block';
        document.getElementById('infoPartiePriv').style.display='none';      
    }
    else if(document.getElementById('partiePrivee').checked == true){
        document.getElementById('niveauJeu').style.display='block';
        document.getElementById('infoPartiePriv').style.display='block';     
    }
}
//Pour choisir l'avatar
function choixAvatar(id){
    if(id === 'avatargreen'){
        document.getElementById(id).style.border='1px solid black';
        document.getElementById('avatarred').style.border='none';
        document.getElementById('avataryellow').style.border='none';
        document.getElementById('avataraqua').style.border='none';
        return document.getElementById('avatargreen');

    }else if(id === 'avatarred'){
        document.getElementById(id).style.border='1px solid black';
        document.getElementById('avatargreen').style.border='none';
        document.getElementById('avataryellow').style.border='none';
        document.getElementById('avataraqua').style.border='none';
        return document.getElementById('avatarred');

    }else if(id === 'avataryellow'){
        document.getElementById(id).style.border='1px solid black';
        document.getElementById('avatargreen').style.border='none';
        document.getElementById('avatarred').style.border='none';
        document.getElementById('avataraqua').style.border='none';
        return document.getElementById('avataryellow');

    }else if(id === 'avataraqua'){
        document.getElementById(id).style.border='1px solid black';
        document.getElementById('avatargreen').style.border='none';
        document.getElementById('avatarred').style.border='none';
        document.getElementById('avataryellow').style.border='none';
        return document.getElementById('avataraqua');
    }
}

//Boutton pour creer une partie 
function creer(){
    if(document.getElementById('nomPartie').value == ""){
        alert('saisir le nom svp');
    }else{
        if(document.getElementById('avatargreen').style.border != '1px solid black' 
            && document.getElementById('avatarred').style.border != '1px solid black'
            && document.getElementById('avataryellow').style.border != '1px solid black'
            && document.getElementById('avataraqua').style.border != '1px solid black'){
                alert('choisissez un avatar svp');
        }else{
            if(document.getElementById('partiePublique').checked == true){
                console.log('publique');
                document.getElementById('niveauJeu').style.display='block';
                if(document.getElementById('menuFacile').checked == false && document.getElementById('menuIntermediaire').checked == false && document.getElementById('menuDifficile').checked == false){
                    alert('veuillez choisir le niveau svp');
                }else{
                    // CODE DE LA FONCTION CREER PARTIE PUBLIQUE pour envoyé les données au lobby
                }
            }
            else if(document.getElementById('partiePrivee').checked == true){
                console.log('privée');
                document.getElementById('niveauJeu').style.display='block';
                if(document.getElementById('menuFacile').checked == false && document.getElementById('menuIntermediaire').checked == false && document.getElementById('menuDifficile').checked == false){
                    alert('veuillez choisir le niveau svp');
                }else{
                    if(document.getElementById('codeAcces').value == ""){
                        alert("veuillez saisir le code d'acces");
                    }else{
                        // CODE DE LA FONCTION CREER PARTIE PRIVEE pour envoyé les données au lobby
                    }
                }
            }else{
                alert('veuillez choisir le type de la partie (Publique/privée)');               
            }
            
        }          
    }
    
}
