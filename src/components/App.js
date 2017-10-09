import React, { Component } from 'react';
import '../styles.css';

export default class App extends Component {
  state = {
    text: '',
    binary: '1011011 1110011 1100101 1100011 1100010 1101111 1011101  1011011 101111 1110011 1100101 1100011 1100010 1101111 1011101',
    image: '',
  };

  handleChange(e) {
    this.setState({ 
      text: e.target.value, 
      binary: this.textToBinary(e.target.value)
    });
  }

  refesh() {
    this.setState({ 
      text: '',
      binary: '1011011 1110011 1100101 1100011 1100010 1101111 1011101  1011011 101111 1110011 1100101 1100011 1100010 1101111 1011101',
    });
  }

  textToBinary(txt) {
    let bin = '';
    txt = `[secbo]${txt}[/secbo]`;
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
    fr.onload = async (event) => {
        try {
          img.onload = async () => {
            this.refesh();
            await self.setState({image: img});
            // For some reason using self.updateCanvas() as callback of setState
            // didn't work. So using async/await instead. Weird.
            self.updateCanvas();
            self.readAlpha();
            self.getDownload();
          }
          img.src = event.target.result;
        } catch (err) {
          alert('File failed to load.')
        }
    }
    // Only accept png images and only use the first file if several are dragged.
    const file = e.dataTransfer.files[0];
    if (file.type === "image/png") {
        fr.readAsDataURL(file);
    } else {
        alert('Invalid format. Use a PNG image.');
    }
  }

  updateCanvas(img) {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.canvas.width = this.state.image.width;
    ctx.canvas.height = this.state.image.height;
    ctx.drawImage(this.state.image, 0, 0);
  }

  readAlpha() {
    const ctx = this.refs.canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    let bin = '';
    imageData.data.forEach((value, index) => {
      if (index > 0 && (index + 1) % 4 === 0 ) {
        if (value === 253) { 
          bin += ' ';
        }
        if (value === 254) { 
          bin += '1';
        }
        if (value === 255) {
          bin += '0';
        }
      }
    });
    
    const text = this.binaryToText(bin);
    if (text.startsWith('[secbo]')
      && text.includes('[/secbo]')) {
      this.setState({text: text.substring(7, text.length - 9)});
    }
  }

  writeAlpha() {
    const ctx = this.refs.canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (imageData.data.length / 4 >= this.state.binary.length) {
      this.state.binary.split('').forEach((digit, index) => {
        // This sets everything to 255, so no need to handle zeroes
        imageData.data[(index * 4) + 3] = 255;

        if (digit === '1') {
          imageData.data[(index * 4) + 3] = 254;
        }
        
        if (digit === ' ') {
          imageData.data[(index * 4) + 3] = 253;
        }
      });
      ctx.putImageData(imageData, 0, 0);
      this.getDownload();
    } else {
      alert('The image was too small to contain all this data.')
    }
  }

  getDownload() {
    this.setState({dl: this.refs.canvas.toDataURL("image/png")});
  }

  render() {
    const pixels = this.state.image.width * this.state.image.height;
    const free = pixels - this.state.binary.length;
    const freeColor = {};
    if (free < 0) {
      freeColor.color = 'red';
    } else {
      freeColor.color = 'black';
    }

    return (
      <div className="App">
        <h2>SecBO</h2>
        <div className="ImageUploader"
          onDrop={(e) => { this.uploadImage(e); }}
          onDragEnter={(e) => {e.preventDefault();}}
          onDragOver={(e) => {e.preventDefault();}}
        >
          <br />drag an image file here
          <div className="ImagePreview" style={{backgroundImage: `url(${this.state.image.src})`}}></div>
        </div>
        <div className="Info">
          { this.state.image && `${pixels} total pixels, ` } 
          <span style={freeColor}>
            { this.state.image && `${free} still available` }
          </span>
        </div>
        <textarea rows="15" cols="50" 
          value={ this.state.text } 
          onChange={(e) => { this.handleChange(e); }}>
        </textarea>
        <br />
        <canvas ref="canvas"></canvas>
        <br />
        {
          this.state.text.length > 0 
          && this.state.image.src
          && free >= 0
          && <a
            href={this.state.dl} 
            download="secbo.png" 
            onClick={() => { this.writeAlpha(); }}
          >download
          </a>
        }
      </div>
    );
  }
}
