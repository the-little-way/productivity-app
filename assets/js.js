//logout button is smaller than the containing element, listen for nearby clicks
const stickyBtn = document.getElementById('stickyBtn');
const logoutBtn = document.getElementById('logoutBtn');
stickyBtn.addEventListener('click', function(){
	//trigger logout
	logoutBtn.click()
})

//overlay input to edit city, alternatively can use add/remove class
const overlay = document.getElementById('overlay');
const editCity = document.getElementById('editCity');
const popupCity = document.getElementById('popupCity');
overlay.addEventListener('click', function() {
	overlay.style.height="0vh",
	popupCity.style.display="none"
});
editCity.addEventListener('click', function(){
	//overlay.style.display="block",
	overlay.style.height="100vh",
	popupCity.style.display="block"
})


//prevent submit when input field is empty
const itemInput = document.getElementById('itemInput');
const itemBtn = document.getElementById('itemBtn');
itemInput.addEventListener('keypress', function() {
	if(itemInput.value !== ""){
		itemBtn.disabled=false;
	}
});


//enable save button only if there are items to save
const saveBtn = document.getElementById('saveBtn');
saveBtn.addEventListener('mouseover', function() {	
	const listedItem = document.getElementById('listedItem');
	if(listedItem){
		saveBtn.disabled=false;
		//console.log('list detected');
	}
	else {
		saveBtn.disabled=true;
		//console.log('no list detected')
	}
});
