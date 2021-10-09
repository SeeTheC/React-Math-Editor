import React from 'react';
import '../../App.css';
import MathInput from './MathInput.js';
import { genID } from './FreeMath.js';

// index in list
var STEP_KEY = 'STEP_KEY';
// long random identifier for a step, used as key for react list of steps
var STEP_ID = 'STEP_ID';

var PROBLEMS = 'PROBLEMS';
// student assignment actions
var ADD_PROBLEM = 'ADD_PROBLEM';
var ADD_DEMO_PROBLEM = 'ADD_DEMO_PROBLEM';

// remove problem expects an "index" property
// specifying which problem to remove
var REMOVE_PROBLEM = 'REMOVE_PROBLEM';
var CLONE_PROBLEM = 'CLONE_PROBLEM';

var PROBLEM_INDEX  = 'PROBLEM_INDEX';

// this action expects:
// PROBLEM_INDEX - for which problem to change
// NEW_PROBLEM_NUMBER - string with problem number, not a numberic
//                    type because the problem might be 1.a, etc.
var NEW_PROBLEM_NUMBER = 'NEW_PROBLEM_NUMBER';
var SET_PROBLEM_NUMBER = 'SET_PROBLEM_NUMBER';
var CONTENT = "CONTENT";

// refers to passing complete step info in an action
//oldStep = {CONTENT : "", FORMAT: "MATH", HIGHTLIGHT: "SUCCESS"};
// current format MATH isn't used, no format implies math
var STEP_DATA = "STEP_DATA";

var SUCCESS = 'SUCCESS';
var ERROR = 'ERROR';
var HIGHLIGHT = 'HIGHLIGHT';
var STEPS = 'STEPS';

var FORMAT = "FORMAT";
var MATH = "MATH";
var TEXT = "TEXT";
var IMG = "IMG";

var INSERT_STEP_ABOVE = 'INSERT_STEP_ABOVE';
var NEW_STEP = 'NEW_STEP';
var NEW_BLANK_STEP = 'NEW_BLANK_STEP';
// this action expects an index for which problem to change
var UNDO = 'UNDO';
// this action expects an index for which problem to change
var REDO = 'REDO';
var DELETE_STEP = 'DELETE_STEP';
// array of problem editing actions
// TODO - these actions usually have data to specify which problem
// they apply to, but I'm planning on having an undo stack per problem
// I won't be adding these values in the actions as I only expect them
// to be consumed by ths sub-reducers, but this may have an impact
// if I switch to more type-safe action constructors in the future
var UNDO_STACK = 'UNDO_STACK';
var REDO_STACK = 'REDO_STACK';
var INVERSE_ACTION = 'INVERSE_ACTION';
// properties for implementing intuitive undo/redo for mathquill editors, so they act (mostly) like
// the regular text boxes in raw HTML
var ADD = 'ADD';
var DELETE = 'DELETE';
var EDIT_TYPE = 'EDIT_TYPE';
var POS = 'POS';

// this action expects:
// PROBLEM_INDEX - for which problem to change
// STEP_KEY - index into the work steps for the given problem
// NEW_STEP_CONTENT - string for the new expression to write in this step
var EDIT_STEP = 'EDIT_STEP';
var NEW_STEP_CONTENT = 'NEW_STEP_CONTENT';
var PROBLEM_NUMBER = 'PROBLEM_NUMBER';
var FABRIC_SRC = 'FABRIC_SRC';
var NEW_FABRIC_SRC = 'NEW_FABRIC_SRC';

// CSS constants
var SOFT_RED = '#FFDEDE';
var GREEN = '#D0FFC9';


class Step extends React.Component {
    parentDivRef = React.createRef();
    state = {
        showMenu: false
    }

    closeMenu = () => {
        this.setState({showMenu: false});
    }

    onBackspace = (evt) => {       
        if (evt.key === 'Backspace') {
            if (this.props.step[CONTENT] === '') {
               this.props.storeDispatch (
                    { type : DELETE_STEP, PROBLEM_INDEX : this.props.problemIndex,
                      STEP_KEY : this.props.stepIndex});
                this.props.focusStep(Math.max(this.props.stepIndex - 1, 0));
            }
        }
    }

    // https://blog.logrocket.com/controlling-tooltips-pop-up-menus-using-compound-components-in-react-ccedc15c7526/
    componentDidUpdate() {
      setTimeout(() => {
        if(this.state.showMenu){
          window.addEventListener('click', this.closeMenu);
        }
        else{
          window.removeEventListener('click', this.closeMenu);
        }
      }, 0);
      if (this.parentDivRef && this.parentDivRef.current) {
        this.parentDivRef.current.removeEventListener('keydown', this.onBackspace);
        this.parentDivRef.current.addEventListener('keydown', this.onBackspace, true);                      
      }
    }

    componentDidMount() {
      if (this.parentDivRef && this.parentDivRef.current) {
        this.parentDivRef.current.removeEventListener('keydown', this.onBackspace);
        this.parentDivRef.current.addEventListener('keydown', this.onBackspace, true);
      }
    }

    focus() {
        // currently this should only not be set for image steps
        if (this.stepRef) this.stepRef.focus();
    }

    render() {
        const step = this.props.step;
        const stepIndex = this.props.stepIndex;
        // TODO - should be cleaner and not pass down the whole global state...
        const problemIndex = this.props.problemIndex;
        const buttonGroup = this.props.buttonGroup;
        // callback passed in to allow requesting focus of another step in the problem
        const focusStepCallback = this.props.focusStep;

        var styles = {};
        if (step[HIGHLIGHT] === SUCCESS) {
            styles = {backgroundColor : GREEN };
        } else if (step[HIGHLIGHT] === ERROR) {
            styles = {backgroundColor : SOFT_RED};
        }
        return (
        <div key={step[STEP_ID]} style={{width:"100%"}}>
            
            <div style={{display:"block", width:"100%"}}>
        <div style={{"float":"left","display":"flex", flexDirection: "row", width: "100%", alignItems: "center"}}>
            {   
            <div
                    ref={this.parentDivRef}
                    onKeyDown={function(evt) {
                            if ((evt.ctrlKey || evt.metaKey) && evt.key === 'e') {
                                const newStepType = 'TEXT';
                                this.props.storeDispatch({
                                    type : EDIT_STEP, PROBLEM_INDEX : problemIndex, FORMAT : newStepType, STEP_KEY : stepIndex,
                                    NEW_STEP_CONTENT : (newStepType === IMG || step[FORMAT] === IMG) ? '' : step[CONTENT]
                                });
                                evt.preventDefault();
                                evt.stopPropagation();
                                // TODO - this probably belongs in ComponentDidMount or somthing
                                focusStepCallback(stepIndex);
                            }
                        }.bind(this)
                    }

                    style={{display: 'inline-block', width: '100%'}}
                >
                    <MathInput
                        key={stepIndex} buttonsVisible='focused'
                        className="mathStepEditor"
                        style={{...styles, overflow: 'auto', marginTop: '8px'}}
                        buttonSets={['trig', 'prealgebra',
                                     'logarithms', 'calculus']}
                        buttonGroup={buttonGroup}
                        stepIndex={stepIndex}
                        ref={ (ref) => this.stepRef = ref }
                        upOutOf={ () => focusStepCallback(stepIndex - 1)}
                        downOutOf={ () => focusStepCallback(stepIndex + 1)}
                        moveOutOf={(stepCount) => focusStepCallback(stepIndex + stepCount)}
                        problemIndex={problemIndex} value={step[CONTENT]}
                        onChange={
                            function(value) {
                                this.props.storeDispatch({
                                type : EDIT_STEP,
                                PROBLEM_INDEX : problemIndex,
                                STEP_KEY : stepIndex,
                                FORMAT : MATH,
                                NEW_STEP_CONTENT : value});
                        }.bind(this)}
                        onSubmit={function() {
                            
                            this.props.storeDispatch(
                                { type : NEW_BLANK_STEP,
                                  STEP_KEY : stepIndex,
                                  PROBLEM_INDEX : problemIndex});
                            focusStepCallback(stepIndex + 1);
                        
                        }.bind(this)}
                        store={this.props.store}
                        storeDispatch={this.props.storeDispatch}
                        stepClassName={this.props.stepClassName}
                    />
                </div>
            }
            </div>     
        </div>
        </div>
        );
    }
}

class Problem extends React.Component {
    handleStepChange = (event) => {
      this.setState({value: event.target.value});
    };

    render() {
        const value = this.props.value;
        const problemIndex = this.props.id;
        const buttonGroup = this.props.buttonGroup;
        const steps = this.props.value[STEPS];

        if (!this.stepRefs) {
            this.stepRefs = [];
        }
        return (
            <div style={{display: 'inline-block', width: '100%'}}>
            <div className="problem-container" style={{display:"inline-block", width:"100%", float:'none'}}>
                    <div className="equation-list" style={{paddingBottom:"10px"}}>
                        <br />

                        {steps.map(function(step, stepIndex) {
                            var stepsCount = steps.length-1;
                            var stepClassName = undefined;
                            if(stepIndex === 0 &&  stepIndex !== stepsCount) {
                                stepClassName = "latex-step-top";                                
                            } else if (stepIndex !== 0 &&  stepIndex !== stepsCount) {
                                stepClassName = "latex-step-middle";                                
                            }
                            else if (stepIndex !== 0 &&  stepIndex === stepsCount)  {
                                stepClassName = "latex-step-bottom";
                            }

                            return (<Step key={problemIndex + ' ' + stepIndex} step={step} stepIndex={stepIndex} value={value}
                                        ref={(ref) => this.stepRefs[stepIndex] = ref }
                                        focusStep={(stepIndex) => {
                                            setTimeout(() => {
                                                const steps = this.props.store[PROBLEMS][problemIndex][STEPS];
                                                if (stepIndex > steps.length - 1) stepIndex = steps.length - 1;
                                                if (stepIndex < 0) stepIndex = 0;
                                                this.stepRefs[stepIndex].focus()
                                            }, 50);
                                        }}
                                        buttonGroup={buttonGroup} problemIndex={problemIndex}
                                        store={this.props.store}
                                        storeDispatch={this.props.storeDispatch}    
                                        stepClassName={stepClassName}
                                    />)
                        }.bind(this))}
                    </div>
            
            </div>
            </div>
        );
    }
}

/*
 * Designing more complex undo/redo, now that individual steps can be deleted or added in the middle
 * Probably want to get rid of "last shown step" property entirely
 * create serializable commands that can mutate in either direction
 * (can I use the existing redux actions?)
 *
 * Some workflows:
 * edit the first blank line
 *     - add an undo event that sets the field blank
 *
 * add new step
 *     - add undo event for delete step
 *
 * user clicks undo button
 *  - pop off the delete step action
 *  - save a new undo even that will add a step and set it's contents
 *  - perform popped delete action
 *
 * new step button again, then edits the new 2nd step shorter
 *  - put on an undo event that will return the contents to it's original form copied from step 1
 *  - part of me thinks this should happen as soon as a step is copied, but that would make
 *    an undo event do nothing
 *    or unneccessarily add another step
 *      - this should immediately add a "delete step" action as noted above, maybe knowing
 *        what to put on the stack requires inspecting what is currently at the top, if it's
 *        related to the same step it may combine two undo events
 *
 * user inserts step above
 *     - add event to delete the step to undo stack
 *
 * user edits a random step in the middle of the series
 *     - add event to change it back to the original contents
 *     - if they edit the same step again, don't add a new event
 *     - previously when doing this excercise I had played around with a basic text field
 *       and the undo/redo there
 *         - trying this again
 *         - typing into box, ctrl-z -> box goes back to blank
 *         - type into box, stop, type again, -> still clears full box
 *         - type, click elsewhere in box, no edit at new cursor position, click back to end
 *           and edit again
 *             - first undo goes back to what was typed originally, second clears the rest of
 *               the way
 *         - type, delete some text
 *             - first undo restores longest text
 *             - second clears
 *         - more complex
 *             - type aaaaaaaaaaaaaaaaaa
 *             - delete to aaaaaa
 *             - add b's   aaaaaabbbbbbbbb
 *             - delete b's back to aaaaaaa
 *             - add c's    aaaaaaacccccccc
 *             - undo then does:
 *             - aaaaaabbbbbbb
 *             - aaaaaaaaaaaaa
 *             - blank
 *             - analysis, appears recording a past deletion isn't considered important
 *                 - it never re-produced the shorter version, assumes useful things to cover
 *                   longer typed this, not truncation
 *                 - something to keep in mind, some of the keywords are likely longer right
 *                   before they are converted into symbols
 *
 */
// reducer for an individual problem
function problemReducer(problem, action) {
    if (problem === undefined) {
        // TODO - need to convert old docs to add undo stack
        return { PROBLEM_NUMBER : "",
                 STEPS : [{STEP_ID : genID(), CONTENT : "", FORMAT: MATH}],
                 UNDO_STACK : [], REDO_STACK : []};
    } else if (action.type === SET_PROBLEM_NUMBER) {
        return {
            ...problem,
            PROBLEM_NUMBER : action[NEW_PROBLEM_NUMBER]
        };
    } else if (action.type === EDIT_STEP) {
        // if the last action was an edit of this step, don't add an undo
        // event for each character typed, collapse them together. Only create
        // a new undo event if the edit made the text shorter.
        var latestUndo = problem[UNDO_STACK].length > 0 ? problem[UNDO_STACK][0] : false;
        const currStep = problem[STEPS][action[STEP_KEY]];
        const currContent = currStep[CONTENT];
        let newContent = action[NEW_STEP_CONTENT];
        let newFabficSrc = action[NEW_FABRIC_SRC];
        const currFormat = currStep[FORMAT];
        const newFormat = action[FORMAT];

        if ( currFormat === MATH && newFormat === TEXT) {
            if (currContent === newContent) {
                // make switching between math and text a little easier
                newContent = newContent.replace(/\\ /g, ' ');
            }
        } else if (currStep[FORMAT] === TEXT && newFormat === MATH) {
            if (currContent === newContent) {
                // make switching between math and text a little easier
                newContent = newContent.replace(/ /g, '\\ ');
            }
        }

        // "ADD" or "DELETE"
        var editType;
        // position of the add or delete
        var pos;
        var updateLastUndoAction = false;
        // when users type into a textbox, they expect an undo/redo function to remove/add series of characters that were typed/deleted
        // not an individual undo/redo action for each 1 character edit. This functionality is implemented by looking at the
        // type of edit is currently being done, and checking if it should be combined with the last undo event on the stack.
        //
        // Check if this is a single character edit. If it is find its location, and detemine if it is an insertion or deletion
        if (currFormat === newFormat && (currFormat === MATH || currFormat === TEXT) && Math.abs(currContent.length - newContent.length) === 1) {
            // find the first mismatching character
            var i = 0;
            for (; i < currContent.length && i < newContent.length; i++) {
                if (newContent.charAt(i) === currContent.charAt(i)) continue;
                else break;
            }

            // inspect the rest of the inputs to determine if this was a single chracter add or delete
            //
            // tricky case to check, highlight multiple characters and paste in the number of chracters that was highlighted
            // this might cause some weird behavior if the strings overlap, but if data is replaced by mostly the same
            // values there really isn't info lost if it acts somewhat like typing the text out in series

            if (newContent.length > currContent.length) {
                // one character addition
                if (i === newContent.length - 1
                        || newContent.substring(i+1) === currContent.substring(i)) {
                    pos = i;
                    editType = ADD;
                    if (latestUndo && latestUndo[INVERSE_ACTION][EDIT_TYPE] === editType
                            && latestUndo[INVERSE_ACTION][POS] === pos - 1) {
                        updateLastUndoAction = true;
                    }
                }
            } else {
                // one character deletion
                if (i === currContent.length - 1
                        || currContent.substring(i+1) === newContent.substring(i)) {
                    pos = i;
                    editType = DELETE;
                    if (latestUndo && latestUndo[INVERSE_ACTION][EDIT_TYPE] === editType
                            && latestUndo[INVERSE_ACTION][POS] === pos + 1) {
                        updateLastUndoAction = true;
                    }
                }
            }
        } else {
            updateLastUndoAction = false;
        }

        let inverseAction = {
            ...action,
            INVERSE_ACTION : {
                type : EDIT_STEP,
                STEP_KEY: action[STEP_KEY],
                FORMAT: currFormat,
                INVERSE_ACTION : {
                    ...action,
                    EDIT_TYPE : editType,
                    POS : pos,
                }
            }
        };
        var newUndoStack;
        if (updateLastUndoAction) {
            inverseAction[INVERSE_ACTION][NEW_STEP_CONTENT] = latestUndo[NEW_STEP_CONTENT];
            let undoAction = {...inverseAction[INVERSE_ACTION]};
            newUndoStack = [
                undoAction,
                ...problem[UNDO_STACK].slice(1)
            ];
        } else {
            inverseAction[INVERSE_ACTION][NEW_STEP_CONTENT] = problem[STEPS][action[STEP_KEY]][CONTENT];
            inverseAction[INVERSE_ACTION][NEW_FABRIC_SRC] = problem[STEPS][action[STEP_KEY]][FABRIC_SRC];
            let undoAction = {...inverseAction[INVERSE_ACTION]};
            newUndoStack = [
                undoAction,
                ...problem[UNDO_STACK]
            ];
        }
        return {
            ...problem,
            UNDO_STACK : newUndoStack,
            REDO_STACK : [],
            STEPS : [
                ...problem[STEPS].slice(0, action[STEP_KEY]),
                // copy properties of the old step, to get the STEP_ID, then override the content
                { ...problem[STEPS][action[STEP_KEY]],
                     CONTENT : newContent,
                     FABRIC_SRC : newFabficSrc,
                     FORMAT : action[FORMAT],
                },
                ...problem[STEPS].slice(action[STEP_KEY] + 1)
            ]
        }
    } else if (action.type === DELETE_STEP) {
        if (problem[STEPS].length === 1) {
            return problem;
        }
        let inverseAction = {
            ...action,
            INVERSE_ACTION : {
                type : INSERT_STEP_ABOVE,
                STEP_KEY: action[STEP_KEY],
                CONTENT : problem[STEPS][action[STEP_KEY]][CONTENT],
                FABRIC_SRC : problem[STEPS][action[STEP_KEY]][FABRIC_SRC],
                FORMAT : problem[STEPS][action[STEP_KEY]][FORMAT],
                INVERSE_ACTION : {...action}
            }
        };
        let undoAction = {...inverseAction[INVERSE_ACTION]};
        return {
            ...problem,
            STEPS : [
                ...problem[STEPS].slice(0, action[STEP_KEY]),
                ...problem[STEPS].slice(action[STEP_KEY] + 1)
            ],
            UNDO_STACK : [
                undoAction,
                ...problem[UNDO_STACK]
            ],
            REDO_STACK : []
        }
    } else if (action.type === INSERT_STEP_ABOVE) {
        let newContent;
        let newFabricSrc = undefined;
        var newFormat = undefined;
        // non-blank inserations in the middle of work currently only used for undo/redo
        if (CONTENT in action) {
            newContent = action[CONTENT]
            newFabricSrc = action[FABRIC_SRC]
            if (FORMAT in action) {
                newFormat = action[FORMAT]
            } else {
                // default to no FORMAT, which is math
            }
        } else {
            // this is the default produced by the button on the UI
            newContent = ""
        }
        let inverseAction = {
            ...action,
            INVERSE_ACTION : {
                type : DELETE_STEP, STEP_KEY: action[STEP_KEY],
                INVERSE_ACTION : {...action}
            }
        };
        let undoAction = {...inverseAction[INVERSE_ACTION]};
        return {
            ...problem,
            STEPS : [
                ...problem[STEPS].slice(0, action[STEP_KEY]),
                { CONTENT : newContent,
                  FABRIC_SRC: newFabricSrc,
                  FORMAT: newFormat, STEP_ID : genID()},
                ...problem[STEPS].slice(action[STEP_KEY])
            ],
            UNDO_STACK : [
                undoAction,
                ...problem[UNDO_STACK]
            ],
            REDO_STACK : []
        }
    } else if(action.type === NEW_STEP || action.type === NEW_BLANK_STEP) {
        var oldStep;
        if (typeof action[STEP_KEY] === 'undefined') {
            action[STEP_KEY] = problem[STEPS].length - 1;
        }
        if (action.type === NEW_STEP) {
            if (action[STEP_DATA]) {
                oldStep = action[STEP_DATA];
            } else if (problem[STEPS][action[STEP_KEY]][FORMAT] === TEXT) {
                // when creating a text step don't copy down previous line
                oldStep = {CONTENT : "", FORMAT: TEXT};
            } else {
                oldStep = problem[STEPS][action[STEP_KEY]];
            }
        } else { // new blank step
            oldStep = {CONTENT : "", FORMAT: MATH};
        }
        // TODO - allow tracking the cursor, which box it is in
        // for now this applies when the button is used instead of hitting enter
        // while in the box, will always add to the end
        let inverseAction = {
            ...action,
            INVERSE_ACTION : {
                type : DELETE_STEP, STEP_KEY: action[STEP_KEY] + 1,
                INVERSE_ACTION : {...action}
            }
        };
        let undoAction = {...inverseAction[INVERSE_ACTION]};
        return {
            ...problem,
            STEPS : [
                ...problem[STEPS].slice(0, action[STEP_KEY] + 1),
                {...oldStep, STEP_ID : genID()},
                ...problem[STEPS].slice(action[STEP_KEY] + 1)
            ],
            UNDO_STACK : [
                undoAction,
                ...problem[UNDO_STACK]
            ],
            REDO_STACK : []
        };
    } else if (action.type === UNDO) {
        if (problem[UNDO_STACK].length === 0) return problem;
        let undoAction = problem[UNDO_STACK][0];
        let inverseAction = {...undoAction[INVERSE_ACTION],
                             INVERSE_ACTION : {...undoAction, INVERSE_ACTION : undefined}};
        let ret = problemReducer(problem, undoAction)
        return {...ret,
                UNDO_STACK : problem[UNDO_STACK].slice(1, problem[UNDO_STACK].length),
                REDO_STACK : [
                    inverseAction,
                    ...problem[REDO_STACK]
                ],
        }
    } else if (action.type === REDO) {
        if (problem[REDO_STACK].length === 0) return problem;
        let redoAction = problem[REDO_STACK][0];
        // this ret has its redo-actions set incorrectly now, because the actions are re-used
        // in a normal mutation any edit should clear the redo stack (because you are back
        // in history and making a new edit, you need to start tracking this branch in time)
        // For redo actions, the stack should be maintained, this is restored below.
        let ret = problemReducer(problem, redoAction)
        let inverseAction = {...redoAction[INVERSE_ACTION], INVERSE_ACTION : redoAction};
        return {...ret,
                REDO_STACK : problem[REDO_STACK].slice(1, problem[REDO_STACK].length),
                UNDO_STACK : [
                    inverseAction,
                    ...problem[UNDO_STACK]
                ],
        }
    } else {
        alert("no matching action handling");
        return problem;
    }
}

// reducer for the list of problems in an assignment
function problemListReducer(probList, action) {
    console.log("-----MY_DEBUG: problemListReducer");
    console.log(action);
    //console.log(probList);
    if (probList === undefined) {
        return [ problemReducer(undefined, action) ];
    }
    if (action.type === ADD_DEMO_PROBLEM) {
        if (probList.length === 1 && probList[0][STEPS][0][CONTENT] === "") {

            return [
                { PROBLEM_NUMBER : "Demo",
                  STEPS : [{
                     STEP_ID : genID(), CONTENT : "4+2-3\\left(1+2\\right)"}],
                  UNDO_STACK : [], REDO_STACK : [],
                  SHOW_TUTORIAL : true
                 }
            ];
        } else {
            return probList;
        }
    } else if (action.type === ADD_PROBLEM) {
        return [
            ...probList,
            problemReducer(undefined, action)
        ];
    } else if (action.type === REMOVE_PROBLEM) {
        if (probList.length === 1) return probList;
        return [
            ...probList.slice(0, action[PROBLEM_INDEX]),
            ...probList.slice(action[PROBLEM_INDEX] + 1)
        ];
    } else if (action.type === CLONE_PROBLEM) {
        var newProb = {
            ...probList[action[PROBLEM_INDEX]],
            PROBLEM_NUMBER : probList[action[PROBLEM_INDEX]][PROBLEM_NUMBER] + ' - copy'
        };
        return [
            ...probList.slice(0, action[PROBLEM_INDEX] + 1),
            newProb,
            ...probList.slice(action[PROBLEM_INDEX] + 1)
        ];
    } else if (action.type === SET_PROBLEM_NUMBER ||
               action.type === EDIT_STEP ||
               action.type === UNDO ||
               action.type === REDO ||
               action.type === DELETE_STEP ||
               action.type === NEW_BLANK_STEP ||
               action.type === INSERT_STEP_ABOVE ||
               action.type === NEW_STEP) {
        return [
            ...probList.slice(0, action[PROBLEM_INDEX]),
            problemReducer(probList[action[PROBLEM_INDEX]], action),
            ...probList.slice(action[PROBLEM_INDEX] + 1)
        ];
    } else {
        return probList;
    }
}

export { Problem as default, problemReducer, problemListReducer};
