import React from 'react';

export const SampleComponent = (props) => {

    return (
        <>My cool components with props: {JSON.stringify(props)}</>
    );
};


export default {
    title: 'SampleComponent',
    component: SampleComponent
};