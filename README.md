## Wattswap - A peer to peer energy trading platform


## Description

- This is the express server backend for WattSwap
- Also contains the smart contracts which are developed using truffle
- Clone this branch, start the express app, configure truffke on your machine, clone the front end from ##MASTER and enjoy!

## Pre-requisites

- [git](https://git-scm.com/) - v2.13 or greater
- [NodeJS](https://nodejs.org/en/) - `12 || 14 `
- [npm](https://www.npmjs.com/) - v6 or greater

## Running in dev environment

1.  `cd server`
2.  `npm install`
3.  `npm start`
4.  `cd ..`
5.  `npm i -g truffle`
6.  `npm i`
7.  `truffle compile`
8.  `truffle test`
9.  `truffle migrate`
10.  ##You need to install GANACHE from here: 'https://archive.trufflesuite.com/ganache/'

## .env file

This file contains various environment variables that you can configure.


For the project to build, **these files must exist with exact filenames**:

- `public/index.html` is the page template;
- `src/index.jsx` is the JavaScript entry point.

You may create subdirectories inside src.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time.

## Installing a Dependency

You can install any dependencies (for example, React Router) with `npm`:

```sh
npm install --save react-router
```

Alternatively you may use `yarn`:

```sh
yarn add react-router
```

## License

MIT License

