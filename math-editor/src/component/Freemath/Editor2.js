import React, {Component} from "react";
import '../../App.css';
import './Editor.css';
import FreeMath, { rootReducer } from './FreeMath';
import {createStore} from 'redux'
import {Provider}  from 'react-redux'

class LatexEditor extends Component {
     
    constructor () {
        super();
        this.store = createStore(rootReducer);
    }

    render () {
        return (
            <Provider store={this.store} >
                <FreeMath />
            </Provider>
        );
    }
}


export default LatexEditor;