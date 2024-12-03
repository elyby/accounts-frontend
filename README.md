# Ely.by Accounts Web Frontend

[![Build Status](https://travis-ci.org/elyby/accounts-frontend.svg?branch=master)](https://travis-ci.org/elyby/accounts-frontend)
[![Ely.by translation on Crowdin](https://d322cqt584bo4o.cloudfront.net/elyby/localized.svg)](https://crowdin.com/project/elyby)

Web interface for Ely.by Accounts service. Developed using ReactJS and Flow typing.

## Development

To get the code for this repository, run the following commands:

```bash
# Clone your fork
git clone https://github.com/elyby/accounts-frontend.git
# Switch to the project folder
cd accounts-frontend
# Install dependencies
yarn install
```

After that you need to copy `config/template.env.js` into `config/env.js` and adjust it for yourself. Then you can start
the application in dev mode:

```bash
yarn start
```

This will start the dev server on port 8080, which will automatically apply all changes in project files, as well as
proxy all requests to the backend on the domain specified in `env.js`.

To run the tests execute:

```bash
yarn test
```

### How to submit PR

1. Fork it.

2. Place your code in a separate branch `git checkout -b <your_branch_name>`.

3. Add your fork as a remote `git remote add fork https://github.com/<your_username>/accounts-frontend.git`.

4. Push to your fork repository `git push -u fork <your_branch_name>`.

5. [Create Pull Request](https://github.com/elyby/accounts-frontend/compare).

## Translating

Ely.by translation is done through the [Crowdin](https://crowdin.com) service.
[Click here](https://crowdin.com/project/elyby) to participate in the translation of the project.
