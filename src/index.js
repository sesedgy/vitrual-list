import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'muicss/dist/css/mui.min.css';
import '@fortawesome/fontawesome-free/css/all.css'
import './index.css';


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
