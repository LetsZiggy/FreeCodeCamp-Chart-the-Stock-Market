function handleStock(data) {
  let stock = {
    symbol: data['Meta Data']['2. Symbol'],
    yearStart: null,
    yearEnd: null,
    monthStart: null,
    monthEnd: null,
    valueMin: null,
    valueMax: null,
    data: []
  };

  Object.keys(data['Monthly Adjusted Time Series']).forEach((date) => {
    let year = parseInt(date.split('-')[0]);
    let month = parseInt(date.split('-')[1]);
    // let open = parseFloat(data['Monthly Adjusted Time Series'][date]['1. open']);
    // let high = parseFloat(data['Monthly Adjusted Time Series'][date]['2. high']);
    // let low = parseFloat(data['Monthly Adjusted Time Series'][date]['3. low']);
    let close = parseFloat(data['Monthly Adjusted Time Series'][date]['4. close']);
    // let volume = parseFloat(data['Monthly Adjusted Time Series'][date]['5.) volume'];

    stock.data.push({
      year: year,
      month: month,
      // open: open,
      // high: high,
      // low: low,
      close: close,
      // volume: volume,
    });
  });

  stock.data.reverse();

  // Get Years (start, end)
  stock.data.forEach((v, i, a) => {
    stock.yearStart = stock.yearStart === null 
      ? v.year
      : stock.yearStart > v.year
        ? v.year
        : stock.yearStart;

    stock.yearEnd = stock.yearEnd === null 
      ? v.year
      : stock.yearEnd < v.year
        ? v.year
        : stock.yearEnd;
  });

  // Get Months (start, end)
  stock.data.forEach((v, i, a) => {
    if(v.year === stock.yearStart) {
      stock.monthStart = stock.monthStart === null 
        ? v.month
        : stock.monthStart > v.month
          ? v.month
          : stock.monthStart;
    }
    if(v.year === stock.yearEnd) {
      stock.monthEnd = stock.monthEnd === null 
        ? v.month
        : stock.monthEnd < v.month
          ? v.month
          : stock.monthEnd;
    }
  });

  // Get Values (min, max)
  stock.data.forEach((v, i, a) => {
    stock.valueMin = stock.valueMin === null 
      ? v.close
      : stock.valueMin > v.close
        ? v.close
        : stock.valueMin;

    stock.valueMax = stock.valueMax === null 
      ? v.close
      : stock.valueMax < v.close
        ? v.close
        : stock.valueMax;
  });

  return(stock);
}

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

module.exports = {
  handleStock: handleStock,
  handleStocks: handleStocks,
};