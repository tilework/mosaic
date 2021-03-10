import React from 'react';
import logo from './logo.svg';
import './App.css';

/** @namespace calculate */
const calculate = (a: number, b: number): number => {
  return a + b;
};

/** @namespace App */
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          5 + 10 = {calculate(5, 10)}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
