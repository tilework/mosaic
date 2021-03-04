const React = { PureComponent: class {} };

/** @namespace MyClass */
class MyClass extends React.PureComponent {
    render() {
        console.log('I am alive!');
    }
}

(new MyClass).render()

/** @namespace Application */
const application = () => {
    console.log('Hello, world!');
}

module.exports = application;