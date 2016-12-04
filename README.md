# x0x0x (client)

federated link sharing

* no likes/faves/stars
* no public identity
* just links from servers

## setup

Just open up in your favorite browser and subscribe to networks that are running the [x0x0x server](https://www.npmjs.com/package/x0x0x-server).

If you plan to access this page on your mobile device, you may need to host it publicly somewhere if you are not able to access local files. You can host this anywhere as static HTML or you can just use [https://ednapiranha.github.io/x0x0x-client](https://ednapiranha.github.io/x0x0x-client).

If you want to make changes to the client-side JS code and need to update bundle.js:

    npm run build

Then make your changes and run `npm run build` before refreshing to your updates.

## side notes about adding support for ES6/ES7, etc

If you choose to add a third-party option such as webpack, gulp or grunt, you are free to do this on your fork. To keep this minimal and compact, we've opted out of adding this as a default option on the codebase.
