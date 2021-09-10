import { createStore } from 'redux';
import './index.css';
import { getCompositeState, rootReducer, ephemeralStateReducer } from './FreeMath';
import { render,  checkAllSaved } from './DefaultHomepageActions';
import { autoSave } from './FreeMath.js';

var ADD_DEMO_PROBLEM = 'ADD_DEMO_PROBLEM';
var APP_MODE = 'APP_MODE';
var EDIT_ASSIGNMENT = 'EDIT_ASSIGNMENT';

var CURRENT_PROBLEM = 'CURRENT_PROBLEM';

// this action expects an index for which problem to change
var UNDO = 'UNDO';
// this action expects an index for which problem to change
var REDO = 'REDO';


window.onload = function() {
   
    alert("math-editor");
   
    window.store = createStore(rootReducer);
    window.ephemeralStore = createStore(ephemeralStateReducer);
    window.ephemeralStore.subscribe(render);
    window.store.subscribe(render);
    window.store.subscribe(autoSave);

    window.location.hash = '';
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    
    // turn on confirmation dialog upon navigation away
    window.onbeforeunload = checkAllSaved; 
    window.store.dispatch({type : "NEW_ASSIGNMENT"});
    window.store.dispatch({type : ADD_DEMO_PROBLEM});

    document.addEventListener('keydown', function(event) {
        const rootState = getCompositeState();
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            if (rootState[APP_MODE] === EDIT_ASSIGNMENT) {
                window.store.dispatch({ type : UNDO, PROBLEM_INDEX : rootState[CURRENT_PROBLEM]})
            }
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
            if (rootState[APP_MODE] === EDIT_ASSIGNMENT) {
                window.store.dispatch({ type : REDO, PROBLEM_INDEX : rootState[CURRENT_PROBLEM]})
            }
        }
    });

    render();
};

