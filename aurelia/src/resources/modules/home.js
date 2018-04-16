import {inject, bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {Chart} from 'chartjs';
import PerfectScrollbar from 'perfect-scrollbar';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';
import {chartMainData, chartMainOptions} from '../services/chart-settings';
import {setLabels, setDatasets} from '../services/draw-chart';

let xAxisLabels = [];

@inject(ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) chartMainData = chartMainData;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) chartMainOptions = chartMainOptions;

  constructor(ApiInterface) {
    this.api = ApiInterface;
    this.state.webSocket = null;
    this.ps = null;
    this.chart = null;
    this.colours = null;
  }

  attached() {
    this.ps = new PerfectScrollbar('#chart-area-outer');

    this.initialise();

    this.chartMainOptions.tooltips.callbacks = {
      title: (tooltipItem, data) => {
        let label = xAxisLabels[tooltipItem[0].index] || '';

        if(label.length) {
          label = `${label[0]} ${label[1]}`;
        }

        return(label);
      },
      label: (tooltipItem, data) => {
        let label = tooltipItem.yLabel || '';

        if(label.toString().includes('.')) {
          let labelArr = label.toString().split('.');
          labelArr[1] = labelArr[1].padEnd(4, 0);
          label = ` $${labelArr[0]}.${labelArr[1]}`;
        }
        else {
          label = `${label}.0000`;
        }

        return(label);
      }
    }

    this.chart = new Chart(document.getElementById('chart-main').getContext('2d'), {
      type: 'line',
      data: this.chartMainData,
      options: this.chartMainOptions
    });

    window.onunload = (event) => {
      if(this.state.webSocket) {
        this.state.webSocket.close();
        this.state.webSocket = null;
      }
    };
  }

  detached() {
    this.state.webSocket.close();
    this.chart.destroy();
    this.ps.destroy();
    this.ps = null;
  }

  async initialise() {
    let result = await this.api.getStocks();
    document.getElementById('no-data').innerHTML = `Not tracking <br> any stock`;
    document.getElementById('chart-input').disabled = false;
    document.getElementById('chart-input').focus();

    if(result.update) {
      document.getElementById('no-data').style.visibility = 'hidden';
      document.getElementById('no-data').style.width = '0px';
      document.getElementById('no-data').style.height = '0px';
      document.getElementById('chart-container').style.visibility = 'visible';
      document.getElementById('chart-container').style.width = '100%';
      document.getElementById('chart-container').style.height = '65%';
      document.getElementById('chart-symbols').style.visibility = 'visible';
      document.getElementById('chart-symbols').style.width = '100%';
      document.getElementById('chart-symbols').style.height = 'calc(35% - 2rem)';

      this.state.stocks = result.data.list.map((v, i, a) => v);

      this.state.yearStart.curr = result.data.yearStart;
      this.state.yearEnd.curr = result.data.yearEnd;
      this.state.monthStart.curr = result.data.monthStart;
      this.state.monthEnd.curr = result.data.monthEnd;
      this.state.valueMin.curr = result.data.valueMin;
      this.state.valueMax.curr = result.data.valueMax;

      this.colours = palette.default('rainbow', this.state.stocks.length);

      this.setChart();
      this.setChartArea();
    }
    else {
      document.getElementById('no-data').style.visibility = 'visible';
      document.getElementById('no-data').style.width = '100%';
      document.getElementById('no-data').style.height = 'calc(100% - 2rem)';
      document.getElementById('chart-container').style.visibility = 'hidden';
      document.getElementById('chart-container').style.width = '0px';
      document.getElementById('chart-container').style.height = '0px';
      document.getElementById('chart-symbols').style.visibility = 'hidden';
      document.getElementById('chart-symbols').style.width = '0px';
      document.getElementById('chart-symbols').style.height = '0px';
    }

    this.setWebsocket();
  }

  setChart() {
    if((this.state.yearStart.prev !== this.state.yearStart.curr
        && this.state.monthStart.prev !== this.state.monthStart.curr) ||
       (this.state.yearEnd.prev !== this.state.yearEnd.curr
        && this.state.monthEnd.prev !== this.state.monthEnd.curr)
      ) {
      this.chartMainData.labels = setLabels(this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr);
      xAxisLabels = setLabels(this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr, true);
    }

    this.chartMainData.datasets = setDatasets(this.state.stocks, this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr, this.colours);

    this.chart.update();
  }

  setChartArea() {
    let chartAreaOuter = document.getElementById('chart-area-outer');
    let chartAreaInner = document.getElementById('chart-area-inner');
    let width = null;

    if(this.chartMainData.labels.length > 12) {
      width = this.chartMainData.labels.length * 35;
    }
    else {
      width = chartAreaOuter.getBoundingClientRect().width;
    }

    chartAreaInner.style.width = `${width}px`;
    setTimeout(() => { chartAreaOuter.scrollLeft = 0; }, 50);
    setTimeout(() => { chartAreaOuter.scrollLeft = width; }, 100);
  }

  setWebsocket() {
    // wss://letsziggy-freecodecamp-dynamic-web-application-03.glitch.me
    this.state.webSocket = new WebSocket(`ws://localhost:3000`);

    this.state.webSocket.onopen = (event) => {
      console.log(event.type);
    };

    this.state.webSocket.onclose = (event) => {
      this.state.webSocket = null;
    };

    this.state.webSocket.onerror = (event) => {
      console.log(event);
      this.state.webSocket = null;
    };

    this.state.webSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);

      if(message.type === 'add') {
        this.addStockReceive({ data: message.data, update: message.update });
      }

      if(message.type === 'remove') {
        this.removeStockReceive({ data: message.data, update: message.update });
      }
    };
  }

  handleKeydown(event, elem) {
    let value = document.getElementById(elem).value;
    let regex = new RegExp('^[a-zA-Z\.\s]$');
    let specialKeys = ['Enter', 'Shift', 'Alt', 'Control', 'Backspace', 'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

    if(event.key === 'Enter' && !value.length) {
      return(false);
    }
    else if(regex.test(event.key) || specialKeys.includes(event.key)) {
      // Check if SYMBOL entered is repeated
      if(event.key === 'Enter') {
        let symbols = this.state.stocks.map((v, i, a) => v.symbol.toLowerCase());

        if(symbols.includes(value.toLowerCase())) {
          let index = symbols.indexOf(value.toLowerCase());
          let divArr = document.getElementsByClassName('symbol-name');
          divArr[index].classList.add('shaking');

          setTimeout(() => { divArr[index].classList.remove('shaking'); }, 1000);

          return(false);
        }
      }

      return(true);
    }
    else {
      return(false);
    }
  }

  handleStockChanges() {
    this.state.yearStart.prev = this.state.yearStart.curr || null;
    this.state.yearEnd.prev = this.state.yearEnd.curr || null;
    this.state.monthStart.prev = this.state.monthStart.curr || null;
    this.state.monthEnd.prev = this.state.monthEnd.curr || null;
    this.state.valueMin.prev = this.state.valueMin.curr || null;
    this.state.valueMax.prev = this.state.valueMax.curr || null;

    this.state.yearStart.curr = null;
    this.state.yearEnd.curr = null;
    this.state.monthStart.curr = null;
    this.state.monthEnd.curr = null;
    this.state.valueMin.curr = null;
    this.state.valueMax.curr = null;
  }

  async addStockSend() {
    let result = await this.api.addStock(document.getElementById('chart-input').value, this.state.webSocket);

    if(!this.state.webSocket) {
      this.addStockReceive(result);
    }
  }

  addStockReceive(result) {
    document.getElementById('chart-input').value = '';

    if(!result.update) {
      let span = document.getElementById('chart-add-instruction');
      span.innerHTML = 'ERROR! NO SUCH SYMBOL!';
      span.style.color = 'red';
      span.classList.add('shaking');

      setTimeout(() => {
        span.innerHTML = `Press 'Enter' to add`;
        span.style.color = 'lightgrey';
        span.classList.remove('shaking');
      }, 2500);
    }
    else {
      this.handleStockChanges();

      this.state.stocks.push(result.data);

      if(this.state.stocks.length) {
        document.getElementById('no-data').style.visibility = 'hidden';
        document.getElementById('no-data').style.width = '0px';
        document.getElementById('no-data').style.height = '0px';
        document.getElementById('chart-container').style.visibility = 'visible';
        document.getElementById('chart-container').style.width = '100%';
        document.getElementById('chart-container').style.height = '65%';
        document.getElementById('chart-symbols').style.visibility = 'visible';
        document.getElementById('chart-symbols').style.width = '100%';
        document.getElementById('chart-symbols').style.height = 'calc(35% - 2rem)';
      }

      this.colours = palette.default('rainbow', this.state.stocks.length);

      this.state.stocks.forEach((v, i, a) => {
        if(this.state.yearStart.curr === null) {
          this.state.yearStart.curr = v.yearStart;
          this.state.monthStart.curr = v.monthStart;
        }
        else if(this.state.yearStart.curr > v.yearStart) {
          this.state.yearStart.curr = v.yearStart;
          this.state.monthStart.curr = v.monthStart;
        }

        if(this.state.yearEnd.curr === null) {
          this.state.yearEnd.curr = v.yearEnd;
          this.state.monthEnd.curr = v.monthEnd;
        }
        else if(this.state.yearEnd.curr < v.yearEnd) {
          this.state.yearEnd.curr = v.yearEnd;
          this.state.monthEnd.curr = v.monthEnd;
        }

      this.state.valueMin = this.state.valueMin === null 
        ? v.valueMin
        : this.state.valueMin > v.valueMin
          ? v.valueMin
          : this.state.valueMin;

      this.state.valueMax = this.state.valueMax === null 
        ? v.valueMax
        : this.state.valueMax < v.valueMax
          ? v.valueMax
          : this.state.valueMax;
      });

      this.setChart();
      this.setChartArea();
    }
  }

  async removeStockSend(symbol) {
    let result = await this.api.removeStock(symbol, this.state.webSocket);

    if(!this.state.webSocket) {
      this.removeStockReceive(result);
    }
  }

  removeStockReceive(result) {
    if(!result.update) {
      let span = document.getElementById('chart-add-instruction');
      span.innerHTML = 'SERVER ERROR! Please try again later!';
      span.style.color = 'red';
      span.classList.add('shaking');

      setTimeout(() => {
        span.innerHTML = `Press 'Enter' to add`;
        span.style.color = 'lightgrey';
        span.classList.remove('shaking');
      }, 2500);
    }
    else {
      this.handleStockChanges();

      let index = this.state.stocks.map((v, i, a) => v.symbol).indexOf(result.symbol);
      this.state.stocks.splice(index, 1);

      if(!this.state.stocks.length) {
        document.getElementById('no-data').style.visibility = 'visible';
        document.getElementById('no-data').style.width = '100%';
        document.getElementById('no-data').style.height = 'calc(100% - 2rem)';
        document.getElementById('chart-container').style.visibility = 'hidden';
        document.getElementById('chart-container').style.width = '0px';
        document.getElementById('chart-container').style.height = '0px';
        document.getElementById('chart-symbols').style.visibility = 'hidden';
        document.getElementById('chart-symbols').style.width = '0px';
        document.getElementById('chart-symbols').style.height = '0px';
      }

      this.colours = palette.default('rainbow', this.state.stocks.length);

      this.state.stocks.forEach((v, i, a) => {
        if(this.state.yearStart.curr === null) {
          this.state.yearStart.curr = v.yearStart;
          this.state.monthStart.curr = v.monthStart;
        }
        else if(this.state.yearStart.curr > v.yearStart) {
          this.state.yearStart.curr = v.yearStart;
          this.state.monthStart.curr = v.monthStart;
        }

        if(this.state.yearEnd.curr === null) {
          this.state.yearEnd.curr = v.yearEnd;
          this.state.monthEnd.curr = v.monthEnd;
        }
        else if(this.state.yearEnd.curr < v.yearEnd) {
          this.state.yearEnd.curr = v.yearEnd;
          this.state.monthEnd.curr = v.monthEnd;
        }

      this.state.valueMin = this.state.valueMin === null 
        ? v.valueMin
        : this.state.valueMin > v.valueMin
          ? v.valueMin
          : this.state.valueMin;

      this.state.valueMax = this.state.valueMax === null 
        ? v.valueMax
        : this.state.valueMax < v.valueMax
          ? v.valueMax
          : this.state.valueMax;
      });

      this.setChart();
      this.setChartArea();

      let divArr = document.getElementsByClassName('colour');
      Array.from(divArr).forEach((v, i, a) => {
        v.style.backgroundColor = `#${this.colours[i]}`;
      });
    }
  }
}