# wdthing

A blog-type site where posts are divided into special categories. Each of the
categories has its own writer and its own publish-weekday (one new post in the
category is published on a category's publish-weekday).

## Requirements

- Requirements listed in `package.json`.
- MongoDB

## Installation

1. Get the code: `git clone git://github.com/FelixLoether/wdthing.git`
2. Install the `package.json` requirements: `npm install`
3. Create a user using the MongoDB shell (or whatever other tool you prefer).
   The project doesn't quite support creating a first user.

        db.users.save({name: '<Your Name>', id: 'google-<Your Google Account Id>'})

    Example:

        db.users.save({name: 'Felix', id: 'google-11930093811932843'})
4. Add files the secret configurations.

    - `secret-config.js` expects something like this:
        
            module.exports = {
              session: { secret: '<Your Secret>' },
              port: <Your Port>
            }

    - `auth/secret-config.js` expects this:

            module.exports = {
              google: {
                id: '<Your Google App Id>',
                secret: '<Your Google App Secret>'
              }
            }

    - `db/secret-config.js` expects this:

            module.exports = {
              uri: '<Your DB>'
            }
