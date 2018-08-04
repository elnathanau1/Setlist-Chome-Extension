// spotify api access methods here
var spotify_api = {
  login : function(){
    console.log("pressed login");
    //TODO: Add scopes necessary
    var scopes = 'user-read-private user-read-email';

    var redirect_url = chrome.identity.getRedirectURL() + 'callback';
    chrome.identity.launchWebAuthFlow(
      {'url': 'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + config.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + redirect_url +
      '&show_dialog=' + 'true'
      , 'interactive': true},
       function(token_url, callback) {
         //extract token from callback url
         var token = token_url.match(/callback\?code\=([\S\s]*)/)[1]    //note: this will not work if we include state in login call
         return token   //TODO: currently pulling this, but not returning
      });

  }
}
