import React from 'react';
import ReactDOM from 'react-dom';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

ReactDOM.render(<Router><App /></Router>,document.getElementById('root'));