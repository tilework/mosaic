# Contributing

## Installing the project

In order to install the cloned project, run node dependency installation in the root directory.
It is recommended to use `yarn@1.18.0` for this.

```bash
# Recommended
yarn
```

## Contribution

When making a contribution, feel welcome to open a pull request. Please, verbosely describe the problem you are solving and the approach used for that. Your code should be well-readable, and commented if necessary. Consistent with the existing ESLint configuration and commonly applied in this project coding approaches.

All of the implemented functionalty should be tested on sample packages provided in this repository.

## Project structure

In order to find any specific documentation about the package, look into the package. The list below contains generic descriptions for each package, to simplify the process of getting acknowledged with the project structure.

Remember to check the [official Mosaic documentation](https://docs.mosaic.js.org/) to find out more about usage specifics and supported functionality.

## Integration

Packages in `integration/` directory are related to integrating Mosaic with different technologies.

### **`mosaic-config-injectors`** 

Core integration package. All the integrations are implemented by injecting Webpack and Babel configurations with functionality from this package. If you need to modify something in all of Mosaic-powered applications, on the config side, it's done here.

Features:
- Webpack configuration modifications
- Babel configuration modifications

### **`mosaic-cra-scripts`** 

Integration with CSR React. Basically, a wrapper over `react-scripts` which injects their Webpack and Babel config with our additional stuff.

Features:
- build configuration plugins (ScandiPWA, via CRACO api)
- testing CRA applications
- launching CRA applications with Mosaic integrated into them seemlessly

### **`mosaic-nextjs-scripts`**

Integration with Next.js. A wrapper over `next` which injects their Webpack and Babel configs with our stuff. 

Features:
- all the Next.js specific [features](https://docs.mosaic.js.org/next.js-features)
- launching Next.js applications with Mosaic integrated into them seemlessly
- root Babel and Next.js configurations

### **`mosaic-node-scripts`**

Features to provide better development experience for Node. It is expected that Node projects are configured manually, and hence the config injectors should be used manually to launch them. This package provides the only feature - linking the extensions, for them to be resolvable.

Features:
- linking extensions

## Core

Packages in `core/` directory contain core logic used by Mosaic technology in order to ensure its functionality.

### **`babel-plugin-mosaic-middleware-decorator`**

The very package to provide the `@namespace` "magic comment" functionality. The main purpose is to transform the code during the build process, converting one declarations to other ones. See abstract example below.

Useful documentation for development of this package:

- Official Babel plugin developer documentation [here](https://github.com/jamiebuilds/babel-handbook)
- Babel AST nodes' documentation [here](https://babeljs.io/docs/en/babel-types)

This code (some examples, don't cover everything)

```js
/** @namespace Util/Add */
const add = (a, b) => {
    return a + b;
};

/** @namespace Component/App */
class App {
    constructor(props) { ... }
    render() { return 'Hello!'; }
}
```

Converts to the following. The `@` converts to `#` factually, it is not a typo.

```js
/** #namespace Util/Add */
const add = Mosaic.middleware(
    (a, b) => {
        return a + b;
    },
    'Util/Add'
);

/** #namespace Component/App */
Mosaic.middleware(
    class App extends Mosaic.Extensible() {
        constructor(props) { super(props); ... }
        render() { return 'Hello!'; }
    },
    'Component/App'
)
```

### **`eslint-plugin-mosaic`**

ESLint rule declarations for Mosaic. See more documentation inside.

Useful documentation for development of this package:

- Official ESLint plugin developer documentation [here](https://eslint.org/docs/developer-guide/working-with-plugins)

### **`eslint-config-mosaic`**

Ready-made configuration with recommended plugins. Not automatically injected into CSA projects atm.

### **`mosaic`**

The Mosaic package itself, contains all the runtime logic of Mosaic.

Features:
- middleware - a method to attach a namespace to a piece of functionality
- Extensible - a method to ensure proper context during the construction of the given class. Important for interception of class properties being declared with [class property syntax](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties/) during their initialisation in constructor
- setPlugins - a method that accepts an array of modules which are `.plugin.js` files, sets the internal property and exposes it to the window object.

Work principle:
- Middleware function wraps functionality into a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). 
- If functionality is a class - this is a class (instanceof Proxy) that returns a instance (instanceof Proxy too)
- If the functionality is a function
  - When it is called, the plugins are being extracted from the `lib/plugins/plugin-storage` and a new function is generated from these plugins, wrapping them around the initial function. Then this function is called on the original arguments. The same algorithm is applied to callable class members.
- If the functionality is a class
  - Babel plugin ensures that the class extends from `Mosaic.Extensible(...)` to ensure instance property modifications (above)
  - When instance is created, all of the `member-property` plugins are applied to it, replacing the original properties with the ones the plugins result into.
  - The instance is a proxy, when calling any member of the instance the plugin storage is scanned for the corresponding plugins and the plugins are applied to the callable member before executing it
  - The class itself is a proxy, to ensure that calls to static methods are handled too

### **`mosaic-craco`**

Craco fork for Mosaic. See its purpose within the package itself.

### **`mosaic-dev-utils`**

All the development utilities used in Mosaic packages themselves, as well as in `create-scandipwa-app` packages. This also is a dependency of `scandipwa-dev-utils` and `scandipwa-development-toolkit-core`.

Features:
- Build configuration plugins, for config injectors (NOT for CRA setup)
- Extension configuration gathering for specified CWD
- Context resolution (bubble from directory to package with `mosaic` or `scandipwa` field in package.json)
- Link extensions - provide symlinks to declared in package.json local modules
- Logger - with all the styling and logging functionality
- Mosaic configuration extraction from package.json (both as `mosaic` field and as `scandipwa`)
- Parent theme utils
- ... other useful minor stuff

### **`mosaic-test-utils`**

Utilities to ensure proper testing (with resolution of all the modules and loading plugins into execution contexts) for several integration technologies.

Supported integrations:
- Next.js
- CRA

### **`mosaic-webpack-fallback-plugin`**

Fallback plugin ensures override functionality during the process of file resolution. It uses all of the themes and extensions as sources. To figure out its work mechanics, check [this article](https://docs.mosaic.js.org/themes/parent-themes).

Useful documentation for development of this package:

- Webpack plugin API [here](https://webpack.js.org/api/plugins/)

### **`mosaic-webpack-import-loader`**

This Webpack Loader injects imports for all of the `.plugin.js` files into the runtime.

Useful documentation for development of this package:

- Webpack loader API [here](https://webpack.js.org/api/loaders/)

## Sample packages

The packages in `sample-packages/` directory are used for testing the implementable functionality and demonstrating it to the newcomers. When submitting a PR, please test it on all of the packages this PR impacts.
