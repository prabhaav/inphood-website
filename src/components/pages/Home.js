const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Jumbotron from 'react-bootstrap/lib/Jumbotron'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import UploadModal from '../layout/UploadModal'
import MarginLayout from '../../helpers/MarginLayout'
// import ImageGallery from 'react-image-gallery'
// import 'react-image-gallery/styles/css/image-gallery.css'
import Generator from '../../containers/GeneratorContainer'
import Results from '../../containers/ResultsContainer'
const Config = require('Config')
import browser from 'detect-browser'

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      showHelp: false,
      showBrowserWarning: true
    }
  }
  componentWillMount() {
    const {label, user, developer} = this.props.location.query
    if (label && label !== '') {
      const hUser = user ? user : Config.DEBUG ? 'test' : 'anonymous'
      this.props.getLabelId(hUser, label)
    }
    if (!developer) {
      ReactGA.initialize('UA-88850545-2', {
        debug: Config.DEBUG,
        titleCase: false,
        gaOptions: {
          userId: 'websiteUser'
        }
      })
    }
  }
  transitionToGenerator() {
    this.props.router.push('nutrition')
  }
  showHelp() {
    ReactGA.event({
      category: 'User',
      action: 'User interacted with learn more dialogue',
      nonInteraction: false
    })
    this.setState({showHelp: true})
  }
  render() {
    const {label, user} = this.props.location.query
    if (label && label !== '') {
      return <Results label={label} user={user} router={this.props.router}/>
    }
    else {
      // const images = [
      //   { 
      //     original: require('../../images/howto/recipe.jpg'),
      //     description: 'Write recipe details'
      //   },
      //   { 
      //     original: require('../../images/howto/mixers.jpg'),
      //     description: 'Mix ingredient quantites'
      //   },
      //   { 
      //     original: require('../../images/howto/result.jpg'),
      //     description: 'Share your results'
      //   }
      // ]
      const {showHelp, showBrowserWarning} = this.state
      const jumbo = (
      // showHelp ? (
      //   <ImageGallery
      //     items={images}
      //     slideInterval={2000}
      //     showThumbnails={false}
      //     showFullscreenButton={false}
      //     showPlayButton={false}
      //     showNav={false}
      //     autoPlay={true}
      //     infinite={false}
      //     disableArrowKeys={false}
      //     showBullets={true}
      //     onImageLoad={this.handleImageLoad}/>
      // ) : (
        <div>
          <h1 className="text-center">Make free nutrition labels!</h1>
          <h3 className="text-center">Understand what you are eating.</h3>
          <p className="text-right">
            {/*<Button bsStyle="default" onClick={() => this.showHelp()}>
              Learn more&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-bell"></Glyphicon>
            </Button>*/}
          </p>
        </div>
      )
      let browserWarning = null
      if (showBrowserWarning) {
        if (browser.name === "chrome" || browser.name === "firefox")
          browserWarning = null
        else
          browserWarning = (
            <Alert bsStyle="warning" onDismiss={() => this.setState({showBrowserWarning: false})}>
              <h4>inPhood works best with Chrome or Firebox!</h4>
            </Alert>
          )
      }
      return (
        <div>
          <Grid>
           {browserWarning}
            <Jumbotron style={{
              backgroundColor: 'MintCream', 
              borderWidth: 1,
              borderColor: 'black',
              borderStyle: 'solid',
              borderRadius: 5}}
            >
              {jumbo}
            </Jumbotron>
            <Row>
              <div className="text-center">
                <Button bsStyle="success" onClick={() => this.transitionToGenerator()}>
                  Get Started&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-flash"></Glyphicon>
                </Button>
              </div>
            </Row>
          </Grid>
        </div>
      )
    }
  }
}

