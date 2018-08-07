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
      console.log('token_url: ' + token_url);
      if(token_url !== undefined) {
        token = token_url.match(/callback\?code\=([\S\s]*)/)[1]    //note: this will not work if we include state in login call
        chrome.storage.sync.set({['Authorization_code']: token}, function() {
          console.log('Storing Authorization_code value to be ' + token);
          spotify_api.reqRefreshToken('authorization_code')
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
  reqRefreshToken : function(grantType){
    chrome.storage.sync.get('Authorization_code', function(result){
      var authToken = result['Authorization_code']
      var xhttp = new XMLHttpRequest();
      xhttp.open('POST', 'https://accounts.spotify.com/api/token', true)
      xhttp.setRequestHeader('Authorization', `Basic ${btoa(`${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`)}`)
      xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
          var responseJSON = JSON.parse(this.responseText);
          chrome.storage.sync.set({'Access_token': responseJSON['access_token']}, function(){
            console.log('Storing Access_token value to be ' + responseJSON['access_token']);
            spotify_api.getUser()     //TODO: FIX COMMAND FLOW. THIS IS NOT EFFICIENT LOL
          });
          // console.log('refresh_token: ' + responseJSON['refresh_token'])
          //we probably dont actually need this since it takes an hour to expire


        }else {
          console.log(this.responseText)
        }
      };
      xhttp.send('grant_type=' + grantType + '&code=' + authToken + '&redirect_uri=' + chrome.identity.getRedirectURL() + 'callback');
    })
  },

  getUser : function(){
    chrome.storage.sync.get('Access_token', function(result){
      var access_token = result['Access_token']
      console.log(access_token)
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
    //get stuff from storage
    chrome.storage.sync.get('User_id', function(result_user){
      var user_id = result_user['User_id']
      chrome.storage.sync.get('Access_token', function(result_access){
        var access_token = result_access['Access_token']
        chrome.storage.sync.get('Artist_name', function(result_artist){
          var artist_name = result_artist['Artist_name']
          chrome.storage.sync.get('Tour_name', function(result_tour){
            var tour = result_tour['Tour_name']
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
                  spotify_api.searchAndAddTracks()
                })

              } else {

              }
            };
            var body = {
              'name' : artist_name + ' - ' + tour,
              'public' : 'true',      //TODO: make this an option in the options page
              'description' : '[SAMPLE DESCRIPTION]'
            }
            xhttp.send(JSON.stringify(body))
          })
        })
      })
    })
  },

  searchAndAddTracks : function(){
    chrome.storage.sync.get('User_id', function(result_user){
      var user_id = result_user['User_id']
      chrome.storage.sync.get('Access_token', function(result_access){
        var access_token = result_access['Access_token']
        chrome.storage.sync.get('Playlist_id', function(result_playlist){
          var playlist_id = result_playlist['Playlist_id']
          chrome.storage.sync.get('Set', function(result_set){
            var set = result_set['Set']
            chrome.storage.sync.get('Artist_name', function(result_artist){
              var artist = result_artist['Artist_name']

              function sleep(milliseconds) {
                var start = new Date().getTime();
                for (var i = 0; i < 1e7; i++) {
                  if ((new Date().getTime() - start) > milliseconds){
                    break;
                  }
                }
              }

              //search portion, converts set to song ids
              var id_set = set.map(function(curr){
                var track_name = curr["name"]
                var xhttp = new XMLHttpRequest();
                var query = '?q=track:' + track_name.replace(' ', '%20') + '%20artist:' + artist.replace(' ', '%20') + '&type=track&limit=1'
                xhttp.open('GET', 'https://api.spotify.com/v1/search' + query, true)
                xhttp.setRequestHeader('Accept', 'application/json')
                xhttp.setRequestHeader('Content-Type', 'application/json')
                xhttp.setRequestHeader('Authorization', 'Bearer ' + access_token)
                xhttp.onreadystatechange = function(){
                  if(this.readyState == 4){
                    // console.log(this.responseText)
                    var responseJSON = JSON.parse(this.responseText);
                    var track_id = responseJSON['tracks']['items'][0]['id']
                    console.log(track_id)
                    return track_id
                  }
                }
                xhttp.send()
              })

              sleep(100000)
              console.log(id_set)


              //make addTracks call
              var query = '?uris='
              for(var i = 0; i < id_set.length; i++){
                query += 'spotify:track:' + id_set[i]
                if(i != id_set.length-1){
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
      })
    })
  }
}
