export class App {
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