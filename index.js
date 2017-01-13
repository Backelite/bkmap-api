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
        db.close();
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
  beacon.uuid = `${beacon.uuid}-${beacon.major}-${beacon.minor}`;

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
  laptop.id = laptop.id.toLowerCase();
  laptop.beacons = [];

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

app.post('/laptops/:id/beacons', function(request, response){
  let rawBeacons = request.body;
  console.log(rawBeacons);
  let beacons = [];

  if(rawBeacons.length === 0) {
    response.status(200).send('No beacons provided');
  } else {
    rawBeacons.forEach(beacon => {
      beacons.push({
        "uuid": `${beacon.uuid}-${beacon.major}-${beacon.minor}`,
        "major": beacon.major,
        "minor": beacon.minor,
        "distance": beacon.distance,
      });
    });

    mongoClient.connect(mongoDbPath, (err, db) => {
      db.collection('laptops')
        .updateOne(
          { "id": request.params.id },
          {
            $set: { "beacons": beacons }
          }, function(error, result) {
            console.log(` `);
            console.log(`----- Beacons updated for ${request.params.id} -----`);
            console.log(rawBeacons);
            console.log(`----- End of beacons update for ${request.params.id} -----`);
            console.log(` `);
            response.status(201).send(result);
            db.close();
          }
        );
    });
  }
});

app.get('/laptops', function(request, response) {
  let criteria = {};

  if(request.query.beacons) {
    let beacons = request.query.beacons;
    criteria.$and = [];

    beacons.forEach((beacon) => {
      criteria.$and.push({ "beacons.uuid": beacon });
    });
  }

  mongoClient.connect(mongoDbPath, (err, db) => {
    db.collection('laptops')
      .find(criteria)
      .toArray()
      .then((results) => {
        db.close();
        response.status(200).send(results);
      });
  });
});

app.get('/laptops/:id', function(request, response) {
  mongoClient.connect(mongoDbPath, (err, db) => {
    db.collection('laptops')
      .findOne({ id: request.params.id }, function(error, result){
        if(result) {
          response.status(200).send(result);
        } else {
          response.status(404).send(`${request.params.id} not found`);
        }
      })
  });
});

app.listen(3000);
