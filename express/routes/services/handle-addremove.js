const https = require('https');
const mongo = require('mongodb').MongoClient;
const {handleStock} = require('./handle-stocks');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

async function handleAdd(symbol) {
  return(
    new Promise((resolve, reject) => {
      let body = [];
      let request = https.request({
        host: 'www.alphavantage.co',
        path: `/query?apikey=${process.env.ALPHA_VANTAGE}&function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${symbol}`,
        headers: { Accept: 'application/json' }
      });

      request.on('response', async (response) => {
        response.setEncoding('utf8');
        response.on('data', (data) => { body.push(data.toString()); });
        response.on('end', async () => {
          let data = JSON.parse(body.join(''));

          if(data.hasOwnProperty('Error Message')) {
            console.log('error');
            resolve({ bool: false });
          }
          else {
            let client = await mongo.connect(dbURL);
            let db = await client.db(process.env.DBNAME);
            let collectionIDs = await db.collection('chart-the-stock-market-ids');
            let update = await collectionIDs.updateOne({ type: 'symbols' }, { $push: { list: symbol } });
            client.close();

            data = handleStock(data)
            resolve({ data: data, bool: true });
          }
        });
      });

      request.on('error', (error) => { console.log(error); throw error; });
      request.end();
    })
  );
}

async function handleRemove(symbol) {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionIDs = await db.collection('chart-the-stock-market-ids');
  let update = await collectionIDs.updateOne({ type: 'symbols' }, { $pull: { list: symbol } });
  client.close();

  return({ bool: update.result.ok });
}

module.exports = {
  handleAdd: handleAdd,
  handleRemove: handleRemove,
};