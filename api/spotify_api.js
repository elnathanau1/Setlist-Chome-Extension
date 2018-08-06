// spotify api access methods here
var spotify_api = {
  login : function(){

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
          spotify_api.reqRefreshToken(token, "authorization_code")
          return token   //TODO: currently pulling this, but not returning
        });
      }
      else {
        chrome.storage.sync.set({'AuthorizationCode': "undefined"}, function() {
          console.log('Storing AuthorizationCode value to be ' + "undefined");
        });
      }
    });
  },

  // note: this function requires grantType to properly work.
  // If using authentication code, grant type is 'authorization_code'
  // Else if using refresh token, grant type is 'refresh_token'
  reqRefreshToken : function(authToken, grantType){
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'https://accounts.spotify.com/api/token', true)
    xhttp.setRequestHeader("Authorization", `Basic ${btoa(`${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`)}`)
    xhttp.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        var responseJSON = JSON.parse(this.responseText);
        // var spotifyWrapper = new SpotifyWebApi();
        //TODO: Save these into storage
        console.log("access_token: " + responseJSON["access_token"])
        console.log("token_type: " + responseJSON["token_type"])
        console.log("scope: " + responseJSON["scope"])
        console.log("expires_in: " + responseJSON["expires_in"])
        console.log("refresh_token: " + responseJSON["refresh_token"])

        // spotify_api.getUser(responseJSON["access_token"])
        spotify_api.searchTrack("Do You Want Me (Dead?)", "All Time Low", responseJSON["access_token"])

      }else {
        console.log(this.responseText)
      }
    };
    xhttp.send("grant_type=" + grantType + "&code=" + authToken + "&redirect_uri=" + chrome.identity.getRedirectURL() + 'callback');
  },

  getUser : function(access_token){
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'https://api.spotify.com/v1/me', true)
    xhttp.setRequestHeader("Accept", "application/json")
    xhttp.setRequestHeader("Content-Type", "application/json")
    xhttp.setRequestHeader("Authorization", "Bearer " + access_token)
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        var responseJSON = JSON.parse(this.responseText);
        var id = responseJSON["id"]   //TODO: Store this
        // spotify_api.createPlaylist(id, access_token)


      }else {
        console.log("failure\n" + this.responseText)
      }
    };
    xhttp.send()

  },

  createPlaylist : function(id, access_token){
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'https://api.spotify.com/v1/users/' + id + '/playlists', true)
    xhttp.setRequestHeader("Accept", "application/json")
    xhttp.setRequestHeader("Content-Type", "application/json")
    xhttp.setRequestHeader("Authorization", "Bearer " + access_token)
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && (this.status == 200 || this.status == 201)){
        console.log("created playlist!")

      }else {
        console.log("could not create playlist")
      }
    };
    var body = {
      'name' : 'Extension Test',
      'public' : 'true',      //TODO: make this an option in the options page
      'description' : 'This is a sample description'
    }
    xhttp.send(JSON.stringify(body))
  },

  searchTrack : function(track_name, artist, access_token){
    var xhttp = new XMLHttpRequest();
    var query = '?q=track:' + track_name.replace(" ", "%20") + "%20artist:" + artist.replace(" ", "%20") + "&type=track&limit=1"
    xhttp.open('GET', 'https://api.spotify.com/v1/search' + query, true)
    xhttp.setRequestHeader("Accept", "application/json")
    xhttp.setRequestHeader("Content-Type", "application/json")
    xhttp.setRequestHeader("Authorization", "Bearer " + access_token)
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4){
        // console.log(this.responseText)
        var responseJSON = JSON.parse(this.responseText);
        console.log(responseJSON["tracks"]["items"][0]["id"])
        console.log(responseJSON["tracks"]["items"][0]["name"])


      }else {
        // console.log("failure\n" + this.responseText)
      }
    };
    xhttp.send()
  }
}
