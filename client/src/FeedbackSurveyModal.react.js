import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

import { feedbackSurveyItems } from './FeedbackSurveyItems'

class FeedbackSurveyModal extends React.PureComponent {
  static propTypes = {
    onSubmit: PropTypes.func,
    onBackButton: PropTypes.func,
    title: PropTypes.node,
    showCommentForm: PropTypes.bool,
    comment: PropTypes.string,
    onChangeComment: PropTypes.func,
    onToggleFeedback : PropTypes.func,
    surveyChoice : React.PropTypes.object,
    onChangeChoiceComment : PropTypes.func,
    choiceComment : React.PropTypes.object
  }

  state = {
    isFocusCommentBox: false,
  }

  onFocusCommentBox = () => {
    this.setState({ isFocusCommentBox: !this.state.isFocusCommentBox })
  }

  renderInputForm({ stack, canComment, placeHolder }) {
    const prefill = placeHolder && canComment ? placeHolder : ''
    return !this.props.surveyChoice[stack] ? null : (
      <div style={!canComment ? { display: 'none' } : null}>
        <input type="text" name={stack} ref={stack} placeholder={prefill}  
          onChange ={(e) => {this.props.onChangeChoiceComment(e,stack)}} required />
      </div>
    )
  }

  renderCommentForm() {
    if (!this.props.showCommentForm) return
    return (
      <div style={{ marginTop: '0.5rem' }}>
        Comments:
        <div className ="form-group">
          <textarea
            className ="form-control"
            type="text"
            name="comment"
            style={
              this.state.isFocusCommentBox
                ? { border: '1px solid #5a6977' ,}
                : { border: '1px solid #5a6977',  }
            }
            onChange={this.props.onChangeComment}
            value={this.props.comment}
          />
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className ="p-4">
        <h1>{this.props.title}</h1>
        <div className ="m-4">
          {_.map(feedbackSurveyItems, (item, key) => (
            <div key={key}>
              <label>
                <div >
                  <input
                    className ="mx-2"
                    type="checkbox"
                    checked={this.props.surveyChoice[item.stack]}
                    onClick={() => this.props.onToggleFeedback(item.stack)}
                    style ={{width: "17px", height: "17px"}}
                  />
                  <label>{item.title}</label>
                </div>
              </label>
              {this.renderInputForm(item)}
            </div>
          ))}
        </div>
        {this.renderCommentForm()}
      </div>
    )
  }
}

export default FeedbackSurveyModal
