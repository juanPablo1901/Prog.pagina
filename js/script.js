const Circulo = document.getElementById('circulo');
const CambioColor = document.getElementById('CambioColor');

Circulo.addEventListener('click', ()=>{
CambioColor.click();
});

CambioColor.addEventListener('input',(event) =>{
Circulo.style.backgroundColor = event.target.value;
});