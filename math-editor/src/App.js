import logo from './logo.svg';
import './App.css';
import React, {useState} from 'react';

/* Editor Intt - Start */
import {createStore} from "redux"
import { getCompositeState, rootReducer, ephemeralStateReducer, autoSave} from './component/Freemath/FreeMath.js';
import { render,  checkAllSaved } from './component/Freemath/Editor';
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
  console.log(rootReducer);
  window.store = createStore(rootReducer);
  window.ephemeralStore = window.store;
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

/* Editor Intt - End */

function App() {
  
  const initState = { enableEditor: false}
  const [state, setState] = useState(initState);
  const handleOnClick = function(prevState){
    var newState = {
      ...prevState,
      enableEditor: !prevState.enableEditor
    }
    setState(newState);
    
  }

  if(state.enableEditor) {
    return ( 
      <div className="App">
       <button  onClick={()=> handleOnClick(state)}> back </button>      
      </div>
    );

  } else{
    
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>
            {/* Todo
                1. Copy MathQuill Recource
                2. Install underscore package: npm install underscore
                3. npm install redux
                4. npm install react-redux
              */
            }  
            <button  onClick={()=> handleOnClick(state)}> Math-Editor </button>
          </h1>              
        </header>
      </div>
    );
  }
  
}

export default App;
