var express = require('express'),
app = express(),
MongoClient = require('mongodb').MongoClient,
logger = require('morgan'),
bodyParser = require('body-parser'),
config = require('./config'),
assert = require('assert');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//var url = 'mongodb://web:uRs0ThQ7i5uf@35.158.68.96:27017/teinvit_db';
var url='mongodb://web:uRs0ThQ7i5uf@cluster0-shard-00-00-intpm.mongodb.net:27017,cluster0-shard-00-01-intpm.mongodb.net:27017,cluster0-shard-00-02-intpm.mongodb.net:27017/teinvit_db?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,x-access-token');
    //next();
    if ('OPTIONS' == req.method) {
        res.status(200).send("OK");
    }
    else {
        console.log('reached other');
        next();
    }
});

// error handlers


MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    console.log("Connected correctly to server");
    //db.collection.createIndex({"name":"text"})
    
    var apiRoutes = require('./api')(app, express, db);
    app.use('/api', apiRoutes);
    //db.close();
})

app.use(function(err, req, res, next) {
    res.status(err.status || 500).send({message: err.message, error: err});
});
app.listen(config.PORT, function(){
    console.log('API server running on '+ config.PORT);
});



