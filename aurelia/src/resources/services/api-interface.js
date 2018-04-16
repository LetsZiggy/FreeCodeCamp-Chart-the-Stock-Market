import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class ApiInterface {
  constructor(HttpClient) {
    HttpClient.configure(config => {
      // config.withBaseUrl('http://localhost:3000/api')
      config.withBaseUrl('https://letsziggy-freecodecamp-dynamic-web-application-03.glitch.me/api')
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
               .then(data => data)
    );
  }

  addStock(symbol, webSocket) {
    if(webSocket) {
      webSocket.send(JSON.stringify({ type: 'add', symbol: symbol.toUpperCase() }));
    }
    else {
      return(
        this.http.fetch(`/stock/get`, {
                   method: 'POST',
                   credentials: 'same-origin',
                   headers: {
                     'Accept': 'application/json',
                     'Content-Type': 'application/json'
                   },
                   body: JSON.stringify({ symbol: symbol.toUpperCase() })
                 })
                 .then(response => response.json())
                 .then(data => data)
      );
    }
  }

  removeStock(symbol, webSocket) {
    if(webSocket) {
      webSocket.send(JSON.stringify({ type: 'remove', symbol: symbol.toUpperCase() }));
    }
    else {
      return(
        this.http.fetch(`/stock/remove`, {
                   method: 'POST',
                   credentials: 'same-origin',
                   headers: {
                     'Accept': 'application/json',
                     'Content-Type': 'application/json'
                   },
                   body: JSON.stringify({ symbol: symbol.toUpperCase() })
                 })
                 .then(response => response.json())
                 .then(data => data)
      );
    }
  }
}