import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import './index.css'
import * as LoadState from './LoadState'

export default class AssignOwnership extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    workspace: PropTypes.object,
    transferData: PropTypes.array,
    onAssignToUser: PropTypes.func,
    transferOwnershipStatus: PropTypes.object,
    getRenderStatus: PropTypes.func
  }

  getAddedMember() {
    const { workspace, transferData } = this.props
    return _.chain(transferData)
      .reject(LoadState.isError || LoadState.isLoading)
      .find(assign => assign.workspaceId === workspace.spaceId)
      .get('toUser._id', '')
      .value()
  }

  onAssignToUser = e => {
    const user = this.props.workspace.transferableMembers.find(
      user => user._id === e.target.value);
    this.props.onAssignToUser(this.props.workspace, user)
  }

  render() {
    return (
      <div className="d-flex flex-row">
        <div>
          <select
            value={this.getAddedMember()}
            onChange={this.onAssignToUser}
            style={{ minWidth: '3rem', cursor: 'pointer' }}
          >
            <option value="" disabled />
            {this.props.workspace.transferableMembers.map(user => {
              return (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              )
            })}
          </select>
        </div>
        {this.props.getRenderStatus()}
      </div>
    )
  }
}
