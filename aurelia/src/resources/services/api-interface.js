import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class ApiInterface {
  constructor(HttpClient) {
    HttpClient.configure(config => {
      config.withBaseUrl('http://localhost:4000')
      // config.withBaseUrl('http://localhost:3000/api')
      // config.withBaseUrl('https://letsziggy-freecodecamp-dynamic-web-application-02.glitch.me/api')
            .withInterceptor({
              request(request) {
                return request;
              },
              requestError(requestError) {
                console.log(requestError);
                return requestError;
              },
              response(response) {
                return response;
              },
              responseError(responseError) {
                console.log(responseError);
                return responseError;
              }
      });
    });
    this.http = HttpClient;
  }

  getStocks() {
    return(
      this.http.fetch(`/stocks`, {
                 method: 'GET',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json'
                 }
               })
               .then(response => response.json())
               // .then(data => data)
               .then(data => {
                  if(Object.keys(data).length === 0) {
                    return({ update: false });
                  }
                  else {
                    return({ data: handleStocks(data), update: true });
                  }
              })
    );
  }

  addStock(symbol) {
    return(
      this.http.fetch(`/${symbol.toUpperCase()}`, {
                 method: 'GET',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json'
                 }
               })
               .then(response => response.json())
               // .then(data => data)
               .then(data => {
                if(!data) {
                  return({ update: false });
                }
                else {
                  return({ data: handleStock(data), update: true });
                }
              })
    );
    // return(
    //   this.http.fetch(`/stock/get`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //                'Accept': 'application/json',
    //                'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ symbol: symbol })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
  }

  removeStock(symbol) {
    return(
      this.http.fetch(`/stock/remove`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ symbol: symbol })
               })
               .then(response => response.json())
               // .then(data => data)
               .then(data => ({ update: true }))
    );
  }
}

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

  Object.keys(data['Monthly Time Series']).forEach((date) => {
    let year = parseInt(date.split('-')[0]);
    let month = parseInt(date.split('-')[1]);
    // let open = parseFloat(data['Monthly Time Series'][date]['1. open']);
    // let high = parseFloat(data['Monthly Time Series'][date]['2. high']);
    // let low = parseFloat(data['Monthly Time Series'][date]['3. low']);
    let close = parseFloat(data['Monthly Time Series'][date]['4. close']);
    // let volume = parseFloat(data['Monthly Time Series'][date]['5.) volume'];

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

  Object.keys(data).forEach((symbol) => {
    let stock = handleStock(data[symbol]);
    stocks.list.push(stock);
  });

/*
  Object.keys(stocks).forEach((symbol) => {
    let stock = {
      symbol: symbol,
      yearStart: null,
      yearEnd: null,
      monthStart: null,
      monthEnd: null,
      valueMin: null,
      valueMax: null,
      data: []
    };

    Object.keys(stocks[symbol]['Monthly Time Series']).forEach((date) => {
      let year = parseInt(date.split('-')[0]);
      let month = parseInt(date.split('-')[1]);
      // let open = parseFloat(stocks[symbol]['Monthly Time Series'][date]['1. open']);
      // let high = parseFloat(stocks[symbol]['Monthly Time Series'][date]['2. high']);
      // let low = parseFloat(stocks[symbol]['Monthly Time Series'][date]['3. low']);
      let close = parseFloat(stocks[symbol]['Monthly Time Series'][date]['4. close']);
      // let volume = parseFloat(stocks[symbol]['Monthly Time Series'][date]['5.) volume'];

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

    data.stocks.push(stock);
  });
*/

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