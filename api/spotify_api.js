

// spotify api access methods here
var spotify_api = {

  //takes in a list of variables that we need from storage, recursively adds them to a dictionary that is then passed into the callback function
  getFromStorage : function(varNames, callback){
    spotify_api.getStorageHelper({}, varNames, callback)
  },

  //helper function for getFromStorage
  getStorageHelper : function(savedVars, varNames, callback){
    if(varNames.length > 1){
      chrome.storage.sync.get(varNames[0], function(result){
        savedVars[varNames[0]] = result[varNames[0]]
        varNames.shift()
        spotify_api.getStorageHelper(savedVars, varNames, callback)
      })
    }
    else if(varNames.length == 1){
      chrome.storage.sync.get(varNames[0], function(result){
        savedVars[varNames[0]] = result[varNames[0]]
        callback(savedVars)
      })
    }
  },

  login : function(show_dialog, callback){

    var scopes = 'playlist-modify-public playlist-modify-private';
    var redirect_url = chrome.identity.getRedirectURL() + 'callback';

    chrome.identity.launchWebAuthFlow({'url': 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + config.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + redirect_url +
    '&show_dialog=' + show_dialog
    , 'interactive': true},
    function(token_url) {
      //extract token from callback url
      if(token_url !== undefined) {
        token = token_url.match(/callback\?code\=([\S\s]*)/)[1]    //note: this will not work if we include state in login call
        chrome.storage.sync.set({['Authorization_code']: token}, function() {
          console.log('Storing Authorization_code value to be ' + token);
          callback()
        });
      }
      else {
        chrome.storage.sync.set({['Authorization_code']: 'undefined'}, function() {
          console.log('Storing Authorization_code value to be ' + 'undefined');
        });
      }
    });
  },


  // note: this function requires grantType to properly work.
  // If using authentication code, grant type is 'authorization_code'
  // Else if using refresh token, grant type is 'refresh_token'
  reqRefreshToken : function(){
    spotify_api.getFromStorage(['Authorization_code'], function(vars){
      var authToken = vars['Authorization_code']
      var xhttp = new XMLHttpRequest();
      xhttp.open('POST', 'https://accounts.spotify.com/api/token', true)
      xhttp.setRequestHeader('Authorization', `Basic ${btoa(`${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`)}`)
      xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
          var responseJSON = JSON.parse(this.responseText);
          chrome.storage.sync.set({'Access_token': responseJSON['access_token']}, function(){
            console.log('Storing Access_token value to be ' + responseJSON['access_token']);
            spotify_api.getUser()
          });
          // console.log('refresh_token: ' + responseJSON['refresh_token'])
          //we probably dont actually need this since it takes an hour to expire

        }else {

        }
      };
      xhttp.send('grant_type=authorization_code' + '&code=' + authToken + '&redirect_uri=' + chrome.identity.getRedirectURL() + 'callback');
    })
  },

  getUser : function(){
    spotify_api.getFromStorage(['Access_token'], function(vars){
      var access_token = vars['Access_token']

      var xhttp = new XMLHttpRequest();
      xhttp.open('GET', 'https://api.spotify.com/v1/me', true)
      xhttp.setRequestHeader('Accept', 'application/json')
      xhttp.setRequestHeader('Content-Type', 'application/json')
      xhttp.setRequestHeader('Authorization', 'Bearer ' + access_token)
      xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
          var responseJSON = JSON.parse(this.responseText);
          var id = responseJSON['id']
          chrome.storage.sync.set({['User_id']: id}, function() {
            console.log('Storing User_id value to be ' + id);
            spotify_api.createPlaylist()
          });

        }else {

        }
      };
      xhttp.send()
    })

  },

  createPlaylist : function(){
    spotify_api.getFromStorage(['User_id', 'Access_token', 'Artist_name', 'Tour_name', 'Playlist_public'], function(vars){
      var user_id = vars['User_id']
      var access_token = vars['Access_token']
      var artist_name = vars['Artist_name']
      var tour = vars['Tour_name']
      var playlist_public = vars['Playlist_public']

      //make request
      var xhttp = new XMLHttpRequest();
      xhttp.open('POST', 'https://api.spotify.com/v1/users/' + user_id + '/playlists', true)
      xhttp.setRequestHeader('Accept', 'application/json')
      xhttp.setRequestHeader('Content-Type', 'application/json')
      xhttp.setRequestHeader('Authorization', 'Bearer ' + access_token)
      xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && (this.status == 200 || this.status == 201)){
          var responseJSON = JSON.parse(this.responseText);
          var playlist_id = responseJSON['id']
          chrome.storage.sync.set({['Playlist_id']: playlist_id}, function(){
            console.log('Storing Playlist_id to be ' + playlist_id)
            // spotify_api.addSetToPlaylist()
            spotify_api.addSetToPlaylist()
          })

        } else {

        }
      };
      var body = {
        'name' : artist_name + ' - ' + tour,
        'public' : playlist_public,
        'description' : '[SAMPLE DESCRIPTION]'
      }
      xhttp.send(JSON.stringify(body))

    })
  },

  addSetToPlaylist : function(){

    spotify_api.getFromStorage(['Set', 'Artist_name'], function(vars){

      var set = vars['Set']
      var artist_name = vars['Artist_name']

      spotify_api.addSetHelper([], set, artist_name, function(id_list){
        //access from storage
        spotify_api.getFromStorage(['User_id', 'Access_token', 'Playlist_id'], function(vars){

          var user_id = vars['User_id']
          var access_token = vars['Access_token']
          var playlist_id = vars['Playlist_id']

          //make addTracks call
          var query = '?uris='
          for(var i = 0; i < id_list.length; i++){
            query += 'spotify:track:' + id_list[i]
            if(i != id_list.length-1){
              query += ','
            }
          }
          console.log(query)
          var xhttp = new XMLHttpRequest();
          xhttp.open('POST', 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '/tracks' + query, true)
          xhttp.setRequestHeader('Accept', 'application/json')
          xhttp.setRequestHeader('Content-Type', 'application/json')
          xhttp.setRequestHeader('Authorization', 'Bearer ' + access_token)
          xhttp.onreadystatechange = function(){
            if(this.readyState == 4){
              console.log(this.responseText)
            }
          };
          xhttp.send()
        })

      })
    })
  },

  addSetHelper : function(id_list, set, artist_name, callback){
    if(set.length > 0){
      //code from search method
      spotify_api.getFromStorage(['User_id', 'Access_token', 'Playlist_id'], function(vars){
        var user_id = vars['User_id']
        var access_token = vars['Access_token']
        var playlist_id = vars['Playlist_id']

        var xhttp = new XMLHttpRequest();
        var query = '?q=track:' + set[0]["name"].replace(' ', '%20') + '%20artist:' + artist_name.replace(' ', '%20') + '&type=track&limit=1'
        xhttp.open('GET', 'https://api.spotify.com/v1/search' + query, true)
        xhttp.setRequestHeader('Accept', 'application/json')
        xhttp.setRequestHeader('Content-Type', 'application/json')
        xhttp.setRequestHeader('Authorization', 'Bearer ' + access_token)
        xhttp.onreadystatechange = function(){
          if(this.readyState == 4){
            // console.log(this.responseText)
            var responseJSON = JSON.parse(this.responseText);
            try{
              var track_id = responseJSON['tracks']['items'][0]['id']
              var track_name = responseJSON['tracks']['items'][0]['name']
              // spotify_api.addTrackToPlaylist(track_id, user_id, playlist_id, access_token)
              id_list.push(track_id)
            }
            catch(e){
              console.log("Skipping this track")
            }
            set.shift()
            spotify_api.addSetHelper(id_list, set, artist_name, callback)

          }else {
            // console.log('failure\n' + this.responseText)
          }
        };
        xhttp.send()

      })
    }
    else{
      //the entire set should be processed by now
      callback(id_list)
    }

  }
}
