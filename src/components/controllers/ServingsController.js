const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import Input from 'react-toolbox/lib/input'
import Tooltip from 'react-toolbox/lib/tooltip'
const TooltipInput = Tooltip(Input)
import {rationalToFloat} from '../../helpers/ConversionUtils'

function isNumeric(n) {
  // Check to see if editBoxValue is a number--if so, return success because
  // rationalToFloat expects a string. This also helps to catch things like
  // "" and " " which evaluate to numbers (isNan===false) with the second
  // predicate checking for string type.
  if (!isNaN(n)) {
    if ((typeof n) !== "string") {
      return 'success'
    }
  }
  else {
    // Try and convert to a rational number from a variety of string
    // representations (i.e. "1/2" "024" etc.), failing that, return error.
    try {
      const value = rationalToFloat(n)
    } catch(err) {
      return 'error'
    }
  }
  return 'success'
}

function isValidString(s) {
  if (((typeof s) === 'string') && (s.trim().length > 0)) {
    return 'success'
  }
  else {
    return 'error'
  }
}

export default class ServingsController extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      servingSize: 2,
      servingUnit: 'plate',
      servingAmount: 'About, 1',
      servingRatio: 'Recipe'
    }
  }
  updateReduxStore(servingsControlModel) {
    this.props.setServingsControllerModel(servingsControlModel)
    this.props.nutritionModelSetServings(servingsControlModel)
    this.props.initSerializedData()
  }
  //
  //
  // Methods for servings size:
  //
  submitServingSize(event) {
    this.handleServingsSizeChange()
    event.preventDefault()
  }
  getServingsSizeValidationState() {
    return isNumeric(this.state.servingSize)
  }
  handleServingsSizeBlurred() {
    this.handleServingsSizeChange()
  }
  handleServingsSizeChange() {
    if (this.getServingsSizeValidationState() !== 'success') {
      return
    }
    else {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings size changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setServingSize(this.state.servingSize)
      this.updateReduxStore(servingsControlModel)
    }
  }
  //
  //
  // Methods for servings unit:
  //
  submitServingUnit(event) {
    this.handleServingUnitChange()
    event.preventDefault()
  }
  getServingUnitValidationState() {
    const {servingUnit} = this.state
    return isValidString(servingUnit)
  }
  handleServingUnitBlurred() {
    this.handleServingUnitChange()
  }
  handleServingUnitChange() {
    if (this.getServingUnitValidationState() !== 'success') {
      console.log('error')
      return 
    }
    else {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings unit changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setServingUnit(this.state.servingUnit)
      this.updateReduxStore(servingsControlModel)
    }
  }
  //
  //
  // Methods for servings ratio:
  //
  submitServingRatio(event) {
    this.handleServingsRatioChange()
    event.preventDefault()
  }
  getServingsRatioValidationState() {
    const {servingRatio} = this.state
    return isValidString(servingRatio)
  }
  handleServingsRatioBlurred() {
    this.handleServingsRatioChange()
  }
  handleServingsRatioChange() {
    if (this.getServingsRatioValidationState() !== 'success') {
      return
    }
    else {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings ratio changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setServingRatio(this.state.servingRatio)
      this.updateReduxStore(servingsControlModel)
    }
  }
  //
  //
  // Methods for servings amount:
  //
  submitServingsAmount(event) {
    this.handleServingsAmountChange()
    event.preventDefault()
  }
  getServingsAmountValidationState() {
    const {servingAmount} = this.state
    return isValidString(servingAmount)
  }
  handleServingsAmountBlurred() {
    this.handleServingsAmountChange()
  }
  handleServingsAmountChange() {
    if (this.getServingsAmountValidationState() !== 'success') {
      return
    }
    else {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Servings amount changed',
        nonInteraction: false,
      });
      const {servingsControlModel} = this.props.servings
      servingsControlModel.setServingAmount(this.state.servingAmount)
      this.updateReduxStore(servingsControlModel)
    }
  }
  render() {
    const {servingsControlModel} = this.props.servings
    return (
      <div>
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>Serving Settings</text>
          </Col>
        </Row>
        <div style={{borderWidth: 1,
                     borderColor: 'black',
                     borderStyle: 'solid',
                     borderRadius: 5,
                     padding: 10,
                     marginRight: 0,
                     marginLeft: 0}}>
          <Row>
           <Col xs={5} md={5} style={{paddingRigh: 10}}>
            <form
              onSubmit={(event) => this.submitServingSize(event)}
              autoComplete="off">
              <FormGroup style={{marginBottom: 0}}
                controlId='servingsControlUnit'
                validationState={this.getServingsSizeValidationState()}>
                <TooltipInput 
                  tooltip='Type your servings size here' 
                  tooltipPosition='bottom'
                  type='text' 
                  label='Serving Size' 
                  maxLength={50} 
                  value={this.state.servingSize}
                  onBlur={this.handleServingsSizeBlurred.bind(this)}
                  onChange={(value) => this.setState({servingSize: value})}
                />
              </FormGroup>
            </form>
           </Col>
           <Col xs={1} md={1} />
           <Col xs={5} md={5}>
            <form
              onSubmit={(event) => this.submitServingUnit(event)}
              autoComplete="off">
              <FormGroup style={{marginBottom: 0}}
                controlId='servingsControlUnit'
                validationState={this.getServingUnitValidationState()}>
                <TooltipInput 
                  tooltip='Type your servings units here' 
                  tooltipPosition='bottom'
                  type='text' 
                  label='Serving Units' 
                  maxLength={50} 
                  value={this.state.servingUnit}
                  onBlur={this.handleServingUnitBlurred.bind(this)}
                  onChange={(value) => this.setState({servingUnit: value})}
                />
              </FormGroup>
            </form>
           </Col>
          </Row>
          <Row>
            <Col xs={5} md={5} style={{paddingRight: 10}}>
              <form
                onSubmit={(event) => this.submitServingRatio(event)}
                autoComplete="off">
                <FormGroup
                  controlId='servingsControlRatio'
                  validationState={this.getServingsRatioValidationState()}>
                  <TooltipInput 
                    tooltip='Type your servings ratio here' 
                    tooltipPosition='bottom'
                    type='text' 
                    label='Serving Per' 
                    maxLength={50} 
                    value={this.state.servingRatio}
                    onBlur={this.handleServingsRatioBlurred.bind(this)}
                    onChange={(value) => this.setState({servingRatio: value})}
                  />
                </FormGroup>
              </form>
            </Col>
            <Col xs={1} md={1} />
            <Col xs={5} md={5}>
              <form
                onSubmit={(event) => this.submitServingsAmount(event)}
                autoComplete="off">
                <FormGroup
                  controlId='servingsControlAmount'
                  validationState={this.getServingsAmountValidationState()}>
                  <TooltipInput 
                    tooltip='Type your servings amount here' 
                    tooltipPosition='bottom'
                    type='text' 
                    label='Serving Amount' 
                    maxLength={50} 
                    value={this.state.servingAmount}
                    onBlur={this.handleServingsAmountBlurred.bind(this)}
                    onChange={(value) => this.setState({servingAmount: value})}
                  />
                </FormGroup>
              </form>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
