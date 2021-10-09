import React from 'react';
import '../../App.css';
import Problem from './Problem.js';
import { problemListReducer } from './Problem.js';

// editing assignmnt mode actions
const UNTITLED_ASSINGMENT = 'Untitled Assignment';

var PROBLEMS = 'PROBLEMS';
// student assignment actions
var ADD_PROBLEM = 'ADD_PROBLEM';

var BUTTON_GROUP = 'BUTTON_GROUP';
var CURRENT_PROBLEM = 'CURRENT_PROBLEM';
var REMOVE_PROBLEM = 'REMOVE_PROBLEM';

// reducer for an overall assignment
function assignmentReducer(state, action) {
    if (state === undefined) {
        return {
            ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
            CURRENT_PROBLEM: 0,
            PROBLEMS : problemListReducer(undefined, action)
        };
    } else if (action.type === REMOVE_PROBLEM) {
        return { ...state,
                 PROBLEMS : problemListReducer(state[PROBLEMS], action)
        };
    } else if (action.type === ADD_PROBLEM) {
        return { ...state,
                 PROBLEMS : problemListReducer(state[PROBLEMS], action)
        };

    } else {
        return { ...state,
                 PROBLEMS : problemListReducer(state[PROBLEMS], action)
        };
    }
}

class Assignment extends React.Component {
    state = { showModal: true };

    render() {
        // Microsoft injected the word iPhone in IE11's userAgent in order to try and fool
        // Gmail somehow. Therefore we need to exclude it. More info about this here and here.
        // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
        //var browserIsIOS = false; ///iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var probList = this.props.value[PROBLEMS];
        var currProblem = this.props.value[CURRENT_PROBLEM];

        // clean up defensively, this same property is used for the teacher view or student view
        // but here it represents an integer index into the list of problems, but for the teacher
        // view it is a string typed as a problem number
        if (typeof probList[currProblem] === 'undefined') {
            let probs = this.props.value[PROBLEMS];
            currProblem = probs.length - 1;
            this.props.value[CURRENT_PROBLEM] = currProblem;
        }
              
        return (
        <div style={{display: 'inline-block', width: '100%'}} >
            <Problem value={probList[currProblem]}
                    id={currProblem}
                    buttonGroup={this.props.value[BUTTON_GROUP]}
                    store={this.props.store}
                    storeDispatch={this.props.storeDispatch}
            />
        </div>
      )
    }
}

export { Assignment as default, assignmentReducer };
