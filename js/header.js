
// Codigo para que al momento de realizar la accion de scroll
// el "header" cambia a "header2" versión

function throttle(fn, wait) {
	let time = Date.now();
	return function() {
	if ((time + wait - Date.now()) < 0) {
	fn();
	time = Date.now();
	}
	}
	}
	
	document.addEventListener('DOMContentLoaded', function() {
	window.addEventListener('scroll', throttle(function() {
	if (window.scrollY > 0) {
	document.querySelector('header').classList.add('header2');
	} else {
	document.querySelector('header').classList.remove('header2');
	}
	
	}, 100)); // Ejecutar el código cada 200ms
	});


	/*
$(document).ready(function(){

	$(window).scroll(function(){
		if( $(this).scrollTop() > 0 ){
			$('header').addClass('header2');
		} else {
			$('header').removeClass('header2');
		}
	});
});
*/