import React, { Component } from 'react';
import '../styles.css';

export default class App extends Component {
  state = {};

  componentDidMount() {
    this.refesh();
  }

  refesh(image = '', name = '') {
    this.setState({
      text: '',
      binary: '1011011 1110011 1100101 1100011 1100010 1101111 1011101  1011011 101111 1110011 1100101 1100011 1100010 1101111 1011101',
      image,
      name,
    });
  }

  handleChange(e) {
    this.setState({
      text: e.target.value,
      binary: this.textToBinary(e.target.value)
    });
  }

  textToBinary(txt) {
    return `[secbo]${txt}[/secbo]`.split('').map(c => c.charCodeAt(0).toString(2) + ' ').join('');
  }

  binaryToText(bin) {
    return bin.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
  }

  uploadImage(e) {
    e.preventDefault();
    const fr = new FileReader();
    const img = new Image();

    // Only accept png images and only use the first file if several are dragged.
    const file = e.dataTransfer.files[0];
    console.log(file.type, file);
    if (file.type === "image/png") {
        fr.readAsDataURL(file);
    } else {
        console.log('Invalid format. Use a PNG image.');
    }

    fr.onload = event => {
      try {
        img.onload = () => {
          this.refesh(img, file.name);
          this.updateCanvas();
          this.readAlpha();
          this.getDownload();
        }
        img.src = event.target.result;
      } catch (err) {
        console.log('File failed to load.');
      }
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
    const bin = imageData.data.reduce((acc, value, index) => {
      if (index > 0 && (index + 1) % 4 === 0 ) {
        if (value === 253) {
          return acc += ' ';
        }
        if (value === 254) {
          return acc += '1';
        }
        if (value === 255) {
          return acc += '0';
        }
      }
      return acc;
    }, '');

    const text = this.binaryToText(bin);

    if (text.startsWith('[secbo]') && text.substring(0, text.length - 1).endsWith('[/secbo]')) {
      this.setState({text: text.substring(7, text.length - 9)});
    }
  }

  writeAlpha() {
    const ctx = this.refs.canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (imageData.data.length / 4 >= this.state.binary.length) {
      // This sets everything to 255, so no need to handle zeroes
      imageData.data.forEach((datum, index) => {
        if (index > 0 && (index + 1) % 4 === 0 ) {
          imageData.data[index] = 255;
        }
      });

      this.state.binary.split('').forEach((digit, index) => {
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
      alert('The image was too small to contain all this data.');
    }
  }

  getDownload() {
    this.setState({dl: this.refs.canvas.toDataURL("image/png")});
  }

  render() {
    if (!this.state.binary) return <p>loading...</p>;

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
        {
          this.state.image
            ?
              <img
                className="ImagePreview"
                src={this.state.image.src}
                alt="thumbnail"
              />
            :
              <span>drag an image file here</span>
        }
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
            download={this.state.name}
            onClick={() => { this.writeAlpha(); }}
          >download
          </a>
        }
        {
          this.state.image.src
          && <button onClick={() => {this.refesh(); }}>clear</button>
        }
      </div>
    );
  }
}
