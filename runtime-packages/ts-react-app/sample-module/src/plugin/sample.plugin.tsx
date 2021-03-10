import React from "react";

// const AppPlugin = (args: [], callback: () => React.FC<{}>) => {
const AppPlugin = (args, callback) => {
    return (
    <React.Fragment> 
        Hello from plugin!
        {/* { callback() } */}
    </React.Fragment>
    );
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    "App": {
        function: AppPlugin
    }
};
