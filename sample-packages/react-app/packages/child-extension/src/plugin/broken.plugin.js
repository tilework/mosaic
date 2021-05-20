/* eslint-disable */
import { PureComponent } from 'react';

const plugin = (Component) => class HOC extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ border: '3px solid red' }}>
                <Component { ...this.props }/>
            </div>
        );
    }
};

export default {
    'ReactApp/App': {
        class: plugin
    }
};