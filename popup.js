//does the action for the popup

'use strict';

let createPlaylist = document.getElementById('setlistCreation');
var id = 0;
//gets current url and parses it to get SetlistID
var query = {active: true, currentWindow: true };
function callback(tabs) {
	var arr = tabs[0].url.split("-");
	id = arr[arr.length-1].split(".")[0];
}
chrome.tabs.query(query, callback);

createPlaylist.onclick = function(element) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", "https://api.setlist.fm/rest/1.0/setlist/" + id, true);
	xmlHttp.setRequestHeader("x-api-key", config.SETLISTFM_API_KEY);
	xmlHttp.setRequestHeader("Accept", "application/json");
	xmlHttp.onload = function (e) {
		if(xmlHttp.readyState === 4) {
			if (xmlHttp.status === 200){
				//TODO: THINK OF BETTER SYNC OPTION (or use promises omg)
				var responseJSON = JSON.parse(this.responseText);
				var artist = (responseJSON["artist"] ? responseJSON["artist"]["name"] : "")
				var tour = (responseJSON["tour"] ? responseJSON["tour"]["name"] : "")
				var set = responseJSON["sets"]["set"][0]["song"]
				chrome.storage.sync.set({["Artist_name"]: artist}, function(){
					chrome.storage.sync.set({["Tour_name"]: tour}, function(){
						chrome.storage.sync.set({["Set"]: set}, function(){
							spotify_api.login();
						})
					})
				})

			}
		}
	}
	xmlHttp.send(null);
}
