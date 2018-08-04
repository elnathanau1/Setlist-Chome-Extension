//allows for options to change background image colors logic

'use strict';

let page = document.getElementById('buttonDiv');
function createLoginButton() {
	let button = document.createElement('button');
	button.innerHTML = "Login to Spotify!"
	button.addEventListener('click', function() {
			var token = spotify_api.login()
			console.log(token)
		});
		page.appendChild(button);
}
createLoginButton();

//TODO: Check if already logged in and display an option to log out
