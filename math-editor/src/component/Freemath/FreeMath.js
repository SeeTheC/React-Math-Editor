import React from 'react';
import Assignment from './Assignment.js';
import { assignmentReducer } from './Assignment.js';
// Application modes
var APP_MODE = 'APP_MODE';
var EDIT_ASSIGNMENT = 'EDIT_ASSIGNMENT';
var MODE_CHOOSER = 'MODE_CHOOSER';


// Actions to change modes
var GO_TO_MODE_CHOOSER = 'GO_TO_MODE_CHOOSER';
var SET_ASSIGNMENTS_TO_GRADE = 'SET_ASSIGNMENTS_TO_GRADE';

// Assignment properties
var ASSIGNMENT_NAME = 'ASSIGNMENT_NAME';
var SET_ASSIGNMENT_NAME = 'SET_ASSIGNMENT_NAME';
var SET_SHOW_TUTORIAL = 'SET_SHOW_TUTORIAL';

var SET_GOOGLE_CLASS_LIST = 'SET_GOOGLE_CLASS_LIST';
var GOOGLE_CLASS_LIST = 'GOOGLE_CLASS_LIST';
var GOOGLE_ASSIGNMENT_LIST = 'GOOGLE_ASSIGNMENT_LIST';
var GOOGLE_SELECTED_CLASS = 'GOOGLE_SELECTED_CLASS';
var GOOGLE_SELECTED_ASSIGNMENT = 'GOOGLE_SELECTED_ASSIGNMENT';
var GOOGLE_SELECTED_CLASS_NAME = 'GOOGLE_SELECTED_CLASS_NAME';
var GOOGLE_SELECTED_ASSIGNMENT_NAME = 'GOOGLE_SELECTED_ASSIGNMENT_NAME';
var GOOGLE_SUBMISSION_ID = 'GOOGLE_SUBMISSION_ID';

var GOOGLE_ORIGIN_SERVICE = 'GOOGLE_ORIGIN_SERVICE';
// also can be DRIVE, although this is currently the default behavior
// if GOOGLE_ID is set and this property isn't

var MODIFY_GLOBAL_WAITING_MSG = 'MODIFY_GLOBAL_WAITING_MSG';
var GLOBAL_WAITING_MSG = 'GLOBAL_WAITING_MSG';

var MODIFY_PENDING_SAVES = 'MODIFY_PENDING_SAVES';
var DELTA = 'DELTA';
var PENDING_SAVES = 'PENDING_SAVES';

// separate state for the progress indication while saving back list of docs
// into google Classroom, SAVING_COUNT takes a delta
const MODIFY_CLASSROOM_SAVING_COUNT = 'MODIFY_CLASSROOM_SAVING_COUNT';
const CLASSROOM_SAVING_COUNT = 'CLASSROOM_SAVING_COUNT';
const MODIFY_CLASSROOM_TOTAL_TO_SAVE = 'MODIFY_CLASSROOM_TOTAL_TO_SAVE';
const CLASSROOM_TOTAL_TO_SAVE = 'CLASSROOM_TOTAL_TO_SAVE';
const RESET_CLASSROOM_SAVING_COUNT = 'RESET_CLASSROOM_SAVING_COUNT';

var GOOGLE_ID = 'GOOGLE_ID';
var SET_GOOGLE_ID = 'SET_GOOGLE_ID';
// state for google drive auto-save
// action
var SET_GOOGLE_DRIVE_STATE = 'SET_GOOGLE_DRIVE_STATE';
// Property name and possible values
var GOOGLE_DRIVE_STATE = 'GOOGLE_DRIVE_STATE';
var SET_KEYBOARD_BUTTON_GROUP = 'SET_KEYBOARD_BUTTON_GROUP';
var BUTTON_GROUP = 'BUTTON_GROUP';

// used to swap out the entire content of the document, for opening
// a document from a file
var SET_ASSIGNMENT_CONTENT = 'SET_ASSIGNMENT_CONTENT';

var SET_CURRENT_PROBLEM = 'SET_CURRENT_PROBLEM';
var CURRENT_PROBLEM = 'CURRENT_PROBLEM';


// TODO - make this more efficient, or better yet replace uses with the spread operator
// to avoid unneeded object creation
function cloneDeep(oldObject) {
    return JSON.parse(JSON.stringify(oldObject));
}

function genID() {
    return Math.floor(Math.random() * 200000000);
}

/**
 * Using sparingly, most accesses of state should be passed down to
 * components through the render tree.
 *
 * This is only used currently in the save path to grab the most recent
 * root persistent state to save it externally somehwere (local filesystem, html5 localstorage, HTTP request).
 */
function getPersistentState() {
    return window.store.getState();
}

// TODO - fixme, separate this out from persistent state
function getEphemeralState() {
    return window.ephemeralStore.getState();
}

function getCompositeState() {
    return {
        ...getPersistentState(),
        ...getEphemeralState()
    }
}

/**
 * Filter out if we are currently grading files from google dirve, otherwise auto-save
 * to drive or browser local storage
 */
function autoSave() {
    //var appCompState = getCompositeState();    
    console.log("auto-save event");
}

function saveToLocalStorageOrDrive(delayMillis = 15000, onSuccessCallback = function() {}) {

}

function ephemeralStateReducer(state, action) {
    if (state === undefined) {
        return {
            BUTTON_GROUP : 'BASIC',
            PENDING_SAVES : 0
        };
    } else if (action.type === SET_GOOGLE_ID) {
        return { ...state,
                 GOOGLE_ID: action[GOOGLE_ID],
                 GOOGLE_ORIGIN_SERVICE: action[GOOGLE_ORIGIN_SERVICE] ? action[GOOGLE_ORIGIN_SERVICE] : 'DRIVE' // DRIVE OR CLASSROOM
        }
    } else if (action.type === MODIFY_GLOBAL_WAITING_MSG) {
        return {
            ...state,
            GLOBAL_WAITING_MSG: action[GLOBAL_WAITING_MSG]
        }
    } else if (action.type === MODIFY_PENDING_SAVES) {
        return {
            ...state,
            PENDING_SAVES: state[PENDING_SAVES] + action[DELTA]
        }
    } else if (action.type === MODIFY_CLASSROOM_SAVING_COUNT) {
        return {
            ...state,
            CLASSROOM_SAVING_COUNT: state[CLASSROOM_SAVING_COUNT] + action[DELTA]
        }
    } else if (action.type === RESET_CLASSROOM_SAVING_COUNT) {
        return {
            ...state,
            CLASSROOM_SAVING_COUNT: 0
        }
    } else if (action.type === MODIFY_CLASSROOM_TOTAL_TO_SAVE) {
        return {
            ...state,
            CLASSROOM_TOTAL_TO_SAVE: action[CLASSROOM_TOTAL_TO_SAVE],
        }
    } else if (action.type === SET_CURRENT_PROBLEM) {
        // Note: this is a little different for student view
        // for students problems can safely be addressed by position in the list
        // this allows new problems to be spawned with blank nubmers and fixed later
        // here CURRENT_PROBLEM will refer to the string typed in by users
        return {
            ...state,
            CURRENT_PROBLEM : action[CURRENT_PROBLEM]
        };
    } else if (action.type === SET_KEYBOARD_BUTTON_GROUP) {
        return { ...state,
                 BUTTON_GROUP : action[BUTTON_GROUP]
        }
    } else if (action.type === SET_GOOGLE_DRIVE_STATE) {
        return { ...state,
                 GOOGLE_DRIVE_STATE: action[GOOGLE_DRIVE_STATE]
        }
    } else if (action.type === SET_GOOGLE_CLASS_LIST) {
        // in error cases, we want to make students re-select class/assignment so that
        // they aren't immediately prompted to turn in before an association with
        // the assignment is made, a little hacky, but using explict FALSE instead
        // of undefined to indicate this
        if (action[GOOGLE_CLASS_LIST] === false) {
            return { ...state,
                 GOOGLE_CLASS_LIST : undefined,
                 GOOGLE_SELECTED_CLASS : undefined,
                 GOOGLE_SELECTED_ASSIGNMENT : undefined
            };
        }
        // when this is undefined the modal is being closed after a successful save
        // in this case, we want to keep around at least GOOGLE_SELECTED_CLASS,
        // and GOOGLE_SELECTED_ASSIGNMENT, because they can be used later to allow
        // a student to unsubmit and keep editing, or choose to not submit right away
        // and the next click of the "submit to classroom" button will prompt them asking
        // if they want to turn in
        if (! action[GOOGLE_CLASS_LIST]) {
            return { ...state,
                 GOOGLE_CLASS_LIST : action[GOOGLE_CLASS_LIST]
            };
        }
        return { ...state,
                 GOOGLE_CLASS_LIST : action[GOOGLE_CLASS_LIST],
                 GOOGLE_SELECTED_CLASS : action[GOOGLE_SELECTED_CLASS],
                 GOOGLE_SELECTED_CLASS_NAME : action[GOOGLE_SELECTED_CLASS_NAME],
                 GOOGLE_ASSIGNMENT_LIST : action[GOOGLE_ASSIGNMENT_LIST],
                 GOOGLE_SELECTED_ASSIGNMENT : action[GOOGLE_SELECTED_ASSIGNMENT],
                 GOOGLE_SELECTED_ASSIGNMENT_NAME : action[GOOGLE_SELECTED_ASSIGNMENT_NAME],
                 GOOGLE_SUBMISSION_ID : action[GOOGLE_SUBMISSION_ID]
        };
    } else {
        return state;
    }
}

function rootReducer(state, action) {
    console.log(action);
    if (state === undefined || action.type === GO_TO_MODE_CHOOSER) {
        return {
            APP_MODE : MODE_CHOOSER
        };
    } else if (action.type === "NEW_ASSIGNMENT") {
        return {
            ...assignmentReducer(),
            "DOC_ID" : genID(),
            APP_MODE : EDIT_ASSIGNMENT
        };
    } else if (action.type === "SET_GLOBAL_STATE") {
        return {...action.newState,
        };
    } else if (action.type === SET_ASSIGNMENT_NAME) {
        return { ...state,
                 ASSIGNMENT_NAME : action[ASSIGNMENT_NAME]
        }
    } else if (action.type === SET_SHOW_TUTORIAL) {
        return { ...state,
                 SHOW_TUTORIAL: true
        }
    } else if (action.type === SET_ASSIGNMENTS_TO_GRADE) {
       return { ...state };
    } else if (action.type === SET_ASSIGNMENT_CONTENT) {
        // TODO - consider serializing DOC_ID and other future top level attributes into file
        // for now this prevents all opened docs from clobbering other suto-saves
        return {
            APP_MODE : EDIT_ASSIGNMENT,
            PROBLEMS : action.PROBLEMS,
            ASSIGNMENT_NAME : action[ASSIGNMENT_NAME],
            CURRENT_PROBLEM : 0,
            "DOC_ID" : action["DOC_ID"] ? action["DOC_ID"] : genID() ,
        };
    } else if (state[APP_MODE] === EDIT_ASSIGNMENT) {
        return {
            ...assignmentReducer(state, action),
            APP_MODE : EDIT_ASSIGNMENT
        }
    } 
    else {
        return state;
    }
}

class FreeMath extends React.Component {
    render() {
      // TODO - figure out how to best switch between teacher and
      // student mode rendering
      console.log("FREEMATH RENDER...");
      console.log(this.props);
      console.log("****************************************");         

      if (this.props.value[APP_MODE] === EDIT_ASSIGNMENT) {        
          return (
              <div>                  
                  <Assignment value={this.props.value}/>
              </div>
          );
      } 
      else  {
          alert(this.props.value);
      }

    }
}

export {FreeMath as default, autoSave, rootReducer, ephemeralStateReducer, cloneDeep, genID,
    getPersistentState, getEphemeralState, getCompositeState, saveToLocalStorageOrDrive};
