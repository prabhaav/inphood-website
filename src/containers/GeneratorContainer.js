import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Generator from '../components/pages/Generator'
import * as actionCreators from '../actions/Actions'

function mapStateToProps (state) {
  return {
    tagModel: state.tagModelReducer,
    nutrition: state.nutritionReducer,
    nutritionModelRed: state.nutritionModelReducer,
    generator: state.generatorReducer,
    search: state.searchReducer
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Generator)