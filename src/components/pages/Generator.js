const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Well from 'react-bootstrap/lib/Well'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Modal from 'react-bootstrap/lib/Modal'
import Image from 'react-bootstrap/lib/Image'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem'
import {parseRecipe, parseCaption} from '../../helpers/parseRecipe'
import Chip from 'react-toolbox/lib/chip'
import UploadModal from '../layout/UploadModal'
import TagController from '../controllers/TagController'
import * as constants from '../../constants/Constants'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Link} from 'react-router'
import ProgressBar from 'react-toolbox/lib/progress_bar'

import MarginLayout from '../../helpers/MarginLayout'
import {getTextLabel} from '../../helpers/TextLabel'
import Footer from '../../containers/FooterContainer'
import TopBar from '../../containers/TopBarContainer'
import Results from '../../containers/ResultsContainer'

import Login from '../../containers/LoginContainer'
import Recipe from '../../containers/RecipeContainer'
import Nutrition from '../../containers/NutritionContainer'
import Label from './NutritionEstimateJSX'
import Ingredients from './Ingredients'
import {getPossibleUnits, rationalToFloat} from '../../helpers/ConversionUtils'
import {IngredientModel} from '../models/IngredientModel'
import {IngredientControlModel} from '../models/IngredientControlModel'

const Config = require('Config')
import Fingerprint2 from 'fingerprintjs2'

export default class Generator extends React.Component {
  constructor() {
    super()
    this.state = {
      labelErrorFlag: false,
      showShareUrl: false,
      textLabel: false,
      copiedUrl: false,
      embed: false,
      loginActive: false
    }
  }
  componentWillMount() {
    this.props.modelReset()
    this.props.clearData()
    const {label, developer} = this.props.location.query
    if (label && label !== '') {
      this.props.getLabelId(label)
    }
    if (!developer) {
      Fingerprint2().get(function(result) {
        ReactGA.initialize('UA-88850545-2', {
          debug: Config.DEBUG,
          titleCase: false,
          gaOptions: {
            userId: result
          }
        })
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.labelErrorFlag) {
      this.setState({labelErrorFlag: false})
    }
    if (this.props.nutritionModelRed !== nextProps.nutritionModelRed) {
      this.setState({copiedUrl: false, showShareUrl: false})
    }
  }
  shareLabel(flag) {
    const {result} = this.props.loginRed
    if (result) {
      const {unusedTags, matchResultsModel} = this.props.tagModel
      const usefulIngredients = matchResultsModel.getNumberOfSearches() - unusedTags.length
      if (this.props.nutrition.key && usefulIngredients) {
        this.props.saveLabelToAws()
        ReactGA.event({
          category: 'Results',
          action: 'User sharing results',
          nonInteraction: false
        });
        this.setState({embed: flag, showShareUrl: true})
      }
      else {
        this.setState({labelErrorFlag: true, showShareUrl: false, copiedUrl: false})
      }
    }
    else
      this.props.initLogin()
  }
  shareLabelButton(fullPage) {
    if (fullPage) {
      const {embed, showShareUrl} = this.state
      return (
        <Dropdown id='shareDropdown'>
          <Dropdown.Toggle bsStyle='success'>
            <Glyphicon glyph="share-alt" />&nbsp;&nbsp;Generate Label
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <MenuItem
              eventKey='1'
              active={!embed && showShareUrl}
              onClick={() => this.shareLabel(false)}>
              Print Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-share"></Glyphicon>
            </MenuItem>
            <MenuItem
              eventKey='2'
              active={embed && showShareUrl}
              onClick={() => this.shareLabel(true)}>
              Embed Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-edit"></Glyphicon>
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      )
    }
    else
      return null
  }
  customLabelFlow(textLabel, labelType) {
    const {result} = this.props.loginRed
    if (result) {
      this.setState({textLabel})
      this.props.setLabelType(labelType)
      this.props.serializeToFirebase()
    }
    else
      this.props.initLogin()
  }
  customLabelButton(fullPage) {
    if (fullPage) {
      const {nutritionModel} = this.props.nutritionModelRed
      const labelType = nutritionModel.getLabelType()
      return (
        <Dropdown id='customLabelDropdown'>
          <Dropdown.Toggle bsStyle='warning'>
            <Glyphicon glyph="wrench" />&nbsp;&nbsp;Customize Label
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <MenuItem
              eventKey='1'
              active={labelType === IngredientModel.labelTypes.standard}
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.standard)}>
              Standard Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-grain"></Glyphicon>
            </MenuItem>
            <MenuItem
              eventKey='2'
              active={labelType === IngredientModel.labelTypes.complete}
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.complete)}>
              Complete Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-tree-deciduous"></Glyphicon>
            </MenuItem>
            <MenuItem
              eventKey='3'
              active={labelType === IngredientModel.labelTypes.micronut}
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.micronut)}>
              Micronutrient Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-stats"></Glyphicon>
            </MenuItem>
            {/*<MenuItem
              eventKey='4'
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.sugarmic)}>
              Sugar + Micro Label
            </MenuItem>*/}
            <MenuItem
              eventKey='5'
              active={labelType === IngredientModel.labelTypes.text}
              onClick={() => this.customLabelFlow(true, IngredientModel.labelTypes.text)}>
              Text Label&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-text-color"></Glyphicon>
            </MenuItem>
            {/*<MenuItem
              eventKey='6'
              onClick={() => this.customLabelFlow(false, IngredientModel.labelTypes.personal)}>
              Personal Label
            </MenuItem>*/}
          </Dropdown.Menu>
        </Dropdown>
      )
    }
    else
      return null
  }
  getInPhoodLogo() {
    return(
      <span>
        <span style={{color:'black'}}>i</span>
        <span style={{color:'green'}}>n</span>
        <span style={{color:'blue'}}>P</span>
        <span style={{color:'red'}}>h</span>
        <span style={{color:'green'}}>o</span>
        <span style={{color:'blue'}}>o</span>
        <span style={{color:'red'}}>d</span>
        .com
      </span>
    )
  }
  generateTextLabel(compositeModel) {
    ReactGA.event({
      category: 'Label',
      action: 'User viewing text label',
      nonInteraction: false
    });
    return (
      <Row>
        <pre id='nutrition-label' style={{background: 'white'}}>{getTextLabel(compositeModel)}</pre>
        <a href="http://www.inphood.com"
           className="text-center"
           style={{backgroundColor: 'white'}}>
          <h6 style={{marginBottom: 0}}>Estimated at {this.getInPhoodLogo()}</h6>
        </a>
      </Row>
    )
  }
  logoutUser() {
    this.props.modelReset()
    this.props.clearData()
    this.props.initLogout()
  }
  render() {
    const {label} = this.props.location.query
    if (label && label !== '') {
      return <Results label={label} router={this.props.router}/>
    } else {
      const logoutAlert = (this.props.loginRed.promptLogout) ? (
        <Alert bsStyle="danger" style={{marginTop: 10}} onDismiss={() => this.props.cancelLogout()}>
          <h4>Are you sure you want to logout?</h4>
          <h2><Button bsStyle="danger" onClick={() => this.logoutUser()}>Continue</Button></h2>
        </Alert>
      ) : null
      const {showHelp} = this.state
      const {nutritionModel} = this.props.nutritionModelRed
      const compositeModel = nutritionModel.getScaledCompositeIngredientModel()
      const {unusedTags, matchResultsModel}
        = this.props.tagModel
      const ml = new MarginLayout()
      const labelError = (this.state.labelErrorFlag) ? (
        <Alert bsStyle="warning">
          <h4>Please add ingredients to your label!</h4>
        </Alert>
      ) : null
      const {shareUrl, embedUrl, inProgress} = this.props.results
      const {embed, showShareUrl, copiedUrl, textLabel} = this.state
      const url = (embed) ? embedUrl : shareUrl
      const clipboard = (embed) ? (
        <Col xs={1}>
          <CopyToClipboard text={url}
            onCopy={() => this.setState({copiedUrl: true})}>
            <Button><Glyphicon glyph="glyphicon glyphicon-copy"></Glyphicon></Button>
          </CopyToClipboard>
          {copiedUrl ? <Row><span style={{color: 'red'}}>&nbsp;Copied.</span></Row> : null}
        </Col>
      ) : null
      const boxSize = (embed) ? 11 : 12
      const shareUrlBox = (url && showShareUrl && !inProgress) ? (
        <Row style={{marginBottom:0, marginTop:constants.VERT_SPACE}}>
          <Col xs={boxSize}>
            <Well style={{background: 'white'}}>{url}</Well>
          </Col>
          {clipboard}
        </Row>
      ) : null
      const urlProgress = (inProgress) ? (
        <Row className="text-center">
          <ProgressBar type='circular' mode='indeterminate' multicolor={true} />
        </Row>
      ) : null
      const ingredients = (<Ingredients nutritionModel={nutritionModel}/>)
      const label = (textLabel) ? this.generateTextLabel(compositeModel)
      : (
          <Label id='nutrition-label' ingredientComposite={compositeModel} ingredients={ingredients}/>
      )
      // TODO: if screen size <= xs, make the backgroundSize = cover (mobile first)
      const numSearches = matchResultsModel.getNumberOfSearches()
      const heightInVH = (numSearches < 4) ?
        150 :
        150 + 20 * (numSearches-3)
      const height = heightInVH.toString() + 'vh'
      const width = '100vw'
      const home = require('../../images/homeHD.jpg')
      const sectionStyle = {
        backgroundImage:`url(${home})`,
        backgroundRepeat:'no-repeat',
        backgroundSize:'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        width:{width},
        height:{height},
        'overflowX': 'hidden'
      }

      const fullPage = numSearches > 0
      const backgroundStyle = (fullPage) ?
        {backgroundColor:'rgba(255,255,255,0.85)',width:{width},height:{height}} :
        {backgroundColor:'rgba(255,255,255,0)',width:{width},height:{height}}

      const nutritionTitle = (fullPage) ?
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>Ingredient Settings</text>
          </Col>
        </Row> :
        null
      const nutrition = (fullPage) ? <Nutrition /> : null
      return (
        <Row style={sectionStyle}>
          <Row style={backgroundStyle}>
            <TopBar router={this.props.router} route={this.props.route} transparent={fullPage} />
            <Row>
              <Row style={{height:'40vh'}}>
                {ml.marginCol}
                <Col xs={ml.xsCol}
                     sm={ml.smCol}
                     md={ml.mdCol}
                     lg={ml.lgCol}>
                  <Row>
                    <Col xs={12} sm={6} md={7} lg={7}>
                      <Row>
                        {labelError}
                        {logoutAlert}
                        <Recipe router={this.props.router} route={this.props.route} nutritionModelRed={this.props.nutritionModelRed}/>
                        <Login />
                        {nutritionTitle}
                        {nutrition}
                      </Row>
                    </Col>

                    <Col xs={12} sm={6} md={5} lg={5}>
                      <Row style={{width:constants.LABEL_WIDTH, margin:'auto', marginTop:25}}>
                        <Col xs={6} className='text-left' style={{paddingLeft: 2}}>
                          {this.customLabelButton(fullPage)}
                        </Col>
                        <Col xs={6} className='text-right' style={{paddingRight: 2}}>
                          {this.shareLabelButton(fullPage)}
                        </Col>
                      </Row>

                      <Row style={{width:constants.LABEL_WIDTH, margin:'auto', marginTop:(constants.VERT_SPACE-2)}}>
                        <Col xs={12} style={{paddingLeft:2, paddingRight:2}}>
                          {urlProgress}
                          {shareUrlBox}
                        </Col>
                      </Row>

                      <Row style={{width:constants.LABEL_WIDTH, margin:'auto'}}>
                          {label}
                      </Row>

                      <Row style={{width:constants.LABEL_WIDTH, margin:'auto', marginTop:(constants.VERT_SPACE-2)}}>
                        <Well style={{background: 'white'}}>
                          Values above are rounded according to FDA
                          guidelines, which differ significantly from mathematical
                          rounding. Read more here:
                          <Link to="https://www.fda.gov/Food/GuidanceRegulation/GuidanceDocumentsRegulatoryInformation/LabelingNutrition/ucm064932.htm" target="_blank"> Labeling Nutrition</Link>
                        </Well>
                      </Row>

                      <Row style={{marginTop: 9}}>
                        <TagController
                          tags={unusedTags}
                          tagName={'Unfound Ingredients:'}
                          deletable={false}
                        />
                      </Row>

                    </Col>
                  </Row>
                </Col>
                {ml.marginCol}
              </Row>
              <Row style={{height:'32vh'}}/>
              <Footer fullPage={fullPage} router={this.props.router}/>
              <Row style={{height:'50vh'}}/>
            </Row>
            <Row>
              {ml.marginCol}
              <Col xs={ml.xsCol}
                   sm={ml.smCol}
                   md={ml.mdCol}
                   lg={ml.lgCol}>
              </Col>
              {ml.marginCol}
            </Row>
          </Row>
        </Row>
      )
    }
  }
}
