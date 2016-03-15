A simple wrapper for [tedious](https://github.com/pekim/tedious).

####Intended Usage

Create `tds-config.json` file in your project base dir. It must, at a minimum,
specify `server`, `username`, and `password`. **Remember to gitignore this
file!**

Create `db.js` like:

```Javascript
var db = require('tedious-wrapper')({path: __dirname});
module.exports = db;
```

Then elsewhere in project just require db and use like:

```Javascript
db.exec('some sql', null, function (err, rows) {
  // do something with rows..
});
```

Example with input params:

```Javascript
// Tedious uses '@' to specify params
var sql = 'select * from users where id = @id';

var params = {
  id: {
    type: db.TYPES.Int,
    value: 69,
  },
};

db.exec(sql, params, function (err, rows) {
  // do something with rows..
});
```

Stored procedures:

```Javascript
db.execsp(name, params, function (err, rows) {
  // do something with rows..
});
```
