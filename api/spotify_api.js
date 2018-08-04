// spotify api access methods here
var spotify_api = {
  login : function(){
    console.log("pressed login");
    var scopes = 'user-read-private user-read-email';

    var redirect_url = chrome.identity.getRedirectURL() + 'callback';
    console.log(redirect_url)
    chrome.identity.launchWebAuthFlow(
      {'url': 'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + config.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + redirect_url +
      '&show_dialog=' + 'true'
      , 'interactive': true},
       function(token_url) {
          console.log(token_url)
      });

  }
}
