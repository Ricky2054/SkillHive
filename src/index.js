import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import NavigationProvider from './context/navigation';
import { store } from './store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NavigationProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </NavigationProvider>
  </React.StrictMode>
);
