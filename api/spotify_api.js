// spotify api access methods here
var spotify_api = {
  reqRefreshToken : function(authToken){
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'https://accounts.spotify.com/api/token', true)
    xhttp.setRequestHeader("Authorization", `Basic ${btoa(`${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`)}`)
    xhttp.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        var responseJSON = JSON.parse(this.responseText);
        // var spotifyWrapper = new SpotifyWebApi();
        console.log("access_token: " + responseJSON["access_token"])
        console.log("token_type: " + responseJSON["token_type"])
        console.log("scope: " + responseJSON["scope"])
        console.log("expires_in: " + responseJSON["expires_in"])
        console.log("refresh_token: " + responseJSON["refresh_token"])

      }else {
        console.log(this.responseText)
      }
    };
    xhttp.send("grant_type=authorization_code&code=" + authToken + "&redirect_uri=" + chrome.identity.getRedirectURL() + 'callback');
  },

  login : function(){
    // var show = true;
    // chrome.storage.sync.get(['showDialog'], function(result){
    //   console.log('Value for showDialog is currently ' + result.showDialog);
    //   show = result.showDialog;
    //  });

    var scopes = 'playlist-modify-public playlist-modify-private';
    var redirect_url = chrome.identity.getRedirectURL() + 'callback';

    chrome.identity.launchWebAuthFlow({'url': 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + config.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + redirect_url +
    '&show_dialog=' + true
    , 'interactive': true},
    function(token_url) {
      //extract token from callback url
      console.log("token_url: " + token_url);
      if(token_url !== undefined) {
        token = token_url.match(/callback\?code\=([\S\s]*)/)[1]    //note: this will not work if we include state in login call
        chrome.storage.sync.set({'AuthorizationCode': token}, function() {
          console.log('Storing AuthorizationCode value to be ' + token);
          spotify_api.reqRefreshToken(token)
          return token   //TODO: currently pulling this, but not returning
        });
      }
      else {
        chrome.storage.sync.set({'AuthorizationCode': "undefined"}, function() {
          console.log('Storing AuthorizationCode value to be ' + "undefined");
        });
      }
    });
  }
}
