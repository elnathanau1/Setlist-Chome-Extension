//allows for options to change background image colors logic

'use strict';

// var dialog = authCode ? 'false' : 'true';
// chrome.storage.sync.set({'showDialog': dialog}, function() {
//   console.log('Storing showDialog value to be ' + dialog); 
// });
let page = document.getElementById('buttonDiv');
function createLoginButton() {
	let button = document.createElement('button');
	chrome.storage.sync.get(['AuthorizationCode'], function(result){
		console.log('Value for AuthorizationCode is currently ' + result.AuthorizationCode);
		if (result.AuthorizationCode === "undefined") {
			button.innerHTML = "Login to Spotify!"
		} else {
			button.innerHTML = "Switch User";
		}
		button.addEventListener('click', function() {
			var token = spotify_api.login()
			console.log(token)
		});
		page.appendChild(button);
	});
}
createLoginButton();

