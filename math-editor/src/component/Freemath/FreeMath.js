import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import Assignment from './Assignment.js';
import { assignmentReducer } from './Assignment.js';
import Switch from "react-switch";
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

// editor
var TOGGLE_LATEX_EDITOR = 'TOGGLE_LATEX_EDITOR';
var LATEX_NEWLINE = '[newline]';
var LOAD_DEFAULT_VALUE = "LOAD_DEFAULT_VALUE"
var LATEX_DEFAULT_VALUE = "LATEX_DEFAULT_VALUE"
var LATEX_DEFAULT_VALUE_LOADED = "LATEX_DEFAULT_VALUE_LOADED"

// TODO - make this more efficient, or better yet replace uses with the spread operator
// to avoid unneeded object creation
export function cloneDeep(oldObject) {
    return JSON.parse(JSON.stringify(oldObject));
}

export function genID() {
    return Math.floor(Math.random() * 200000000);
}

export function rootReducer(state, action) {
    console.log(action);
    console.log(state);
    var returnState = {};
    if (state === undefined || action.type === GO_TO_MODE_CHOOSER) {
        returnState =  {
            ...assignmentReducer(),
            "DOC_ID" : genID(),
            APP_MODE : EDIT_ASSIGNMENT,
            LATEX_DEFAULT_VALUE:"",
            LATEX_DEFAULT_VALUE_LOADED:false,
            BUTTON_GROUP : 'BASIC',
            PENDING_SAVES : 0,
            LATEX_EDITOR_STATE: true        
        };
    }    
     /**** Symbol- ephemeralStateReducer - Start ***/
     else if (action.type === SET_CURRENT_PROBLEM) {
        // Note: this is a little different for student view
        // for students problems can safely be addressed by position in the list
        // this allows new problems to be spawned with blank nubmers and fixed later
        // here CURRENT_PROBLEM will refer to the string typed in by users
        returnState =  {
            ...state,
            CURRENT_PROBLEM : action[CURRENT_PROBLEM]
        };
    } else if (action.type === SET_KEYBOARD_BUTTON_GROUP) {
        returnState =  { ...state,
                 BUTTON_GROUP : action[BUTTON_GROUP]
        }
    }
    /**** Symbol- ephemeralStateReducer- END ** */
    else if (action.type === "NEW_ASSIGNMENT") {
        returnState =  {
            ...state,
            ...assignmentReducer(),
            "DOC_ID" : genID(),
            APP_MODE : EDIT_ASSIGNMENT
        };
    } else if (action.type === "SET_GLOBAL_STATE") {
        returnState =  {...action.newState,
        };
    } else if (action.type === SET_ASSIGNMENT_NAME) {
        returnState =  { ...state,
                 ASSIGNMENT_NAME : action[ASSIGNMENT_NAME]
        }
    } else if (action.type === SET_SHOW_TUTORIAL) {
        returnState =  { ...state,
                 SHOW_TUTORIAL: true
        }
    } else if (action.type === SET_ASSIGNMENTS_TO_GRADE) {
        returnState =  { ...state };       
    }  else if (action.type === TOGGLE_LATEX_EDITOR) {
        returnState =  { ...state,
                LATEX_EDITOR_STATE : !state.LATEX_EDITOR_STATE }; 
    } 
    else if (action.type === SET_ASSIGNMENT_CONTENT) {
        // TODO - consider serializing DOC_ID and other future top level attributes into file
        // for now this prevents all opened docs from clobbering other suto-saves
        returnState =  {
            APP_MODE : EDIT_ASSIGNMENT,
            PROBLEMS : action.PROBLEMS,
            ASSIGNMENT_NAME : action[ASSIGNMENT_NAME],
            CURRENT_PROBLEM : 0,
            "DOC_ID" : action["DOC_ID"] ? action["DOC_ID"] : genID() ,
        };
    } else if (action.type === LOAD_DEFAULT_VALUE) {
        returnState = {
            ...loadDefaultValue(action[LATEX_DEFAULT_VALUE], state),
            LATEX_DEFAULT_VALUE:action[LATEX_DEFAULT_VALUE],
            LATEX_DEFAULT_VALUE_LOADED:true
        };        
    }
    else if (state[APP_MODE] === EDIT_ASSIGNMENT) {
        returnState =  {
            ...assignmentReducer(state, action),
            APP_MODE : EDIT_ASSIGNMENT
        }
    }
    else {
        returnState =  state;
    }          
    return returnState;
}

function loadDefaultValue(defaultvalue, storeState) {
    if(defaultvalue !== undefined && storeState !== undefined) {
        var solution = storeState["PROBLEMS"][0];
        if(solution !== undefined) {             
            var lines = defaultvalue.split(LATEX_NEWLINE);
            solution["STEPS"] = [];
            for(let idx = 0; idx < lines.length; idx++) {
                var step = {
                    STEP_ID : genID(), 
                    CONTENT : lines[idx],
                    FORMAT : "MATH"
                }
                solution["STEPS"].push(step);
            }
        }
    } 
    return storeState;       
}
function getStateValue(storeState) {
    var finalSolution = [];
    if(storeState !== undefined) {
        var solution = storeState["PROBLEMS"][0];
        if(solution !== undefined) {
            var lines = solution["STEPS"]
            for(let idx = 0; idx<lines.length; idx++) {
                finalSolution.push(lines[idx]["CONTENT"]);
            }
        }    
    } else {
        finalSolution.push("");
    }    
    console.log("auto-save event-finalSolution");
    console.log(finalSolution);
    var singleLine = finalSolution.join(LATEX_NEWLINE);
    return singleLine;
}

class FreeMath extends React.Component {

    static propTypes = {
        handelOnChange: PropTypes.func,
    };

    render() {
        const {
            handelOnChange           
        } = this.props;

        console.log("FREEMATH RENDER...");
        console.log(this.props);
        console.log("****************************************");     
        
        // Loading Default Value
        if(!this.props.value[LATEX_DEFAULT_VALUE_LOADED]) {
            var defaultValue =  this.props.defaultValue !== undefined?  this.props.defaultValue : "";
            this.props.storeDispatch({type:LOAD_DEFAULT_VALUE, LATEX_DEFAULT_VALUE: defaultValue});        
        }           
        // Save value - Pass value to Parent
        if(handelOnChange) {
            handelOnChange(getStateValue(this.props.value));            
        }
        
        const handToggleLatexEditor = (e) => {
            this.props.storeDispatch({type : TOGGLE_LATEX_EDITOR});
        };
        if (this.props.value[APP_MODE] === EDIT_ASSIGNMENT) {        
            return (
                <div style={{display: 'inline-block', width: '100%'}} >                       
                    <Assignment value={this.props.value} store={this.props.value} storeDispatch={this.props.storeDispatch}/>
                    <label htmlFor="material-switch">
                        <Switch
                            checked={this.props.value["LATEX_EDITOR_STATE"]}
                            onChange={(e)=>handToggleLatexEditor(e)}
                            onColor="#86d3ff"
                            onHandleColor="#2693e6"
                            handleDiameter={10}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                            height={15}
                            width={38}
                            className="react-switch"
                            id="material-switch"
                            />
                    </label>
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