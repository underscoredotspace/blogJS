# A Blog in JavaScript

[![Tests](https://travis-ci.org/underscoredotspace/blogJS.svg?branch=master)](https://travis-ci.org/underscoredotspace/blogJS)
[![Coverage](https://coveralls.io/repos/github/underscoredotspace/blogJS/badge.svg?branch=master)](https://coveralls.io/github/underscoredotspace/blogJS?branch=master)

A small single-user blog, with One Time Passcodes (OTP) instead of users and passwords. **Not ready for use**. 

## Installation
An environment variables must be set prior to run; `MONGO_ADDR` is the  **full** address of the mongodb where the blog will be stored. 

``MONGO_ADDR="mongodb://user:password@server:port/dbname"
``

run `yarn install & yarn build` before starting up with `yarn start`. 

## OTP Setup
On first run an admin code will be written to the console, which is required to reveal the QR code needed to complete setup. 

Navigate to `/#!/setup` and follow the steps to add your key to Google Authenticator. You will need access to the console on your server to get the setup code. 

## Development
Please check out [TODO.md](httsp://github.com/underscoredotspace/blogJS/blob/master/TODO.md) first as I have a number of structure issues that need fixed. I'm not accepting pull requests at the moment, but if you spot an issue feel free to log it in [GitHub Issues](https://github.com/underscoredotspace/blogJS/issues). 