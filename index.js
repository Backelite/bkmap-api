const express = require('express');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const mongoDbPath = 'mongodb://localhost:27017/bkmap';
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', function (request, response){
  response.send('bkmap');
});

app.get('/beacons', function(request, response) {
  mongoClient.connect(mongoDbPath, (err, db) => {
    db.collection('beacons')
      .find()
      .toArray()
      .then((results) => {
        response.status(200).send(results);
      });
  });
});

app.get('/beacons/:id', function(request, response){
  mongoClient.connect(mongoDbPath, (err, db) => {
    db.collection('beacons')
      .findOne({ uuid: request.params.id }, function(error, result){
        response.status(200).send(result);
      })
  });
});

/**
 * Beacon creation
 * {
 *  uuid: string,
 *  major: integer,
 *  minor: integer,
 *  position: {
 *    x: integer,
 *    y: integer,
 *    stage: integer,
 *  }
 * }
 *
 */
app.post('/beacons', function (request, response) {
  const beacon = request.body;

  mongoClient.connect(mongoDbPath, (err, db) => {
    db.collection('beacons')
      .insertOne(
        beacon,
        (error, result) => {
          if (error) {
            response.status(400).send({ err });
          } else {
            response.status(201).send(result);
            db.close();
          }
        }
      );
  });
});

/**
 * Laptop creation
 * {
 *  id: string,
 *  user: integer
 * }
 *
 */
app.post('/laptops', function(request, response){
  const laptop = request.body;

  mongoClient.connect(mongoDbPath, (err, db) => {
    db.collection('laptops')
      .insertOne(
        laptop,
        (error, result) => {
          if (error) {
            response.status(400).send({ err });
          } else {
            response.status(201).send(result);
            db.close();
          }
        }
      );
  });
});

app.listen(3000);
