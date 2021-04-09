# @tilework/eslint-plugin-mosaic

Eslint plugin for Mosaic

## Installation

You'll first need to install [ESLint](http://eslint.org):

```bash
npm i eslint --save-dev
```

Next, install `@tilework/eslint-plugin-mosaic`:

```bash
npm install @tilework/eslint-plugin-mosaic --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@tilework/eslint-plugin-mosaic` globally.

## Usage

Add `@tilework/eslint-plugin-mosaic` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@tilework/mosaic"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@tilework/mosaic/rule-name": 2
    }
}
```

