import SourceApp from 'Parent/App';
import './App.css';

/** @namespace calculate */
const calculate = (a: number, b: number): number => {
  return a + b;
};

/** @namespace App */
function App() {
  return <>
    <p>hello from override!</p>
    <p>2 + 2 = {calculate(2, 2)}</p>
    <SourceApp />
  </>;
}

export default App;
