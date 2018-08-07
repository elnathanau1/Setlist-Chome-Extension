'use strict';

function setPlaylistPrivacy() {
	//saves and displays previous selections
	chrome.storage.sync.get(['Playlist_public'], function(result) {
		console.log("Playlist_public is " + result.Playlist_public);
		if (result.Playlist_public === "undefined" || result.Playlist_public === true)
			document.getElementById("public").checked = true;
		else
			document.getElementById("private").checked = true;
	})
}



function saveSettings() {
	var saveButton = document.getElementById("saveButton");
	saveButton.addEventListener('click', function() {
		var privacyCheck = document.getElementById("public").checked ? true:false;
		chrome.storage.sync.set({["Playlist_public"]: privacyCheck}, function() {
			console.log('Storing Playlist_public value to be ' + privacyCheck);
		})
	})
}

let page = document.getElementById('buttonDiv');
function createLoginButton() {
	let button = document.createElement('button');
	chrome.storage.sync.get(['AuthorizationCode'], function(result){
		// console.log('Value for AuthorizationCode is currently ' + result.AuthorizationCode);
		if (result.AuthorizationCode === "undefined") {
			button.innerHTML = "Login to Spotify!"
		} else {
			button.innerHTML = "Switch User";
			//TODO: Make this a separate button that clears the authorization code, stuff in storage
		}
		button.addEventListener('click', function() {
			var token = spotify_api.login()
		});
		page.appendChild(button);
	});
}
createLoginButton();
setPlaylistPrivacy();
saveSettings();
