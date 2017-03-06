var React = require('react')
import Route from 'react-router/lib/Route'
import Router from 'react-router/lib/Router'
import Redirect from 'react-router/lib/Redirect'
import IndexRoute from 'react-router/lib/IndexRoute'
import browserHistory from 'react-router/lib/browserHistory'

import About from './pages/About'
import Layout from './pages/Layout'
import NoMatch from './pages/NoMatch'
import Home from '../containers/HomeContainer'
import Nutrition from '../containers/NutritionContainer'
import Recipe from '../containers/RecipeContainer'

import './styles/App.css'
import './styles/custom-styles.css'

export default class App extends React.Component {
  render() {
    return (
      <Router onUpdate={() => this.props.fireTracking()} history={browserHistory}>
        <Route path='/' component={Layout}>
          <IndexRoute component={Home}></IndexRoute>
          <Route path='about' name='about' component={About}></Route>
          <Route path='recipe' name='recipe' component={Recipe}></Route>
          <Route path='nutrition' name='nutrition' component={Nutrition}></Route>
          {/*<Route path='result' name='label' component={Results}></Route>*/}
          <Route path='*' component={NoMatch}/>
        </Route>
      </Router>
    )
  }
}