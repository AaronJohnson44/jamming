let accessToken;
const clientID = '4a3dd5dcf4a94c8dbd4e1a742c314160';
const redirectURI = 'https://Jamming.surge.sh';

const spotifyURI = 'https://accounts.spotify.com/authorize';

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
          const accessURI = `${spotifyURI}?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;

          window.location = accessURI;
        }
    },

    search(term) {
       fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
         headers: {Authorization: `Bearer ${accessToken}`}
       }).then(response => {
         if (response.ok) {
          return response.json();
        } else {
          throw new Error ('request failed!');
       }}, networkError => {
           console.log(networkError.message);
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
        const accessToken = this.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userID;

        return fetch(`https://api.spotify.com/v1/me`, {headers: headers}
        ).then(response => {
          if (response.ok){
          return response.json();
        } else {
          throw new Error ('request failed!');
        }}, networkError => {
          console.log(networkError.message);
        }).then(jsonResponse => {
          userID = jsonResponse.id;
          return fetch(`/v1/users/${userID}/playlists`, {
              headers: headers,
              method: 'POST',
              body: JSON.stringify({name: playlistName})
          }).then(response => response.json()
          ).then(jsonResponse => {
            const playlistID = jsonResponse.id;
            return fetch(`/v1/users/${userID}/playlists/${playlistID}/tracks`, {
              headers: headers,
              method: 'POST',
              body: JSON.stringify({uris: trackURIs})
            });
          });
        });
      }
};

export default Spotify;
