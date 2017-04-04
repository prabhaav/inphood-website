const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Modal from 'react-bootstrap/lib/Modal'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import MarginLayout from '../../helpers/MarginLayout'

import {Link} from 'react-router'
import EmailForm from '../pages/EmailForm'

export default class TopBar extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false,
      data: ''
    }
  }
  getData(data) {
    this.setState({data})
    event.preventDefault()
  }
  onSubmit() {
    this.setState({ show: false })
    if (this.state.data !== '') {
      ReactGA.event({
        category: 'User',
        action: 'User sent email',
        nonInteraction: false
      });
      this.props.initEmailFlow()
      this.props.getEmailData(this.state.data)
    }
  }
  render() {
    let open  = () => this.setState({ show: true })
    let close = () => this.setState({ show: false })

    const ml = new MarginLayout()

    const {router} = this.props

    const whiteBackground={
      backgroundColor:'white'
    }

    return (
      <Row style={whiteBackground}>
        {ml.marginCol}
        <Col xs={ml.xsCol} sm={ml.smCol} md={ml.mdCol} lg={ml.lgCol}>
          <Row>
            <Col style={{paddingLeft: 0, paddingRight: 0}} xs={6}>
              <Button bsStyle="link" onClick={() => router.push('/')}>
                <img src={require('../../images/logoOnClear.png')}/>
              </Button>
            </Col>
            <Col className='text-right' xs={6} style={{bottom:0, right:0, position:'absolute'}}>
              <Button bsStyle="link" onClick={open}>
                Say Hi&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-envelope" />
              </Button>
              <Modal onHide={close} show={this.state.show} bsSize="small" aria-labelledby="contained-modal-title-sm">
                <Modal.Header>
                  <Modal.Title id="contained-modal-title-sm">Say Hi</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <EmailForm data={(data) => this.getData(data)}/>
                </Modal.Body>
                <Modal.Footer>
                  <Button onClick={this.onSubmit.bind(this)}>Submit</Button>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>

        </Col>
        {ml.marginCol}
      </Row>
    )
  }
}
