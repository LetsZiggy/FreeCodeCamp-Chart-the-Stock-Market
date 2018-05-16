const https = require('https');
const mongo = require('mongodb').MongoClient;
const {handleStock} = require('./handle-stocks');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

async function handleAdd(symbol) {
  return(
    new Promise((resolve, reject) => {
      let body = [];
      /*--------------*/
      /*--- QUANDL ---*/
      /*--------------*/
      let request = https.request({
        host: `www.quandl.com`,
        path: `/api/v3/datasets/wiki/${symbol}/data.json?api_key=${process.env.QUANDL}&column_index=11&order=asc&collapse=monthly`,
        headers: { Accept: 'application/json' }
      });

      request.on('response', async (response) => {
        response.setEncoding('utf8');
        response.on('data', (data) => { body.push(data.toString()); });
        response.on('end', async () => {
          let data = JSON.parse(body.join(''));
          console.log(data);

          if(data.hasOwnProperty('quandl_error')) {
            console.log('error');
            resolve({ bool: false, push: false });
          }
          else {
            let client = await mongo.connect(dbURL);
            let db = await client.db(process.env.DBNAME);
            let collectionIDs = await db.collection('chart-the-stock-market-ids');
            let update = await collectionIDs.updateOne({ type: 'symbols', list: { $not: { $in: [symbol] } } }, { $push: { list: symbol } });
            client.close();

            data.dataset_data.symbol = symbol;
            data = handleStock(data.dataset_data);

            resolve({ data: data, bool: true, push: !!update.modifiedCount });
          }
        });
      });
      /*--------------*/
      /*--- QUANDL ---*/
      /*--------------*/
      //
      //
      //
      /*---------------------*/
      /*--- ALPHA VANTAGE ---*/
      /*---------------------*/
      // let request = https.request({
      //   host: 'www.alphavantage.co',
      //   path: `/query?apikey=${process.env.ALPHA_VANTAGE}&function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${symbol}`,
      //   headers: { Accept: 'application/json' }
      // });

      // request.on('response', async (response) => {
      //   response.setEncoding('utf8');
      //   response.on('data', (data) => { body.push(data.toString()); });
      //   response.on('end', async () => {
      //     let data = JSON.parse(body.join(''));

      //     if(data.hasOwnProperty('Error Message')) {
      //       console.log('error');
      //       resolve({ bool: false, push: false });
      //     }
      //     else {
      //       let client = await mongo.connect(dbURL);
      //       let db = await client.db(process.env.DBNAME);
      //       let collectionIDs = await db.collection('chart-the-stock-market-ids');
      //       let update = await collectionIDs.updateOne({ type: 'symbols', list: { $not: { $in: [symbol] } } }, { $push: { list: symbol } });
      //       client.close();

      //       data = handleStock(data);
      //       resolve({ data: data, bool: true, push: !!update.modifiedCount });
      //     }
      //   });
      // });
      /*---------------------*/
      /*--- ALPHA VANTAGE ---*/
      /*---------------------*/

      request.on('error', (error) => { console.log(error); throw error; });
      request.end();
    })
  );
}

async function handleRemove(symbol) {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionIDs = await db.collection('chart-the-stock-market-ids');
  let update = await collectionIDs.updateOne({ type: 'symbols', list: { $in: [symbol] } }, { $pull: { list: symbol } });
  client.close();

  return({ bool: true, push: !!update.modifiedCount });
}

module.exports = {
  handleAdd: handleAdd,
  handleRemove: handleRemove,
};