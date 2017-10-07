import React, { Component } from 'react';
import '../styles.css';

export default class App extends Component {
  state = {
    text: '',
    binary: '',
    b2t: '',
    image: '',
  };

  handleChange(e) {
    this.setState({ text: e.target.value });
  }

  textToBinary(txt) {
    let bin = '';
    txt.split('').forEach((c) => {
      bin += c.charCodeAt(0).toString(2) + ' ';
    });
    return bin;
  }

  binaryToText(bin) {
    let txt = '';
    bin.split(' ').forEach((b) => {
      txt += String.fromCharCode(parseInt(b, 2));
    });
    return txt;
  }

  uploadImage(e) {
    const self = this;
    e.preventDefault();
    const fr = new FileReader();
    const img = new Image();
    fr.onload = function(event) {
        try {
            img.onload = () => {
              self.setState({image: img});
            }
            img.src = event.target.result;

        } catch (err) {
            // uploadFailure(imgUploadArea);
            alert('File failed to load.')
        }
    }
    // Only accept png images and only use the first file if several are dragged.
    const file = e.dataTransfer.files[0];
    if (file.type === "image/png") {
        fr.readAsDataURL(file);
    } else {
        // uploadFailure(imgUploadArea);
        alert('Invalid format. Use a PNG image.');
    }
  }

  processTo() {
    this.setState({
      binary: this.textToBinary(this.state.text)
    });
  }

  processFrom() {
    this.setState({
      b2t: this.binaryToText(this.state.binary)
    });
  }

  render() {
    return (
      <div className="App">
        <h2>SecBO</h2>
        <div className="ImageUploader"
          onDrop={(e) => { this.uploadImage(e); }}
          onDragEnter={(e) => {e.preventDefault();}}
          onDragOver={(e) => {e.preventDefault();}}
        >
          <br />drag an image file here to import.
          <div className="ImagePreview" style={{backgroundImage: `url(${this.state.image.src})`}}></div>
        </div>
        <textarea rows="15" cols="100" value={ this.state.text } onChange={(e) => { this.handleChange(e); }}>
        </textarea>
      </div>
    );
  }
}
