const React = require('react')
// import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Button from 'react-bootstrap/lib/Button'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import 'react-widgets/lib/less/react-widgets.less'
import Dropdownlist from 'react-widgets/lib/Dropdownlist'
import {IngredientModel} from '../models/IngredientModel'
import {isNumeric, rationalToFloat} from '../../helpers/ConversionUtils'
import renderHTML from 'react-render-html'

const ListItem = React.createClass({
  render() {
    const {item} = this.props
    return <span>{renderHTML(item)}</span>
  }
})

export default class IngredientController extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editBoxValue: 1
    }
  }
  componentWillMount() {
    const {id} = this.props
    let ingredientControlModel = this.props.ingredientControlModelRed.ingredientControlModels[id]
    const editBoxValue = ingredientControlModel.getEditBoxValue()
    this.setState({editBoxValue})
  }
  submitNewValue(event) {
    this.handleEditBoxValueChange()
    event.preventDefault()
  }
  onEditBoxBlurred() {
    this.handleEditBoxValueChange()
  }
  getValidationState() {
    return isNumeric(this.state.editBoxValue)
  }
  handleEditBoxValueChange() {
    if (isNumeric(this.state.editBoxValue) !== 'success') {
      return
    }
    else {
      const value = rationalToFloat(this.state.editBoxValue)
      if (value) {
        const {id} = this.props
        // ReactGA.event({
        //   category: 'Ingredient Model',
        //   action: 'Ingredient unit changed',
        //   nonInteraction: false,
        //   label: id
        // });
        let ingredientControlModel = this.props.ingredientControlModelRed.ingredientControlModels[id]
        ingredientControlModel.setEditBoxValue(value)
        const units = ingredientControlModel.getDropdownUnitValue()
        this.updateReduxStore(id, value, units)
      }
      else
        return
    }
  }
  handleUnitDropdownChange(units) {
    const {id} = this.props
    const ingredientControlModel = this.props.ingredientControlModelRed.ingredientControlModels[id]
    const value = ingredientControlModel.getEditBoxValue()
    // ReactGA.event({
    //   category: 'Nutrition Mixer',
    //   action: 'User changed units for ingredient',
    //   nonInteraction: false,
    //   label: id
    // });
    this.updateReduxStore(id, value, units)
  }
  handleMatchDropdownChange(value) {
    const {id} = this.props
    const {matchResultsModel} = this.props.tagModel
    const {nutritionModel} = this.props.nutritionModelRed

    const tag = nutritionModel.getIngredientModel(id).getTag()
    const searchResult = matchResultsModel.getSearchResultByDesc(tag, value)

    if ((searchResult.getStandardRefDataObj() === undefined) &&
        (searchResult.getBrandedDataObj() === undefined)) {
      // Firebase lazy fetch
      // ReactGA.event({
      //   category: 'Nutrition Mixer',
      //   action: 'User triggered dropdown lazy firebase fetch',
      //   nonInteraction: false,
      //   label: tag
      // });
      let index = matchResultsModel.getIndexForDescription(tag, value)
      this.props.lazyFetchFirebase(value, id, tag, searchResult.getNdbNo(), index)
    }
    else {
      this.props.completeMatchDropdownChange(id, value)
    }
  }
  updateReduxStore(id, value, units) {
    let ingredientControlModel = this.props.ingredientControlModelRed.ingredientControlModels[id]
    ingredientControlModel.setEditBoxValue(value)
    ingredientControlModel.setDropdownUnitValue(units)
    this.props.updateIngredientControlModel(id, ingredientControlModel)
    this.props.nutritionModelScaleIng(id, value, units)
    this.props.serializeToFirebase()
  }
  render() {
    const {id, nutritionModel} = this.props
    const ingredientControlModel = this.props.ingredientControlModelRed.ingredientControlModels[id]
    const formControlId = id + "FormControlId"
    const {editBoxValue} = this.state
    return (
      <div ref={id}>
        <Row style={{paddingRight:15}}>
          <Col xs={2} md={2} style={{paddingRight: 5}}>
            <form
              onSubmit={(event) => this.submitNewValue(event)}
              autoComplete="off">
              <FormGroup
                style={{marginBottom: 0}}
                controlId={formControlId}
                validationState={this.getValidationState()}>
                <FormControl
                  componentClass="input"
                  className="text-right"
                  type="text"
                  label="Text"
                  value={editBoxValue}
                  onBlur={this.onEditBoxBlurred.bind(this)}
                  onChange={(event) => this.setState({editBoxValue: event.target.value})}/>
              </FormGroup>
            </form>
          </Col>
          <Col xs={3} md={3} style={{paddingLeft: 0, paddingRight: 5}}>
            <Dropdownlist
              data={ingredientControlModel.getDropdownUnits()}
              value={ingredientControlModel.getDropdownUnitValue()}
              onChange={this.handleUnitDropdownChange.bind(this)}/>
          </Col>
          <Col xs={7} md={7} style={{paddingLeft: 0, paddingRight: 0}}>
            <Dropdownlist
              data={ingredientControlModel.getDropdownMatches()}
              value={ingredientControlModel.getDropdownMatchValue()}
              onChange={this.handleMatchDropdownChange.bind(this)}
              itemComponent={ListItem}/>
          </Col>
        </Row>
      </div>
    )
  }
}
