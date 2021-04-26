import './index.css';

import { PureComponent } from 'react';

/** @namespace ParentTsReactApp/App */
class App extends PureComponent {
    renderContent(): React.ReactNode {
        return <p>This is written in the parent theme in TS</p>;
    }

    render(): React.ReactNode {
        return (
            <div className="Application">
                { this.renderContent() }
            </div>
        );
    }
}

export default App;
