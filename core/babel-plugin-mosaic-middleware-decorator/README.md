## @tilework/babel-plugin-mosaic-middleware-decorator

This package handles `@namespace` magic comments' transformation in Mosaic-powered applications. This ensures a convenient API to interact with Mosaic's functionality. See examples of transformations below.

#### Classes
```js
/** @namespace App/Component/Soup */
class Soup extends OtherClass {
    ...
}

const Soup = Mosaic.middleware(class Soup extends Mosaic.Extensible(OtherClass) {
    ...
}, 'App/Component/Soup');
```

#### Arrow function declarations
```js
/** @namespace App/Component/Soup/addSalt */
const addSalt = (soup) => soup.salt++;

const addSalt = Mosaic.middleware((soup) => soup.salt++, 'App/Component/Soup/addSalt');
```

#### Anonymous arrow functions
```js
soupPromise.then(
    /** @namespace App/Component/Soup/soupPromiseThen */
    (soup) => soup.addSalt()
);

soupPromise.then(
    Mosaic.middleware((soup) => soup.addSalt(), 'App/Component/Soup/soupPromiseThen')
);
```

#### Functions
```js
/** @namespace App/Component/Soup/addSalt */
function addSalt(soup) { 
    soup.salt++;
}

const addSalt = Mosaic.middleware(function addSalt(soup) { 
    soup.salt++;
}, 'App/Component/Soup/addSalt');
```