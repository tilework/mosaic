import './index.css';

import { PureComponent } from 'react';

class App extends PureComponent<{}, {}> {
  renderContent() {
    return <p>This is written in the parent theme in TS</p>;
  }

  render() {
    return (
      <div className="Application">
        { this.renderContent() }
      </div>
    );
  }
}

export default App;
