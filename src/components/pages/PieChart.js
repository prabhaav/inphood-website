const React = require('react')
// import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Modal from 'react-bootstrap/lib/Modal'
import Legend from 'recharts/lib/component/Legend'
import RadialBar from 'recharts/lib/polar/RadialBar'
import RadialBarChart from 'recharts/lib/chart/RadialBarChart'
import {Link} from 'react-router'

import {IconButton} from 'react-toolbox/lib/button'
import Tooltip from 'react-toolbox/lib/tooltip'
const TooltipButton = Tooltip(IconButton)

const style = {
  top: 0,
  left: 350,
  lineHeight: '24px'
}

function getScaledValue(value, scale) {
  return (value * scale).toFixed(2)
}

export default class NutritionChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showNutritionModal: false
    }
  }
  getLabelData(ingredientModel, scale) {
    const cholestrol = getScaledValue(ingredientModel.getCholestorol(), scale)
    const protein = getScaledValue(ingredientModel.getTotalProteinPerServing(), scale)
    const carbs = getScaledValue(ingredientModel.getTotalCarbohydratePerServing(), scale)
    const fat = getScaledValue(ingredientModel.getTotalFatPerServing(), scale)
    const sodium = getScaledValue(ingredientModel.getSodium()/1000, scale)  // /1000: convert mg to g
    const sugar = getScaledValue(ingredientModel.getSugars(), scale)
    const fiber = getScaledValue(ingredientModel.getDietaryFiber(), scale)
    return [
      {name: 'Protein ('+protein+'g)', uv: protein, fill: '#8dd1e1'},
      {name: 'Carbs ('+carbs+'g)', uv: carbs, fill: '#8884d8'},
      {name: 'Fat ('+fat+'g)', uv: fat, fill: '#00C49F'},
      {name: 'Fiber ('+fiber+'g)', uv: fiber, fill: 'teal'},
      {name: 'Cholestrol ('+cholestrol+'g)', uv: cholestrol, fill: '#FFBB28'},
      {name: 'Sodium ('+sodium+'g)', uv: sodium, fill: '#FF8042'},
      {name: 'Sugar ('+sugar+'g)', uv: sugar, fill: 'red'},
    ]
  }
  render () {
    const {nutritionModel, id} = this.props
    const {showNutritionModal} = this.state
    const scaledIngredient = nutritionModel.getScaledIngredient(id)

    if (scaledIngredient) {
      const ingredientModel = scaledIngredient.getIngredientModel()
      const key = ingredientModel.getKey()
      const scale = scaledIngredient.getScale()
      const quantity = scaledIngredient.getQuantity()
      const unit = scaledIngredient.getUnit()
      const labelData = this.getLabelData(ingredientModel, scale)
      const ndbno = ingredientModel.getNdbno()

      if (showNutritionModal) {
        // ReactGA.event({
        //   category: 'User',
        //   action: 'User in ingredient nutrition modal',
        //   nonInteraction: false,
        //   label: key
        // });
      }

      const calories = getScaledValue(ingredientModel.getCalories(), scale)
      return (
        <Row>
          <TooltipButton
            tooltip='Click to get ingredient nutrients'
            tooltipPosition='left'
            tooltipDelay={500}
            icon='info'
            style={{color: '#0088CC'}}
            onClick={()=>this.setState({ showNutritionModal: true })}
          />
          <Modal show={showNutritionModal} bsSize="large" aria-labelledby="contained-modal-title-lg">
            <Modal.Header closeButton onClick={()=>this.setState({ showNutritionModal: false })}>
              <Modal.Title id="contained-modal-title-lg">Nutrition Facts: {quantity} {unit} of <i>{key}</i> has <b>{calories}</b> calories</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <RadialBarChart width={500} height={300} cx={150} cy={150} innerRadius={20} outerRadius={140} barSize={10} data={labelData}>
                <RadialBar minAngle={15} background clockWise={true} dataKey='uv'/>
                <Legend iconSize={10} width={150} height={140} layout='vertical' verticalAlign='middle' align="right" wrapperStyle={style}/>
              </RadialBarChart>
              <IconButton icon='info' style={{color: '#0088CC'}} />
              <Link to={"https://ndb.nal.usda.gov/ndb/search/list?qlookup=" + ndbno} target="_blank">
                FDA breakdown for {key}
              </Link>
            </Modal.Body>
          </Modal>
        </Row>
      )
    }
    return null
  }
}
