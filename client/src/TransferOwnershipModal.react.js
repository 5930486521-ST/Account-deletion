import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import * as LoadState from './LoadState'
import fail from "./pic/fail.png"
import success from "./pic/success.png"

const renderStatus = (props,workspace) => () =>{
  const transferOwnershipStatus =  props.transferOwnershipStatus
  if (transferOwnershipStatus.workspaceId === workspace.spaceId){
    if (LoadState.isLoading(transferOwnershipStatus)){
      return (<div className="d-flex flex-row"><div className="loader mx-1"></div><span>Checking...</span></div>)
    }
    if (LoadState.isError(transferOwnershipStatus)){
      return <div className="d-flex flex-row"><img  className="mx-1" src={fail} width='20rem' height='20rem' alt="success"></img>
      <span>Check Failed, please transfer to other person</span></div>
    }
  }
  const assignedWorkspace = props.transferData.filter((obj)=> obj.workspaceId === workspace.spaceId)
  if (assignedWorkspace.length){
    return <div className="d-flex flex-row"><img className="mx-1"src={success} width='20rem' height='20rem' alt="success"></img>
    <span>Checked</span></div>;
  }
}

const renderAssignOwner = (props,workspace) => {
  if (React.Children.count(props.children) === 0) return null
  else {
    const getRenderStatus = renderStatus(props,workspace)
    return React.cloneElement(props.children, { workspace,getRenderStatus})
  }
}

export const WorkspaceGroupRows = props =>
  !props.shouldDisplay ? null : (
    <div className="my-4">
      <h3>{props.groupTitle}</h3>
      <div>
        {_.map(props.workspaces, workspace => (
          <div className = "ml-4" key={workspace.spaceId} style={{ marginTop: '1rem' }}>
            <span >Workspace: {workspace.displayName}</span>
            <span>
              {renderAssignOwner(props,workspace)}
            </span>
            
          </div>
        ))}
      </div>
    </div>
  )

WorkspaceGroupRows.propTypes = {
  groupTitle: PropTypes.string,
  workspaces: PropTypes.array.isRequired,
  children: PropTypes.node,
  shouldDisplay: PropTypes.bool,
  transferOwnershipStatus: PropTypes.object,
  transferData: PropTypes.array
}

export const TransferOwnershipModal = props => {
  const renderLoading = () => <div>Loading...</div>
  return (
    <div className="p-4 pt-5">
      <h1>Transfer ownership</h1>
      <p>
        Before you leaving, it is required to transfer your tasks, projects and
        workspace admin rights to other person.
      </p>
      {props.loading ? renderLoading() : props.children}
      <div className ="d-flex flex-row-reverse">
      </div>
    </div>
  )
}

TransferOwnershipModal.propTypes = {
  onToggleShowModal: PropTypes.func,
  nextPage: PropTypes.func,
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  disabledNextPage: PropTypes.bool,
}

export default TransferOwnershipModal
