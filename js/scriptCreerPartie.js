// if(document.getElementById('partiePublique').checked == true){
//     alert('publique');
// }
// else if(document.getElementById('partiePrivee').checked == true){
//     alert('privee');
// }
// console.log('test');

// function onLoad() {
//     if(document.getElementById('partiePublique').checked == true){
//         alert('publique');
//     }
//     else if(document.getElementById('partiePrivee').checked == true){
//         alert('privee');
//     }
// }


alert('ok');
var partiePublique = document.getElementById('partiePublique');
var partiePrivee = document.getElementById('partiePrivee');

verify();


function verify(){
    if(partiePublique.value == true)
        alert('publique');
    else if(partiePrivee.value == true)
        alert('privée');
}