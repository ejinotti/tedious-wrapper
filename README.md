A simple wrapper for [tedious](https://github.com/pekim/tedious).

####Intended Usage

Create `tds-config.json` file in your project base dir. **Remember to gitignore this file!**

Create `db.js` like:

```Javascript
var db = require('tedious-wrapper')({path: __dirname});
module.exports = db;
```

Then elsewhere in project just require db and use like:

```Javascript
db.exec('some sql', function (rows) {
  // do something with rows..
});
```
