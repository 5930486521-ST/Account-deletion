import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

import { isLoading } from './LoadState'

class ConfirmEmailModal extends React.PureComponent {
  static propTypes = {
    onClickToDelete: PropTypes.func,
    onBackButton: PropTypes.func,
    email: PropTypes.string,
    onTypeEmail: PropTypes.func,
    resetTerminateAccountStatus: PropTypes.func,
    terminateAccountStatus: PropTypes.object,
    previousInputValid: PropTypes.bool
  }

  state = { markedConsequences: false }

  getStateButton = () => {
    if (isLoading(this.props.terminateAccountStatus)) return true
    if (this.state.markedConsequences && this.props.email) return false
    return true
  }

  onToggleMarkedConsequences = () => {
    this.setState({ markedConsequences: !this.state.markedConsequences })
  }

  renderFormInputPasssword = () => {
    const errorMessage = _.get(this.props.terminateAccountStatus, 'error', null)
    return (
      <div>
        <input
          type="text"
          placeholder="ross@example.com"
          style={{ width: '350px' }}
          onChange={this.props.onTypeEmail}
        />
        <span className="px-3" style={{ color: 'red' }}>{errorMessage}</span>
      </div>
    )
  }

  render() {
    return (
      <div className="p-4 py-5">
        <h1>Delete account</h1>
        <p>This action cannot be undone.</p>
        <div>Please enter your email: {this.renderFormInputPasssword()}</div>
        <div style={{ marginTop: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={this.state.markedConsequences}
              onChange={this.onToggleMarkedConsequences}
              className="mx-2"
              style={{ width: "17px", height: "17px" }}
            />
            I understand the consequences.
          </label>
        </div>
        <div className="d-flex flex-row-reverse">
          <button className="btn btn-secondary px-5 mr-5 ml-3" onClick={this.props.onClickToDelete} disabled={this.getStateButton() || !this.props.previousInputValid}>
            Delete my account
          </button>
        </div>
      </div>
    )
  }
}

export default ConfirmEmailModal
