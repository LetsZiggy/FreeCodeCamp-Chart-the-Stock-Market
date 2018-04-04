import {bindable, bindingMode} from 'aurelia-framework';
import {state} from './resources/services/state';

export class App {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  bind() {
    let data = JSON.parse(localStorage.getItem('freecodecamp-chart-the-stock-market')) || {};

    if(data && parseInt(data.userexpire) - Date.now() > 1) {
      this.state.user.username = data.username || null;
      this.state.user.expire = parseInt(data.userexpire) || null;
    }
    else {
      data.username = this.state.user.username;
      data.userexpire = this.state.user.expire;
      localStorage.setItem('freecodecamp-chart-the-stock-market', JSON.stringify(data));
    }
  }

  configureRouter(config, router) {
    this.router = router;
    config.title = 'FreeCodeCamp - Chart the Stock Market';
    config.map([
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