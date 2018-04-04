import {inject, bindable, bindingMode} from 'aurelia-framework';
import PerfectScrollbar from 'perfect-scrollbar';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
    this.radio = null;
  }

  async attached() {
    // let location = document.cookie.replace(/(?:(?:^|.*;\s*)ipinfo\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    if(this.state.user.username && this.state.user.expire && this.state.user.expire - Date.now() > 1) {
      setTimeout(async () => {
        let logout = await this.api.logoutUser();
        this.state.user.username = null;
        this.state.user.expire = null;
      }, this.state.user.expire - Date.now());
    }

    this.ps = new PerfectScrollbar('#results');

    window.onunload = async (event) => {
      if(this.state.user.username) {
        let data = JSON.parse(localStorage.getItem("freecodecamp-build-a-nightlife-coordination-app")) || {};
        data.username = this.state.user.username;
        data.userexpire = this.state.user.expire;
        localStorage.setItem('freecodecamp-build-a-nightlife-coordination-app', JSON.stringify(data));
      }
    };
  }

  detached() {
    this.ps.destroy();
    this.ps = null;
  }

  async openLogin() {
    if(this.state.user.username) {
      let data = JSON.parse(localStorage.getItem("freecodecamp-build-a-nightlife-coordination-app")) || {};
      let logout = await this.api.logoutUser();
      this.state.user.username = null;
      this.state.user.expire = null;
      document.getElementById('login-open-button').innerHTML = 'Login';

      data.username = this.state.user.username;
      data.userexpire = this.state.user.expire;
      localStorage.setItem('freecodecamp-build-a-nightlife-coordination-app', JSON.stringify(data));

      Object.entries(this.state.goingUser).forEach(([key, value]) => {
        this.state.goingUser[key] = false;
      });
    }
    else {
      if(this.state.login.timer) {
        this.radio = 'radio-signin';
        document.getElementById('radio-delay').checked = true;
        this.setTimerInterval(this.state, this.radio, 'signin');
      }
      document.getElementById('login-content').style.visibility = 'visible';
      document.getElementById('login-content').style.pointerEvents = 'auto';
    }
  }

  async handleSearch(form) {
    let data = null;
    if(document.getElementById(form).value.length) {
      let value = document.getElementById(form).value;
      data = await this.api.getBusinesses(value);

      this.state.businesses = data.businesses.map((v, i, a) => v);
      data.businesses.forEach((v, i, a) => {
        this.state.goingTotal[v.id] = 0;
        this.state.goingUser[v.id] = false;
      });
      data.goingUser.forEach((v, i, a) => {
        this.state.goingUser[v] = true;
      });
      Object.keys(data.goingTotal).map((v, i, a) => {
        this.state.goingTotal[v] = data.goingTotal[v];
      });

    }
  }

  setRatings(i, rating) {
    i = rating - i;

    if(i === 0.5) {
      return('https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_star_half_black_24px.svg');
    }
    else if(i <= 0) {
      return('https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_star_border_black_24px.svg');
    }
    else {
      return('https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_star_black_24px.svg');
    }
  }

  setMap(location) {
    let address = '';
    let order = ['address1', 'address2', 'address3', 'city', 'zip_code', 'country', 'state']

    Object.entries(location).forEach(([key, value]) => {
      if(key !== 'display_address') {
        if(value !== null && value.length > 0 && value !== ' ') {
          location[key] = value.toString().replace(/\s/g, '+');
        }
        else {
          location[key] = '';
        }
      }
    });

    order.forEach((v, i, a) => {
      if(location[v] !== null && location[v] !== '' && location[v] !== '+') {
        if(i === 0) {
          address = location[v];
        }
        else {
          address = `${address}+${location[v]}`;
        }
      }
    });

    address = address.replace(/\+\+/g, '+');

    return(`https://www.google.com/maps/place/${address}/`);
  }

  async rsvp(id) {
    if(this.state.user.username === null) {
      document.getElementById('login-content').style.visibility = 'visible';
      document.getElementById('login-content').style.pointerEvents = 'auto';
      if(this.state.user.pending.includes(id)) {
        this.state.user.pending.splice(this.state.user.pending.indexOf(id), 1);
      }
      else {
        this.state.user.pending.push(id);
      }
    }
    else {
      let result = null;

      if(this.state.goingUser[id] === true) {
        result = await this.api.unsetRSVP(id, this.state.user.username);
        if(result) {
          this.state.goingUser[id] = false;
          this.state.goingTotal[id]--;
        }
      }
      else {
        result = await this.api.setRSVP(id, this.state.user.username);
        if(result) {
          this.state.goingUser[id] = true;
          this.state.goingTotal[id] = this.state.goingTotal[id] >= 1 ? this.state.goingTotal[id] + 1 : 1 ;
        }
      }
    }
  }

  resetForm(form) {
    form.reset();
    Array.from(form.children).forEach((v, i, a) => {
      if(v.children[0].hasAttribute('data-length') && v.children[0].getAttribute('data-length') !== '0') {
        v.children[0].setAttribute('data-length', 0);
      }
    });
  }

  setTimerInterval(state, radio, form) {
    state.login.interval = setInterval(() => {
      state.login.timer--;
      if(state.login.timer === 0) {
        document.getElementById(radio).checked = true;
        document.getElementById('wrong-login').style.display = 'none';
        this.resetForm(document.getElementById(form));
        clearInterval(state.login.interval);
      }
    }, 1000);
  }
}