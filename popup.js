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
	spotify_api.getFromStorage(['Processing'], function(vars){
		var processing = vars['Processing']
		console.log("Processing: " + processing)
		if(processing == undefined || processing == "no"){
			chrome.storage.sync.set({["Processing"]: "yes"}, function(){
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", "https://api.setlist.fm/rest/1.0/setlist/" + id, true);
				xmlHttp.setRequestHeader("x-api-key", config.SETLISTFM_API_KEY);
				xmlHttp.setRequestHeader("Accept", "application/json");
				xmlHttp.onload = function (e) {
					if(xmlHttp.readyState === 4) {
						if (xmlHttp.status === 200){
							var responseJSON = JSON.parse(this.responseText);
							console.log(responseJSON);
							var artist = (responseJSON["artist"] ? responseJSON["artist"]["name"] : "undefined")
							var tour = (responseJSON["tour"] ? responseJSON["tour"]["name"] : "undefined")
							var venue = (responseJSON["venue"] ? responseJSON["venue"]["name"] : "undefined")
							var date = (responseJSON["eventDate"] ? responseJSON["eventDate"] : "undefined")
							//set processing
							var set = []
							if(responseJSON["sets"]["set"].length > 0){
								for(var i = 0; i < responseJSON["sets"]["set"].length; i++){
									responseJSON["sets"]["set"][i]["song"].forEach(function(element){
										//fixes for medleys
										var songs = element["name"].split("/")
										for(var x = 0; x < songs.length; x++){
											//leading space after "/" sometimes so...
											if(songs[x].search(" ") == 0){
												set.push({["name"]:songs[x].slice(1, songs[x].length)})
											}
											else{
												set.push({["name"]:songs[x]})
											}
										}
									})
								}
							}
							console.log(JSON.stringify(set))

							//end set processing
							chrome.storage.sync.set({["Artist_name"]: artist}, function(){
								chrome.storage.sync.set({["Tour_name"]: tour}, function(){
									chrome.storage.sync.set({["Location_venue"]: venue}, function(){
										chrome.storage.sync.set({["Concert_date"]: date}, function(){
											chrome.storage.sync.set({["Set"]: set}, function(){
												spotify_api.login(false, spotify_api.reqRefreshToken);
											})
										})
									})
								})
							})

						}
					}
				}
				xmlHttp.send(null);
			})
		}
	})
}
