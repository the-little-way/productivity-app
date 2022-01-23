//modal swap  to register
let registerSwap = document.getElementById('registerSwap');
registerSwap.addEventListener('click', function(){
	let loginForm = document.getElementById('loginForm');
	let registerForm = document.getElementById('registerForm');
	loginForm.style.display='none'
	registerForm.style.display='block'
})


//modal swap to login
let loginSwap = document.getElementById('loginSwap');
loginSwap.addEventListener('click', function(){
	let loginForm = document.getElementById('loginForm');
	let registerForm = document.getElementById('registerForm');
	registerForm.style.display='none'
	loginForm.style.display='block'
})