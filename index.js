const express = require('express');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const mongoDbPath = 'mongodb://localhost:27017/bkmap';
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', function (request, response){
  response.send('bkmap');
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

app.listen(3000);
