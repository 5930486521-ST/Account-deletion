import _ from 'lodash'
import React from 'react'

import ConfirmEmailModal from './ConfirmEmailModal.react'
import TransferOwnershipModal, { WorkspaceGroupRows } from './TransferOwnershipModal.react'
import FeedbackSurveyModal from './FeedbackSurveyModal.react'
import { submitToSurveyMonkeyDeleteAccount } from './SurveyService'
import * as LoadState from './LoadState'
import AssignOwnership from './AssignOwnership.react'
import { feedbackSurveyItems } from './FeedbackSurveyItems'

import profile from "./pic/profile.png";

export default class TerminateModalFlow extends React.Component {
  static propTypes = {
    user: React.PropTypes.object.isRequired,
    loading: React.PropTypes.bool,
    requiredTransferWorkspaces: React.PropTypes.array,
    deleteWorkspaces: React.PropTypes.array,
    fetchRelatedWorkspaces: React.PropTypes.func,
    transferOwnershipStatus: React.PropTypes.object,
    transferOwnership: React.PropTypes.func,
    terminateAccount: React.PropTypes.func,
    terminateAccountError: React.PropTypes.func,
    terminateAccountStatus: React.PropTypes.object,
    resetTerminateAccountStatus: React.PropTypes.func,
    rediectToHomepage: React.PropTypes.func,
    getTransferData: React.PropTypes.func,
    transferData: React.PropTypes.array
  }

  setInitialChoice = () => {
    return _.chain(feedbackSurveyItems)
      .map(item => [item.stack, false])
      .fromPairs()
      .value()
  }

  state = {
    surveyChoice: this.setInitialChoice(),
    choiceComment: { others: "" },
    comment: '',
    email: '',
    submitSurveyStatus: LoadState.pending
  }

  componentDidMount() {
    this.props.fetchRelatedWorkspaces()
  }

  componentWillReceiveProps(nextProps) {
    if (LoadState.isLoaded(nextProps.terminateAccountStatus)) {
      this.submitSurvey()
    }
  }

  componentDidUpdate() {
    if (LoadState.isLoaded(this.state.submitSurveyStatus)) {
      this.props.rediectToHomepage()
    }
  }

  onAssignToUser = (workspace, user) => {
    this.props.transferOwnership(user, workspace)
  }

  getRefsValues(refs, refName) {
    const item = _.get(refs, refName, false)
    if (!item || _.isEmpty(item.refs)) return {}
    const keys = Object.keys(item.refs)
    const collection = []
    for (const key of keys) {
      const value = item.refs[key].value
      collection.push({ key, value })
    }
    return collection
  }

  onToggleFeedback = (stack) => {
    const { surveyChoice } = this.state;
    this.setState({ surveyChoice: Object.assign({}, surveyChoice, { [stack]: !surveyChoice[stack] }) })
    if (surveyChoice[stack]) this.state.choiceComment[stack] = ""
  }

  onChangeChoiceComment = (e, title) => {
    this.setState({ choiceComment: Object.assign({}, this.state.choiceComment, { [title]: e.target.value }) })
  }

  onChangeComment = e => {
    this.setState({ comment: e.target.value })
  }

  onTypeEmail = e => {
    this.setState({ email: e.target.value })
  }

  submitSurvey = async () => {
    this.setState({ submitSurveyStatus: LoadState.fetching })
    const feedbackRefs = this.getRefsValues(this.refs, 'feedbackForm')
    const surveyPayload = {
      feedbackRefs,
      comment: this.state.comment,
    };
    try {
      const response = await submitToSurveyMonkeyDeleteAccount(surveyPayload)
      if (response.status === 200) {
        this.setState({ submitSurveyStatus: LoadState.completed })
      }
    } catch (error) {
      this.setState({ submitSurveyStatus: error })
      console.log(error)
    }
  }

  getReason = feedbackRefs =>
    (_.map(feedbackRefs, ref =>
      ({
        reason: ref.key,
        comment: ref.value,
      })
    ))

  onDeleteAccount = async () => {
    if (this.props.user.email === this.state.email) {
      const feedbackRefs = this.getRefsValues(this.refs, 'feedbackForm')
      const payload = {
        transferTargets: _.map(this.props.getTransferData(), assign => ({
          userId: assign.toUser._id,
          spaceId: assign.workspaceId,
        })),
        reason: this.getReason(feedbackRefs),
      }
      this.props.terminateAccount(payload)
    } else {
      const error = 'Invalid email'
      this.props.terminateAccountError(error)
    }
  }

  renderNavbar() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" id="sideNav">
        <a className="navbar-brand js-scroll-trigger" href="#page-top">
          <span className="d-block d-lg-none">Delete Account Form: {this.props.user.name}</span>
          <span className="d-none d-lg-block">
            <img className="img-fluid img-profile rounded-circle mx-auto mb-2" src={profile} alt="" />
          </span>
        </a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link js-scroll-trigger" href="#transfer">TRANSFER OWNERSHIP</a>
            </li>
            <li className="nav-item">
              <a className="nav-link js-scroll-trigger" href="#survey">Survey</a>
            </li>
            <li className="nav-item">
              <a className="nav-link js-scroll-trigger" href="#delete">DELETE ACCOUNT</a>
            </li>
          </ul>
        </div>
      </nav>)
  }

  renderLoader() {
    if (LoadState.isLoading(this.state.submitSurveyStatus) ||
      LoadState.isLoading(this.props.terminateAccountStatus)) {
      return <div id="preloader">
        <div id="loader"></div>
      </div>
    }
  }

  renderTransferModal() {
    const totalWorkspaceRequiredTransfer = this.props.requiredTransferWorkspaces.length
    const totalWorkspaceDelete = this.props.deleteWorkspaces.length
    return (
      <TransferOwnershipModal
        loading={this.props.loading}
      >
        <WorkspaceGroupRows
          workspaces={this.props.requiredTransferWorkspaces}
          groupTitle="The following workspaces require ownership transfer:"
          shouldDisplay={totalWorkspaceRequiredTransfer > 0}
          transferOwnershipStatus={this.props.transferOwnershipStatus}
          transferData={this.props.transferData}
        >
          <AssignOwnership
            user={this.props.user}
            transferData={this.props.getTransferData()}
            onAssignToUser={this.onAssignToUser}
          />
        </WorkspaceGroupRows>
        <WorkspaceGroupRows
          workspaces={this.props.deleteWorkspaces}
          groupTitle="The following workspaces will be deleted:"
          shouldDisplay={totalWorkspaceDelete > 0}
        />
      </TransferOwnershipModal>
    )
  }

  transferInputValid() {
    const totalAssigned = this.props.getTransferData().length
    const totalWorkspaceRequiredTransfer = this.props.requiredTransferWorkspaces.length
    return (totalAssigned === totalWorkspaceRequiredTransfer)
  }

  surveyInputValid() {
    const { surveyChoice, choiceComment } = this.state
    if (_.every(surveyChoice, val => val === false)) return false
    if (!surveyChoice.others) return true
    if (!choiceComment["others"]) return false
    return true
  }

  inputValid = () => {
    return !this.props.loading && this.transferInputValid() && this.surveyInputValid() && !LoadState.isLoading(this.state.submitSurveyStatus)
  }

  render() {
    // console.log("submitSurveyStatus",this.state.submitSurveyStatus)
    return (
      <div id="page-top">
        {this.renderLoader()}
        {this.renderNavbar()}
        <div className="container-fluid pa-5">
          <section className="resume-section p-3 p-lg-5 d-flex d-column" id="transfer">
            <div className="m-3 my-auto">
              {this.renderTransferModal()}
            </div>
          </section>

          <hr className="m-0" />

          <section className="resume-section p-3 p-lg-5 d-flex flex-column" id="survey">
            <div className="my-auto">
              <FeedbackSurveyModal
                ref="feedbackForm"
                title="Why would you leave us?"
                showCommentForm
                surveyChoice={this.state.surveyChoice}
                onToggleFeedback={this.onToggleFeedback}
                onChangeChoiceComment={this.onChangeChoiceComment}
                choiceComment={this.state.choiceComment}
                comment={this.state.comment}
                onChangeComment={this.onChangeComment}
              />
            </div>

          </section>

          <hr className="m-0" />

          <section className="resume-section p-3 p-lg-5 d-flex flex-column" id="delete">
            <div className="my-auto">
              <ConfirmEmailModal
                onClickToDelete={this.onDeleteAccount}
                email={this.state.email}
                onTypeEmail={this.onTypeEmail}
                terminateAccountStatus={this.props.terminateAccountStatus}
                resetTerminateAccountStatus={this.props.resetTerminateAccountStatus}
                previousInputValid={this.inputValid()}
              />
            </div>
          </section>

          <hr className="m-0" />
        </div>
      </div>)
  }
}
