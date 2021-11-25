import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import axios from 'axios';
import Particles from "react-tsparticles";
// import Clarifai from 'clarifai'
import React, { Component } from 'react';
import Signin from './components/Signin/Signin';

// const serverUrl = process.env.SERVER_URL ? process.env.SERVER_URL : 'http://localhost:5000'
const serverUrl = process.env.SERVER_URL ? process.env.SERVER_URL : 'server-service'
// const workerURL = process.env.WORKER_URL ? process.env.WORKER_URL  : 'http://localhost:2000'
const workerURL = process.env.WORKER_URL ? process.env.WORKER_URL  : 'worker-service'
const default_pic = 'https://fitmodelsllc.com/wp-content/uploads/2016/11/Lisa-Smith-769x1024.jpg'
const initialState = {
  input : '',
  imageURL: default_pic,
  // imageURL: 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=987&q=80',
  box: {},
  route: 'signin',
  isSignedIn: false,
  signinfail: '',
  user: {
    id:'',
    name:'',
    email:'',
    entries: 0,
    joined: '',
    rank:'Not currently available'
  }
}

// const apps = new Clarifai.App({
//   apiKey: '6a2047e09be14d4f800765f2be520f2a'
// })

const particleOptions = {
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: false,
    },
    move: {
      direction: "none",
      enable: true,
      outMode: "bounce",
      random: false,
      speed: 3,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        value_area: 800,
      },
      value: 100,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      random: true,
      value: 3,
    },
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
};


class App extends Component {
  constructor() {
    super();
    this.state = initialState
  };

  // componentDidMount() {
  //   // const serverUrl = 'http://localhost:5000/'
  //   this.setState(Object.assign(this.state.user,{rank:'submit a picture to find out'}))
  //   console.log(this.state.user.rank)
  // }

  componentDidMount() {
    // const serverUrl = 'http://localhost:5000/'
    this.calculateFaceLocation2(default_pic)
  }

  loadUser = (data) => {
    
    this.setState({ user:
      {
      id:data.id,
      name:data.name,
      email:data.email,
      entries: data.entries,
      joined: data.joined,
      rank: 'loading rank...'
      }
    })
    this.updateRank()

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

  // updateNumber() {
  //   let imgEndpoint = serverUrl + '/api/imagecount'
  //   fetch(imgEndpoint,{
  //     method: 'put',
  //     headers: {'Content-Type':'application/json','Accept': 'application/json'},
  //     body: JSON.stringify({
  //         id: this.state.user.id
  //     })
  //   })
  //   .then(response  => response.json())
  //   .then(entries => {
  //     this.setState(Object.assign(this.state.user,{entries:entries})) 
  //   })
  // }

    updateNumber = async () => {
    let imgEndpoint =  '/api/imagecount'
    await axios.put(imgEndpoint, {
      id: this.state.user.id,
    })
    .then((response)  => response.data)
    .then(entries => {
      this.setState(Object.assign(this.state.user,{entries:entries})) 
    })
  }

  // updateRank() {
  //   let imgEndpoint = serverUrl + '/api/imagerank'
  //   fetch(imgEndpoint,{
  //     method: 'put',
  //     headers: {'Content-Type':'application/json','Accept': 'application/json'},
  //     body: JSON.stringify({
  //         id: this.state.user.id
  //     })
  //   })
  //   .then(response  => response.json())
    // .then(rank => {
    //   this.setState(Object.assign(this.state.user,{rank:rank})) 
    // })
  // }
  
  updateRank = async () => {
    let imgEndpoint =  '/api/imagerank'
    await axios.put(imgEndpoint, {
      id: this.state.user.id,
    })
    .then((response)  => response.data)
    .then(rank => {
      this.setState(Object.assign(this.state.user,{rank:rank})) 
    })
  }

// fix the attempt to make the server call the ML model later
  calculateFaceLocation3 = async (url) => { 
    let imgEndpoint = '/api/getbbox'
    await axios.put(imgEndpoint, {
      url: url
    })
      .then(response => response.data)
      .then(box => this.displayFaceBox(box))
      .catch(err => console.log(err))
      .then(this.updateNumber())
      .then(this.updateRank())
      .catch(err => console.log(err))
  }

  // calculateFaceLocation2(url) { 
  //   let endpoint = workerURL +'/worker/ml?url=' + url;
  //     fetch(endpoint).then(response => response.json())
  //     .then(boxes => boxes[0])
  //     .then(box => this.displayFaceBox(box))
  //     .catch(err => console.log(err))
  //     .then(this.updateNumber())
  //     .then(this.updateRank())
  //     .catch(err => console.log(err))
  // }

  calculateFaceLocation2 = async (url) => {
    let endpoint =  '/worker/ml?url=' + url;
    await axios.get(endpoint)
    .then((response) => response.data)
    .catch(err => console.log(err))
    .then(box => this.displayFaceBox(box))
    .catch(err => console.log(err))
    .then(this.updateNumber())
    .then(this.updateRank())
    .catch(err => console.log(err))
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  signinfailed = (status) => {
    this.setState({signinfail:status})
    
  }

  // onSubmitOld = () => {
  //   // console.log(this.state.input); //https://samples.clarifai.com/face-det.jpg
  //   this.setState({imageURL: this.state.input});
  //   apps.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
  //     .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
  //     .catch(err => console.log(err));
  // }
  onPictureSubmit = () => {
    // console.log(this.state.input); //https://samples.clarifai.com/face-det.jpg
    this.setState({imageURL: this.state.input});
    this.calculateFaceLocation2(this.state.input)
    // this.displayFaceBox(this.calculateFaceLocation2(this.state.input))
  }

  // route === 'signout'
  // ? this.setState(initialState)
  // : (
  //   route === 'home'
  //   ? this.setState({ isSignedIn: true })
  //   : this.setState({ route: route })
  // )

  onRouteChange = (route) => {
    route === 'home'
    ? this.setState({ isSignedIn: true })
    : this.setState(initialState);
    this.setState({ route: route });
  }
  render() {
    let { isSignedIn, imageURL,  box } = this.state
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
              <Rank name = {this.state.user.name} rank ={this.state.user.rank} entries={this.state.user.entries}/>
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSummit={this.onPictureSubmit}/>
              <FaceRecognition box={box} imageURL={imageURL}/>
          </div>   
          : (
            this.state.route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} signinfailed={this.signinfailed} signinfail={this.state.signinfail} /> 
            : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
        }
      </div>
    );
  }
}

export default App;
