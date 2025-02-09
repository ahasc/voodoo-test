const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const { Op, where } =  require('sequelize');
const axios = require('axios');
const flatten = require('lodash/flatten')

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

app.get('/api/games', (req, res) => db.Game.findAll()
  .then(games => res.send(games))
  .catch((err) => {
    console.log('There was an error querying games', JSON.stringify(err));
    return res.send(err);
  }));

app.post('/api/games', (req, res) => {
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  return db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    .then(game => res.send(game))
    .catch((err) => {
      console.log('***There was an error creating a game', JSON.stringify(err));
      return res.status(400).send(err);
    });
});

app.delete('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then(game => game.destroy({ force: true }))
    .then(() => res.send({ id }))
    .catch((err) => {
      console.log('***Error deleting game', JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.put('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => {
      const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
      return game.update({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
        .then(() => res.send(game))
        .catch((err) => {
          console.log('***Error updating game', JSON.stringify(err));
          res.status(400).send(err);
        });
    });
});

app.post('/api/games/search', async (req, res) => {
  const { name, platform } = req.body;

  const whereClause = {};
  if (name !== '') {
    whereClause.name = { [Op.like]: `%${name}%` };
  }
  if (platform !== '') {
    whereClause.platform = platform;
  }

  try {
    const games = await db.Game.findAll({
      where: whereClause,
    });

    res.send(games);
  } catch (err) {
    console.log('***Error searching game', JSON.stringify(err));
    res.status(400).send(err);
  }
});

app.post('/api/games/populate', async (req, res) => {
  try {
    const [androidGames, iosGames] = await Promise.all([
      axios.get('https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json')
        .then(res => flatten(res.data)),
      axios.get('https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json')
        .then(res => flatten(res.data)),
    ]);

    const extractTop100 = (list) => list.sort((a, b) => b.rating - a.rating).slice(0, 100);
  
    const androidTop100Games = extractTop100(androidGames); 
    const iosTop100Games = extractTop100(iosGames);

    const insertRecords = [];
    for (const game of [...androidTop100Games, ...iosTop100Games]) {
      insertRecords.push({
        publisherId: game.publisher_id,
        name: game.humanized_name,
        platform: game.os,
        storeId: game.appId,
        bundleId: game.bundle_id,
        appVersion: game.version,
        isPublished: game.release_date !== null,
      });
    }

    await db.Game.bulkCreate(insertRecords);

    res.send();
  } catch (err) {
    console.log('***Error populating game', JSON.stringify(err));
    res.status(400).send(err);
  }
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
