# 🀄 Mosaic

[comment]: # (TODO replace the link below)

Find out more in the [official documentation](https://scandipwa.gitbook.io/mosaic/)!

## Why

#### 🔌  Make your application extensible

By using Mosaic plugins, you may make any part of your project extensible and modifiable either from within the application itself or from installed Mosaic modules.

#### 🍇  Use granular micro-frontend architecture

Make dependencies injected with plugins instead of importing them! This way, you keep ALL the logic related to the module WITHIN the module, even its use cases!

#### 🖌️  Theming

Build your project by overriding an existing project's functionality! Have infinite amount of parent projects. Similar to straight up forking, but with actual core updating potential. 

#### 🤝  Integrations with existing technologies

No manual configuration tinkering required, we got you covered  🤝

There are several ways on how to get Mosaic in your application - we support Next.js, create-react-app, and simple Webpack installation. Some other technologies are coming soon, stay tuned  😎

## What

#### 🧞  Plugins

Plugins can easily stack onto one another, such way modifying the same place of the application multiple times. It is recommended to use the plugin system to implement functionality reusable among several projects.

Initial code
```js
// @creator/application/src/index.js

/** @namespace Application/getData */
const getData = () => {
    return ['Initial data'];
}

const data = getData();
```

With this plugin
```js
// @creator/extension/src/plugin/some.plugin.js

module.exports = {
    'Application/getData': {
        function: (args, callback, context) => {
            const data = callback(...args);

            return [
                ...data,
                'Data from the plugin'
            ];
        }
    }
}
```

Produces this
```js
['Initial data', 'Data from the plugin']
```

#### 📔  Overrides

Overrides are the base of the theming mechanism. Use overrides to build your application on top of a parent application.

Initial code in the parent theme
```ts
// parent-ts-react-app/src/App.tsx

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
```

With this override in the child theme
```js
// react-app/src/App.js

import ParentApp from 'Parent/App';

class App extends ParentApp {
  renderContent() {
    return <>
      <p>This is written in the child theme in JS</p>
      { super.renderContent() }
    </>;
  }
}

export default App;
```

Produces this HTML output

```html
<div class="Application">
  <p>This is written in the child theme in JS</p>
  <p>This is written in the parent theme in TS</p>
</div>
```
