import React from 'react';
import ReactDOM from 'react-dom';
import '../../App.css';
import './Editor.css';
import FreeMath, { getCompositeState } from './FreeMath.js';

var MathQuill = window.MathQuill;

function checkAllSaved() {
    const appState = getCompositeState();   
}

function render() {
    const globalState = getCompositeState();
    ReactDOM.render(
        <div>
            <FreeMath value={globalState} />
        </div>,
        document.getElementById('root')
    );
}

export { render, checkAllSaved};
