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
	chrome.storage.sync.get(['Title_option'], function(result) {
		console.log("Title_option is " + result.Title_option);
		if (result.Title_option === undefined)
			document.getElementById("TitleText").value = "{artist} - {tour}"
		else
			document.getElementById("TitleText").value = result.Title_option;
	})
}



function saveSettings() {
	var saveButton = document.getElementById("saveButton");
	saveButton.addEventListener('click', function() {
		var privacyCheck = document.getElementById("public").checked ? true:false;
		chrome.storage.sync.set({["Playlist_public"]: privacyCheck}, function() {
			console.log('Storing Playlist_public value to be ' + privacyCheck);
		})
		var titleOption = document.getElementById("TitleText").value;
		chrome.storage.sync.set({["Title_option"]: titleOption}, function() {
			console.log('Storing Title_option value to be ' + titleOption);
		})
		var titleParsed = parseTitle(titleOption);
		chrome.storage.sync.set({["Title_parsed"]: titleParsed}, function() {
			console.log('Storing Title_parsed value to be ' + titleParsed);
		})
	})
}

function parseTitle(titleString) {
	var arr = titleString.split(" ");
	console.log(arr);
	for (var i = 0; i < arr.length; i++) {
		switch(arr[i]) {
			case "{artist}": arr[i] = "artist_name"; break;
			case "{tour}": arr[i] = "Tour_name"; break;
			case "{location}": arr[i] = "location_venue"; break;
			case "{date}": arr[i] = "concert_date"; break;
			case "-": arr[i] = " \' - \' "; break;
			default: return "undefined"; 
		}
	}
	
	console.log(arr.join(''));
	return arr.join('');
	
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
