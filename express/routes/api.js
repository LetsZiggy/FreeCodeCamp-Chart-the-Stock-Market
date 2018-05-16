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
      /*--------------*/
      /*--- QUANDL ---*/
      /*--------------*/
      setTimeout(() => {
        let request = https.request(
          {
            host: `www.quandl.com`,
            path: `/api/v3/datasets/wiki/${v}/data.json?api_key=${process.env.QUANDL}&column_index=11&order=asc&collapse=monthly`,
            headers: { Accept: 'application/json' }
          },
          (response) => {
            response.setEncoding('utf8');
            response.on('data', (data) => { body.push(data.toString()); });
            response.on('end', () => {
              let data = JSON.parse(body.join(''));

              if(data.hasOwnProperty('quandl_error')) {
                console.log('error');
                resolve({
                  error: true,
                  symbol: v
                  // start_date: 'null-null-null',
                  // end_date: 'null-null-null',
                  // order: 'asc',
                  // column_names: ['date', 'Adj. Close'],
                  // data: []
                });
              }
              else {
                data.dataset_data.symbol = v;
                resolve(data.dataset_data);
              }
            });
          }
        );
        /*--------------*/
        /*--- QUANDL ---*/
        /*--------------*/
        //
        //
        //
        /*---------------------*/
        /*--- ALPHA VANTAGE ---*/
        /*---------------------*/
        // let request = https.request(
        //   {
        //     host: `www.alphavantage.co`,
        //     path: `/query?apikey=${process.env.ALPHA_VANTAGE}&function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${v}`,
        //     headers: { Accept: 'application/json' }
        //   },
        //   (response) => {
        //     response.setEncoding('utf8');
        //     response.on('data', (data) => { body.push(data.toString()); });
        //     response.on('end', () => {
        //       let data = JSON.parse(body.join(''));
        //       resolve(data);
        //     });
        //   }
        // );
        /*---------------------*/
        /*--- ALPHA VANTAGE ---*/
        /*---------------------*/

        request.on('error', (error) => { console.log(error); throw error; });
        request.end();
      }, (i * 1000));
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
      webSocketRemove({ type: 'remove', data: req.body.symbol, update: true });
    }

    res.json({ data: req.body.symbol, update: true });
  }
  else {
    res.json({ update: false });
  }
});

module.exports = router;
