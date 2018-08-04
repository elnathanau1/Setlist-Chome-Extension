// spotify api access methods here
var spotify_api = {
  login : function(){
    console.log("pressed login");
    //TODO: Add scopes necessary
    var scopes = 'user-read-private user-read-email';

    var redirect_url = chrome.identity.getRedirectURL() + 'callback';

    // var show = true;
    // chrome.storage.sync.get(['showDialog'], function(result){
    //   console.log('Value for showDialog is currently ' + result.showDialog);
    //   show = result.showDialog;
    //  });
    chrome.identity.launchWebAuthFlow(
      {'url': 'https://accounts.spotify.com/authorize' +
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
