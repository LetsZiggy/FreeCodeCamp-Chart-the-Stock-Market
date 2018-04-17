const https = require('https');
const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
const {handleStocks} = require('./services/handle-stocks.js');
const {handleAdd, handleRemove} = require('./services/handle-addremove.js');
const {webSocketAdd, webSocketRemove} = require('../ws.js');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

router.get('/stocks', async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionIDs = await db.collection('chart-the-stock-market-ids');
  let find = await collectionIDs.findOne({ type: 'symbols' }, { projection: { _id: 0, type: 0 } });
  client.close();

  if(find.list.length) {
    let requests = find.list.map(async (v, i, a) => new Promise((resolve, reject) => {
      let body = [];
      let request = https.request(
        {
          host: 'www.alphavantage.co',
          path: `/query?apikey=${process.env.ALPHA_VANTAGE}&function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${v}`,
          headers: { Accept: 'application/json' }
        },
        (response) => {
          response.setEncoding('utf8');
          response.on('data', (data) => { body.push(data.toString()); });
          response.on('end', () => {
            let data = JSON.parse(body.join(''));
            resolve(data);
          });
        }
      );

      request.on('error', (error) => { console.log(error); throw error; });
      request.end();
    }));
    
    Promise.all(requests).then((values) => {
      let data = handleStocks(values);
      res.json({ data: data, update: true });
    });
  }
  else {
    res.json({ update: false });
  }
});

router.post('/stock/add', async (req, res, next) => {
  let result = await handleAdd(req.body.symbol);

  if(result.bool) {
    if(result.push) {
      webSocketAdd({ type: 'add', data: result.data, update: true });
    }

    res.json({ data: result.data, update: true });
  }
  else {
    res.json({ update: false });
  }
});

router.post('/stock/remove', async (req, res, next) => {
  let result = await handleRemove(req.body.symbol);

  if(result.bool) {
    if(result.push) {
      webSocketRemove({ type: 'remove', symbol: req.body.symbol, update: true });
    }

    res.json({ symbol: req.body.symbol, update: true });
  }
  else {
    res.json({ update: false });
  }
});

module.exports = router;
