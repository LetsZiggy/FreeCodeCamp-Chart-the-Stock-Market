import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class ApiInterface {
  constructor(HttpClient) {
    HttpClient.configure(config => {
      config.withBaseUrl('http://localhost:3000/api')
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

  // Add here
}