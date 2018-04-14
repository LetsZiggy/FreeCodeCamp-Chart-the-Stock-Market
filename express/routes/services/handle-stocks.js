const handleStock = require('./handle-stock.js');

function handleStocks(data) {
  let stocks = {
    list: [],
    yearStart: null,
    yearEnd: null,
    monthStart: null,
    monthEnd: null,
    valueMin: null,
    valueMax: null
  };

  stocks.list = data.map((v, i, a) => handleStock(v));

  // Get Max, Min, Start, End
  stocks.list.forEach((v, i, a) => {
    if(stocks.yearStart === null) {
      stocks.yearStart = v.yearStart;
      stocks.monthStart = v.monthStart;
    }
    else if(stocks.yearStart > v.yearStart) {
      stocks.yearStart = v.yearStart;
      stocks.monthStart = v.monthStart;
    }

    if(stocks.yearEnd === null) {
      stocks.yearEnd = v.yearEnd;
      stocks.monthEnd = v.monthEnd;
    }
    else if(stocks.yearEnd < v.yearEnd) {
      stocks.yearEnd = v.yearEnd;
      stocks.monthEnd = v.monthEnd;
    }

    stocks.valueMin = stocks.valueMin === null 
      ? v.valueMin
      : stocks.valueMin > v.valueMin
        ? v.valueMin
        : stocks.valueMin;

    stocks.valueMax = stocks.valueMax === null 
      ? v.valueMax
      : stocks.valueMax < v.valueMax
        ? v.valueMax
        : stocks.valueMax;
  });

  return(stocks);
}

module.exports = handleStocks;