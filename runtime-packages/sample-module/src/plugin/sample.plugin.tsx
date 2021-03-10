import React from "react";

const AppPlugin = (
    args: [], 
    callback: () => React.ReactNode
) => {
    return (
    <React.Fragment> 
        Hello from plugin!
        { callback() }
    </React.Fragment>
    );
}

const calculate = (
    args: [number, number], 
    callback: (a: number, b: number) => number
) => {
    const result = callback(...args);

    return result * 4;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    "App": {
        function: AppPlugin
    },
    "calculate": {
        function: calculate
    }
};

