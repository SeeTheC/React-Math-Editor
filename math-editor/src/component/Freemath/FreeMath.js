import React from 'react';
import {connect} from 'react-redux'
import Assignment from './Assignment.js';
import { assignmentReducer } from './Assignment.js';
// Application modes
var APP_MODE = 'APP_MODE';
var EDIT_ASSIGNMENT = 'EDIT_ASSIGNMENT';

// Actions to change modes
var GO_TO_MODE_CHOOSER = 'GO_TO_MODE_CHOOSER';
var SET_ASSIGNMENTS_TO_GRADE = 'SET_ASSIGNMENTS_TO_GRADE';

// Assignment properties
var ASSIGNMENT_NAME = 'ASSIGNMENT_NAME';
var SET_ASSIGNMENT_NAME = 'SET_ASSIGNMENT_NAME';
var SET_SHOW_TUTORIAL = 'SET_SHOW_TUTORIAL';

var SET_KEYBOARD_BUTTON_GROUP = 'SET_KEYBOARD_BUTTON_GROUP';
var BUTTON_GROUP = 'BUTTON_GROUP';

// used to swap out the entire content of the document, for opening
// a document from a file
var SET_ASSIGNMENT_CONTENT = 'SET_ASSIGNMENT_CONTENT';

var SET_CURRENT_PROBLEM = 'SET_CURRENT_PROBLEM';
var CURRENT_PROBLEM = 'CURRENT_PROBLEM';


// TODO - make this more efficient, or better yet replace uses with the spread operator
// to avoid unneeded object creation
export function cloneDeep(oldObject) {
    return JSON.parse(JSON.stringify(oldObject));
}

export function genID() {
    return Math.floor(Math.random() * 200000000);
}

/**
 * Filter out if we are currently grading files from google dirve, otherwise auto-save
 * to drive or browser local storage
 */
 export function autoSave() {
    //var appCompState = getCompositeState();    
    console.log("auto-save event");
}



export function rootReducer(state, action) {
    console.log(action);
    console.log(state);
    if (state === undefined || action.type === GO_TO_MODE_CHOOSER) {
        return {
            ...assignmentReducer(),
            "DOC_ID" : genID(),
            APP_MODE : EDIT_ASSIGNMENT,
            BUTTON_GROUP : 'BASIC',
            PENDING_SAVES : 0        
        };
    }    
     /**** Symbol- ephemeralStateReducer - Start ***/
     else if (action.type === SET_CURRENT_PROBLEM) {
        console.log("ephemeralStateReducer:" +SET_CURRENT_PROBLEM);
        // Note: this is a little different for student view
        // for students problems can safely be addressed by position in the list
        // this allows new problems to be spawned with blank nubmers and fixed later
        // here CURRENT_PROBLEM will refer to the string typed in by users
        return {
            ...state,
            CURRENT_PROBLEM : action[CURRENT_PROBLEM]
        };
    } else if (action.type === SET_KEYBOARD_BUTTON_GROUP) {
        console.log("ephemeralStateReducer:" +SET_KEYBOARD_BUTTON_GROUP);
        return { ...state,
                 BUTTON_GROUP : action[BUTTON_GROUP]
        }
    }
    /**** Symbol- ephemeralStateReducer- END ** */
    else if (action.type === "NEW_ASSIGNMENT") {
        return {
            ...state,
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
                  <Assignment value={this.props.value} store={this.props.value} storeDispatch={this.props.storeDispatch}/>
              </div>
          );
      }      
      return(<div> 
          FREE MATH;
      </div>)
    }
}

const mapStateToProps = (state) => {
    return {
        value:state
    }
}

const mapDispactToProp = (dispatch) => {
    return {
        storeDispatch:dispatch
    }
}

export default connect(mapStateToProps, mapDispactToProp)(FreeMath);