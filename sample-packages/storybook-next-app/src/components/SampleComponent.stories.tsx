import React from 'react';

export const SampleComponent = (props) => (
    <>My cool components with props: {JSON.stringify(props)}</>
);

export default {
    title: 'SampleComponent',
    component: SampleComponent
};