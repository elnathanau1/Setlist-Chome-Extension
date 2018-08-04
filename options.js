//allows for options to change background image colors logic

'use strict';

let page = document.getElementById('buttonDiv');
const kButtonColors = ['#3aa757', '#e8543c', '#f9bb2d', '#4688f1'];
function constructOptions(kButtonColors) {
	for (let item of kButtonColors) {
		let button = document.createElement('button');
		button.style.backgroundColor = item;
		button.addEventListener('click', function() {
			spotify_api.login()

			// window.open('https://accounts.spotify.com/authorize' +
			// '?response_type=code' +
			// '&client_id=' + config.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
			// '&redirect_uri=' + encodeURIComponent(chrome.identity.getRedirectUrl()));
			// chrome.storage.sync.set({color: item}, function() {
			// 	console.log('color is ' + item);
			// })
		});
		page.appendChild(button);
	}
}
constructOptions(kButtonColors);
