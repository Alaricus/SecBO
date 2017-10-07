import React, { Component } from 'react';
import '../styles.css';

export default class App extends Component {
  state = {
    text: "",
    binary: "",
  }

  handleChange(e) {
    let binary = '';
    e.target.value.split('').forEach((char) => {
      binary += char.charCodeAt(0).toString(2) + ' ';
    });
    this.setState({ 
      text: e.target.value,
      binary: binary,
    });
  }

  render() {
    return (
      <div className="App">
        <h2>SecBO</h2>
        <div className="ImageLoader">
          drag image here or click to load
        </div>
        <textarea rows="15" cols="100" value={ this.state.text } onChange={(e) => { this.handleChange(e); }}>
        </textarea>
        <p>{ this.state.binary }</p>
      </div>
    );
  }
}
