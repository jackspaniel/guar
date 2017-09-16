const express = require('express');
const app = express();
const demoApp = require('./demo/demoApp');
const altDemoApp = require('./demo/altDemoApp');

app.set('view engine', 'jade');
app.set('view options', { layout: false });

(process.argv[2] === '--alt') ? altDemoApp(app) : demoApp(app);

app.listen(process.env.PORT || 3000);
console.log("Listening on port: " + (process.env.PORT || 3000));

