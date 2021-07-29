
const express = require('express')
const path = require('path');
const bodyParser = require('body-parser')
const child_process = require('child_process')
const fs = require('fs');

const app = express()
const port = 3000

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/index.js', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.js'));
});

// POST method route
app.post('/run', function (req, res) {
  console.log(`run\n ${req.body.src}`);
  
  fs.writeFile('input.s', req.body.src, function (err){
    if (err) return console.log(err);
    child_process.exec('./a.out ./input.s', 
      function(error, stdout, stderr){
        if (error) console.log(error);
        res.send(stdout);
      });
  });
});

app.listen(
    port, '0.0.0.0',
    () => {console.log(`Example app listening at http://localhost:${port}`)})

