var React = require('react')
import Alert from 'react-bootstrap/lib/Alert'
import Button from 'react-bootstrap/lib/Button'

export default class NoMatch extends React.Component {
  render() {
    return (
      <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
        <h4>Oh snap! Page not found!</h4>
        <p>
          <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
        </p>
      </Alert>
    )
  }
}
