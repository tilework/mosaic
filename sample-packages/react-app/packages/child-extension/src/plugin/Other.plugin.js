/* eslint-disable */

const render = (a, c) => {
    return (
        <div className="RedBorder" style={{ border: '3px solid red' }}>
            {c(...a)}
        </div>
    );
}

export default {
    'ReactApp/App': {
        'member-function': {
            render
        }
    }
};