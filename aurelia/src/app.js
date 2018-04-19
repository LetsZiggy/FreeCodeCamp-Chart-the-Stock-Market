import {bindable, bindingMode} from 'aurelia-framework';
import {state} from './resources/services/state';

export class App {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  attached() {
    window.onbeforeunload = (event) => {
      if(this.state.webSocket) {
        this.state.webSocket.close();
        this.state.webSocket = null;
        console.log('close');
      }
    };
  }

  configureRouter(config, router) {
    this.router = router;
    config.title = 'FreeCodeCamp - Chart the Stock Market';
    config.map([
      {
        route: '',
        redirect: 'home'
      },
      {
        route: 'home',
        name: 'home',
        moduleId: './resources/modules/home',
        title: 'Home',
        nav: true,
      }
    ]);

    config.mapUnknownRoutes({ redirect: 'home' });
  }
}