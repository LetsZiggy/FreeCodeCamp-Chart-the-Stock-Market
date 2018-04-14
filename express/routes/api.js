const https = require('https');
const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
const handleStock = require('./services/handle-stock.js');
const handleStocks = require('./services/handle-stocks.js');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

router.get('/stocks', async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionIDs = await db.collection('chart-the-stock-market-ids');
  let find = await collectionIDs.findOne({ type: 'symbols' }, { projection: { _id: 0, type: 0 } });
  client.close();

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
});

router.post('/stock/get', async (req, res, next) => {
  let body = [];
  let request = https.request(
    {
      host: 'www.alphavantage.co',
      path: `/query?apikey=${process.env.ALPHA_VANTAGE}&function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${req.body.symbol}`,
      headers: { Accept: 'application/json' }
    },
    (response) => {
      response.setEncoding('utf8');
      response.on('data', (data) => { body.push(data.toString()); });
      response.on('end', async () => {
        let data = JSON.parse(body.join(''));

        if(data.hasOwnProperty('Error Message')) {
          console.log('error');
          res.json({ update: false });
        }
        else {
          mongo.connect(dbURL, (err, client) => {
            if(err) { console.log(err); throw err; }
            else {
              const db = client.db(process.env.DBNAME);

              db.collection('chart-the-stock-market-ids')
                .updateOne(
                  { type: 'symbols' },
                  { $push: { list: req.body.symbol } }
              );
            }

            client.close();
          });

          data = handleStock(data);
          res.json({ data: data, update: true });
        }
      });
    }
  );

  request.on('error', (error) => { console.log(error); throw error; });
  request.end();
});

router.post('/stock/remove', async (req, res, next) => {
  mongo.connect(dbURL, (err, client) => {
    if(err) { console.log(err); throw err; }
    else {
      const db = client.db(process.env.DBNAME);

      db.collection('chart-the-stock-market-ids')
        .updateOne(
          { type: 'symbols' },
          { $pull: { list: req.body.symbol } }
      );
    }

    client.close();
  });

  res.json({ update: true });
});

module.exports = router;
