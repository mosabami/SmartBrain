import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Particles from 'react-particles-js';
// import Clarifai from 'clarifai'
import React, { Component } from 'react';
import Signin from './components/Signin/Signin';

// const apps = new Clarifai.App({
//   apiKey: '6a2047e09be14d4f800765f2be520f2a'
// })

const particleOptions = {
  particles: {
    number: {
      value:215,
      density: {
        enable: true,
        value_area: 800
      }
    },
    line_linked: {
      enable_auto : true
    }
  },
  interactivity: {
    detect_on: "window",
    events: {
      onhover: {
        enable: true,
        mode: "repulse"
      },
      onclick: {
        enable: true,
        mode: "push"
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.particleOptions = particleOptions;
    this.state = {
      input : 'e',
      imageURL: 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=987&q=80',
      box: {},
      route: 'signin',
      isSignedIn: 'false',

    }
  };
  componentDidMount() {
    const serverUrl = process.env.SERVER_URL ? process.env.SERVER_URL : 'http://localhost:5000/'
    fetch(serverUrl)
    .then(response => response.json())
    .then(data => console.log(data))
  }
  
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    let image = document.getElementById('inputImage');
    let width = Number(image.width);
    let height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
    // return {
    //   leftCol: 96, // x
    //   topRow: 251, //y
    //   rightCol: 500-398  , //width - (x+w)
    //   bottomRow: 752-647 // height - (y+h)
    // }
  }

  calculateFaceLocation2(url) { 
    const endpoint = process.env.WORKER_URL ? process.env.WORKER_URL + url : 'http://localhost:2000/hello?url=' + url;
      fetch(endpoint).then(response => response.json())
      .then(boxes => boxes[0])
      .then(box => this.displayFaceBox(box))
      .catch(err => console.log(err))
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  // onSubmitOld = () => {
  //   // console.log(this.state.input); //https://samples.clarifai.com/face-det.jpg
  //   this.setState({imageURL: this.state.input});
  //   apps.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
  //     .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
  //     .catch(err => console.log(err));
  // }
  onSubmit = () => {
    // console.log(this.state.input); //https://samples.clarifai.com/face-det.jpg
    this.setState({imageURL: this.state.input});
    this.calculateFaceLocation2(this.state.input)
    // this.displayFaceBox(this.calculateFaceLocation2(this.state.input))
  }

  onRouteChange = (route) => {
    this.setState({ route: route });
    route === 'home'
    ? this.setState({ isSignedIn: true })
    : this.setState({ isSignedIn: false })
  }
  render() {
    let { isSignedIn, imageURL, route, box, particleOptions } = this.state
    return (
      <div className="App">
        <Particles className='particles'
          params={particleOptions}
          // style={{
          //   width: '100%',
          //   backgroundImage: `url(${logo})` 
          // }}
        />
        <Navigation onRouteChange = {this.onRouteChange} isSignedIn = {isSignedIn}/>
        {
          this.state.route === 'home' 
          ? <div>
              <Logo/>
              <Rank />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSummit={this.onSubmit}/>
              <FaceRecognition box={box} imageURL={imageURL}/>
          </div>   
          : (
            this.state.route === 'signin'
            ? <Signin onRouteChange={this.onRouteChange}/> 
            : <Register onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}

export default App;
