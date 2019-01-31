import PropTypes from 'prop-types'
import React from 'react'

import * as LoadState from './LoadState'
import _ from 'lodash'
export default class MockDataProvider extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      user: {
        _id: 'user1',
        name: 'Ross Lynch',
        email: 'ross@example.com',
      },

      loading: true,

      requiredTransferWorkspaces: [],

      deleteWorkspaces: [],

      transferOwnershipStatus: {
        workspaceId: null,
        toUserId: null,
        ...LoadState.pending,
      },

      transferData: [],

      terminateAccountStatus: LoadState.pending,

      fetchRelatedWorkspaces: async () => {
        const response = await window.fetch(
          `https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/fetchWorkspaces?userId=${
          this.state.user._id
          }`,
          {
            mode: 'cors',
          }
        )
        const data = await response.json()
        this.setState({
          loading: false,
          requiredTransferWorkspaces: data.requiredTransferWorkspaces,
          deleteWorkspaces: data.deleteWorkspaces,
        })
      },

      getTransferData: () => {
        const { workspaceId, toUserId, status } = this.state.transferOwnershipStatus
        const transferData = this.state.transferData
        const updateData = _.reduce(
          transferData,
          (result, assign) => {
            if (
              assign.workspaceId === workspaceId &&
              assign.toUser._id === toUserId
            ) {
              result.push(Object.assign({}, assign, { status }))
            } else {
              result.push(assign)
            }
            return result
          },
          []
        )
        return updateData
      },

      assignToUser: (workspace, user) => {
        const assigns = _.reject(
          this.state.getTransferData(),
          assign => assign.workspaceId === workspace.spaceId
        )
        if (!LoadState.isError(this.state.transferOwnershipStatus)) {
          this.setState({
            transferData: [
              ...assigns,
              {
                workspaceId: workspace.spaceId,
                toUser: user,
                ...LoadState[this.state.transferOwnershipStatus.status]
              }
            ]
          })
        }
        else {
          this.setState({ transferData: [...assigns] });
        }
      },

      transferOwnership: (user, workspace) => {
        this.setState(
          {
            transferOwnershipStatus: {
              workspaceId: workspace.spaceId,
              toUserId: this.state.user._id,
              ...LoadState.fetching,
            },
          },
          async () => {
            const response = await window.fetch(
              'https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/checkOwnership',
              {
                method: 'POST',
                mode: 'cors',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  workspaceId: workspace.spaceId,
                  fromUserId: this.state.user._id,
                  toUserId: user._id,
                }),
              }
            )
            var transferOwnershipStatus;
            if (response.status === 200) {
              transferOwnershipStatus = {
                workspaceId: workspace.spaceId,
                toUserId: user._id,
                ...LoadState.completed,
              }
            } else {
              transferOwnershipStatus = {
                workspaceId: workspace.spaceId,
                toUserId: user._id,
                ...LoadState.error,
              }
            }
            await this.setState({ transferOwnershipStatus: transferOwnershipStatus })
            this.state.assignToUser(workspace, user)
          }
        )
      },

      terminateAccount: async payload => {
        // Note that there is 30% chance of getting error from the server
        await this.setState({ terminateAccountStatus: LoadState.fetching })
        const response = await window.fetch(
          'https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/terminateAccount',
          {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        )
        // console.log(response)
        if (response.status === 200) {
          this.setState({
            terminateAccountStatus: LoadState.handleLoaded(
              this.state.terminateAccountStatus
            ),
          })
        } else {
          this.setState({
            terminateAccountStatus: LoadState.handleLoadFailedWithError(
              'Error deleting account, please try again'
            )(this.state.terminateAccountStatus),
          })
        }
      },

      terminateAccountError: error => {
        this.setState({
          terminateAccountStatus: LoadState.handleLoadFailedWithError(error)(
            this.state.terminateAccountStatus
          ),
        })
      },

      resetTerminateAccountStatus: () => {
        this.setState({
          terminateAccountStatus: LoadState.pending,
        })
      },

      rediectToHomepage: () => {
        window.location = 'http://www.example.com/'
      },
    }
  }

  render() {
    // console.log(this.state.terminateAccountStatus)
    return this.props.children(this.state)
  }
}
