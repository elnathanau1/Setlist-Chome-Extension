//does the action for the popup

'use strict';

let createPlaylist = document.getElementById('setlistCreation');
createPlaylist.onclick = function(element) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", "https://api.setlist.fm/rest/1.0/setlist/3beb7cb4", true);
	xmlHttp.setRequestHeader("x-api-key", config.SETLISTFM_API_KEY);
	xmlHttp.onload = function (e) {
		if(xmlHttp.readyState === 4) {
			if (xmlHttp.status === 200) {
				console.log(xmlHttp.responseText);
			}
		}
	}
	xmlHttp.send(null);
}