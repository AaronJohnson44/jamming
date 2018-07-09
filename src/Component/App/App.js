import React from 'react';
import './App.css';

import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);

    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: []
    }
  }

    addTrack(track){
      if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
        return;
      } else {
        let currentTrack = this.state.playlistTracks;
        currentTrack.push(track);
        this.setState({playlistTracks: currentTrack});
      }
    }

    removeTrack(track) {
      this.state.playlistName.filter(tracks => tracks.id !== track.id);
      this.setState({playlistTracks: track})
    }

    updatePlaylistName(name){
      this.setState({playlistName: name});
    }

    savePlaylist(){
      let trackURIs = this.state.playlistTracks.map(track => {
        return track.uri;
      });
      if(this.state.playlistTracks.length && this.state.playlistName) {
        Spotify.savePlaylist(this.state.playlistName, trackURIs)
      } else{
        this.setState({
          playlistName: 'New Playlist',
          playlistTracks: []
        })
      }
    };

    search(term){
      Spotify.search(term).then(tracks => {
        this.setState({searchResults: tracks});
      });
    }

  render () {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch = {this.search} />
          <div className="App-playlist">
            <SearchResults searchResults = {this.state.searchResults}
                           onAdd={this.addTrack}
                           onNameChange = {this.updatePlaylistName} />
            <Playlist playlistName = {this.state.playlistName}
                      playlistTracks = {this.state.playlistTracks}
                      onNameChange = {this.updatePlaylistName}
                      onRemove = {this.removeTrack}
                      onSave = {this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
