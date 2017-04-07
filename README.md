# A Blog in JavaScript
A small single-user blog, with One Time Passcodes (OTP) instead of users and passwords. 

## Installation
Two environment variables must be set prior to run: `MONGO_ADDR` and `GA_PASS`. `MONGO_ADDR` is the  **full** address of the mongodb where the blog will be stored. `GA_PASS` is a password/phrase that will be encrypted and used to generate the OTP secret. 

``MONGO_ADDR="mongodb://user:password@server:port/dbname"
GA_PASS="AreallyLongRandmonStringOfCharacters"
``

## OTP Setup
On first run an admin code will be written to the console, which is required to reveal the QR code needed to complete setup. 

Navigate to `/#!/setup` and follow the steps to add your key to Google Authenticator. If you were too slow at inputting the code (it lasts for about a minute), just force the node service to reload and get a new code in the console. 