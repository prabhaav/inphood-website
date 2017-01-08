var React = require('react')
import { IndexLink, Link } from "react-router"

export default class Nav extends React.Component {
  constructor() {
    super()
    this.state = {
      collapsed: true,
    }
  }
  toggleCollapse() {
    const collapsed = !this.state.collapsed
    this.setState({collapsed})
  }
  render() {
    const { location } = this.props
    const { collapsed } = this.state
    const navClass = collapsed ? "collapse" : ""
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" onClick={this.toggleCollapse.bind(this)} >
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
          </div>
          <div className={"navbar-collapse " + navClass} id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              <li activeClassName="active" onlyActiveOnIndex={true}>
                <IndexLink to="/" onClick={this.toggleCollapse.bind(this)}>Home</IndexLink>
              </li>
              <li activeClassName="active">
                <Link to="about" onClick={this.toggleCollapse.bind(this)}>About</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}