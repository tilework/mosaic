# @plugjs/eslint-plugin

Eslint plugin for PlugJS

## Installation

You'll first need to install [ESLint](http://eslint.org):

```bash
npm i eslint --save-dev
```

Next, install `@plugjs/eslint-plugin`:

```bash
npm install @plugjs/eslint-plugin --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@plugjs/eslint-plugin` globally.

## Usage

Add `@plugjs/eslint-plugin` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@plugjs"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@plugjs/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





