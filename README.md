# ⚡️ Plug.js

[comment]: # (TODO replace the link below)

Find out more in the [official documentation](https://app.gitbook.com/@plugjs/s/plugjs/)!

## What

#### 🧞‍♂️ Plugins

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

#### 🦾 Overrides

## Why

#### 🥷🏼 Make your application extensible

By using PlugJS plugins, you may make any part of your project extensible and modifiable either from within the application itself or from installed PlugJS modules.

#### ✨ Use granular micro-frontend architecture

Make dependencies injected with plugins instead of importing them! This way, you keep ALL the logic related to the module WITHIN the module, even its use cases!

#### 🎨 Theming

Build your project by overriding an existing project's functionality! Have infinite amount of parent projects. Similar to straight up forking, but with actual core updating potential. 

#### 🤝 Integrations with existing technologies

No manual configuration tinkering required, we got you covered 🤝

There are several ways on how to get PlugJS in your application - we support Next.js, create-react-app, and simple Webpack installation. Some other technologies are coming soon, stay tuned 😎
