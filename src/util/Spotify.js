let accessToken;

const spotifyURI = 'https://accounts.spotify.com/authorize';
const spotifyAPI = 'https://api.spotify.com/v1/'

const clientID = '4a3dd5dcf4a94c8dbd4e1a742c314160';
const redirectURL = 'https://Jamming.surge.sh';

const Spotify = {
  getAccessToken() {
      if (accessToken) {
          return accessToken;
      }

      const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
      const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

      if (accessTokenMatch && expiresInMatch) {
          accessToken = accessTokenMatch[1];
          const expiresIn = Number(expiresInMatch[1]);
          window.setTimeout(() => accessToken = '', expiresIn * 1000);
          window.history.pushState('Access Token', null, '/');
          return accessToken;
      } else {
          const accessURL = `${spotifyURI}?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURL}`;

          window.location = accessURL;
        }
    },

    search(term) {
       fetch(`${spotifyAPI}/search?type=track&q=${term}`, {
         headers: {Authorization: `Bearer ${accessToken}`}
       }).then(response => {
          return response.json();
       }).then(jsonResponse => {
          if (!jsonResponse.tracks) {
            return [];
          }
          return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }));
        });
      },

    savePlaylist(playlistName, trackURIs) {
      if (!playlistName || trackURIs.length) {
        return;
      }

        const accessToken = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userId;

        return fetch(`${spotifyAPI}/me`, {headers: headers}
    ).then(response => response.json()
    ).then(jsonResponse => {
        userId = jsonResponse.id;
          return fetch(`${spotifyAPI}/users/${userId}/playlists`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({playlistName: playlistName
          })
        }).then(response => response.json()
    ).then(jsonResponse => {
        const playlistId = jsonResponse.id;
        return fetch(`${spotifyAPI}/users/${userId}/playlists/${playlistId}/tracks`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({uris: trackURIs})
        });
      });
    });
  }
};

export default Spotify;
