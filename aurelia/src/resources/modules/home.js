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
    this.ps = null;
    this.chart = null;
    this.colours = null;
  }

  attached() {
    this.ps = new PerfectScrollbar('#chart-area-outer');

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
        label = `$${parseFloat(label).toFixed(4)}`;

        return(label);
      }
    }

    this.chart = new Chart(document.getElementById('chart-main').getContext('2d'), {
      type: 'line',
      data: this.chartMainData,
      options: this.chartMainOptions
    });

    this.initialise();
  }

  detached() {
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
      this.state.stocks = result.data.list.reduce((acc, v, i, a) => {
        if(!v.error) {
          acc.push(v);
        }
        return(acc);
      }, []);

      this.state.yearStart.curr = result.data.yearStart;
      this.state.yearEnd.curr = result.data.yearEnd;
      this.state.monthStart.curr = result.data.monthStart;
      this.state.monthEnd.curr = result.data.monthEnd;
      this.state.valueMin.curr = result.data.valueMin;
      this.state.valueMax.curr = result.data.valueMax;
      this.setHTMLContainers();
      this.addDataPadding();
      this.colours = palette.default('rainbow', this.state.stocks.length);

      this.setChart();
      this.setChartArea();
    }
    else {
      this.setHTMLContainers();
    }

    this.setWebsocket();
  }

  setHTMLContainers() {
    if(this.state.stocks.length) {
      document.getElementById('no-data').style.display = 'none';
      document.getElementById('no-data').style.visibility = 'hidden';
      document.getElementById('no-data').style.width = '0px';
      document.getElementById('no-data').style.height = '0px';
      document.getElementById('chart-container').style.display = 'block';
      document.getElementById('chart-container').style.visibility = 'visible';
      document.getElementById('chart-container').style.width = '100%';
      document.getElementById('chart-container').style.height = '65%';
      document.getElementById('chart-options').style.display = 'flex';
      document.getElementById('chart-options').style.visibility = 'visible';
      document.getElementById('chart-options').style.width = '100%';
      document.getElementById('chart-options').style.height = 'calc(35% - 2rem)';
    }
    else {
      document.getElementById('no-data').style.display = 'flex';
      document.getElementById('no-data').style.visibility = 'visible';
      document.getElementById('no-data').style.width = '100%';
      document.getElementById('no-data').style.height = 'calc(100% - 2rem)';
      document.getElementById('chart-container').style.display = 'none';
      document.getElementById('chart-container').style.visibility = 'hidden';
      document.getElementById('chart-container').style.width = '0px';
      document.getElementById('chart-container').style.height = '0px';
      document.getElementById('chart-options').style.display = 'none';
      document.getElementById('chart-options').style.visibility = 'hidden';
      document.getElementById('chart-options').style.width = '0px';
      document.getElementById('chart-options').style.height = '0px';
    }
  }

  addDataPadding() {
    // Pad all data to same length
    this.state.stocks.forEach((v, i, a) => {
      if(!v.yearStartPad || !v.monthStartPad) {
        v.yearStartPad = v.yearStart;
        v.monthStartPad = v.monthStart;
      }

      let yearStart = v.yearStartPad;
      let monthStart = v.monthStartPad;
      let padBefore = true;

      while(padBefore) {
        if(yearStart !== this.state.yearStart.curr || monthStart !== this.state.monthStart.curr) {
          monthStart--;
          if(monthStart === 0) {
            yearStart--;
            monthStart = 12;
          }

          v.data.unshift({ year: yearStart, month: monthStart, close: null });
        }
        else {
          padBefore = false;
        }
      }

      // Add final left pad due to while loop
      if(v.yearStartPad !== this.state.yearStart.curr && v.monthStartPad !== this.state.monthStart.curr) {
        v.data.unshift({ year: this.state.yearStart.curr, month: this.state.monthStart.curr, close: null });
        v.yearStartPad = this.state.yearStart.curr;
        v.monthStartPad = this.state.monthStart.curr;
      }

      if(!v.yearEndPad || !v.monthEndPad) {
        v.yearEndPad = v.yearEnd;
        v.monthEndPad = v.monthEnd;
      }

      let yearEnd = v.yearEndPad;
      let monthEnd = v.monthEndPad;
      let padAfter = true;

      while(padAfter) {
        if(yearEnd !== this.state.yearEnd.curr || monthEnd !== this.state.monthEnd.curr) {
          monthEnd++;
          if(monthEnd === 13) {
            yearEnd++;
            monthEnd = 1;
          }

          v.data.push({ year: yearEnd, month: monthEnd, close: null });
        }
        else {
          padAfter = false;
        }
      }

      // Add final rigth pad due to while loop
      if(v.yearEndPad !== this.state.yearEnd.curr && v.monthEndPad !== this.state.monthEnd.curr) {
        v.data.push({ year: this.state.yearEnd.curr, month: this.state.monthEnd.curr, close: null });
          v.yearEndPad = this.state.yearEnd.curr;
          v.monthEndPad = this.state.monthEnd.curr;
      }
    });
  }

  removeDataPadding() {
    if(this.state.yearStart.curr > this.state.yearStart.prev || this.state.monthStart.curr > this.state.monthStart.prev) {
      this.state.stocks.forEach((v, i, a) => {
        let removePadBefore = true;

        while(removePadBefore) {
          if(v.data[0].year < this.state.yearStart.curr || v.data[0].month !== this.state.monthStart.curr) {
            v.data.shift();
          }
          else {
            v.yearStartPad = this.state.yearStart.curr;
            v.monthStartPad = this.state.monthStart.curr;
            removePadBefore = false;
          }
        }
      });
    }

    if(this.state.yearEnd.curr < this.state.yearEnd.prev || this.state.monthEnd.curr < this.state.monthEnd.prev) {
      this.state.stocks.forEach((v, i, a) => {
        let removePadAfter = true;

        while(removePadAfter) {
          if(v.data[v.data.length - 1].year > this.state.yearEnd.curr || v.data[v.data.length - 1].month !== this.state.monthEnd.curr) {
            v.data.pop();
          }
          else {
            v.yearEndPad = this.state.yearEnd.curr;
            v.monthEndPad = this.state.monthEnd.curr;
            removePadAfter = false;
          }
        }
      });
    }
  }

  setChart() {
    this.chartMainData.labels = setLabels(this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr, false, this.state.chartTime);
    xAxisLabels = setLabels(this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr, true, this.state.chartTime);
    this.chartMainData.datasets = setDatasets(this.state.stocks, this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr, this.colours, this.state.chartTime);

    this.chart.update();
  }

  setChartArea() {
    let chartAreaOuter = document.getElementById('chart-area-outer');
    let chartAreaInner = document.getElementById('chart-area-inner');
    let width = null;

    if(this.chartMainData.labels.length > 18) {
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
    // this.state.webSocket = new WebSocket(`ws://localhost:3000`);
    this.state.webSocket = new WebSocket(`wss://letsziggy-freecodecamp-dynamic-web-application-03.glitch.me`);

    this.state.webSocket.onopen = (event) => {
      console.log('open');
    };

    this.state.webSocket.onclose = (event) => {
      this.state.webSocket = null;
      console.log('close');
    };

    this.state.webSocket.onerror = (event) => {
      this.state.webSocket = null;
      console.log('error');
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

  handleKeydown(event) {
    let value = document.getElementById('chart-input').value;
    let regex = new RegExp('^[-_a-zA-Z0-9 \.]$');
    let specialKeys = ['Enter', 'Shift', 'Alt', 'Control', 'Backspace', 'Insert', 'Del', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'Tab', 'Up', 'ArrowUp', 'Down', 'ArrowDown', 'Left', 'ArrowLeft', 'Right', 'ArrowRight', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

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
        else {
          this.addStockSend();
          return(true);
        }
      }
      else {
        return(true);
      }
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

    if(!result.update || result.data.error) {
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

        if(this.state.valueMin.curr === null) {
          this.state.valueMin.curr = v.valueMin;
        }
        else if(this.state.valueMin.curr > v.valueMin) {
          this.state.valueMin.curr = v.valueMin;
        }

        if(this.state.valueMax.curr === null) {
          this.state.valueMax.curr = v.valueMax;
        }
        else if(this.state.valueMax.curr < v.valueMax) {
          this.state.valueMax.curr = v.valueMax;
        }
      });

      this.setHTMLContainers();
      this.addDataPadding();
      this.colours = palette.default('rainbow', this.state.stocks.length);

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
      let index = this.state.stocks.map((v, i, a) => v.symbol).indexOf(result.data);
      if(index !== -1) {
        this.state.stocks.splice(index, 1);

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

          if(this.state.valueMin.curr === null) {
            this.state.valueMin.curr = v.valueMin;
          }
          else if(this.state.valueMin.curr > v.valueMin) {
            this.state.valueMin.curr = v.valueMin;
          }

          if(this.state.valueMax.curr === null) {
            this.state.valueMax.curr = v.valueMax;
          }
          else if(this.state.valueMax.curr < v.valueMax) {
            this.state.valueMax.curr = v.valueMax;
          }
        });

        this.setHTMLContainers();
        this.removeDataPadding();
        this.colours = palette.default('rainbow', this.state.stocks.length);

        this.setChart();
        this.setChartArea();

        let divArr = document.getElementsByClassName('colour');
        Array.from(divArr).forEach((v, i, a) => {
          v.style.backgroundColor = `#${this.colours[i]}`;
        });
      }
    }
  }

  changeTimeline(range) {
    let buttons = Array.from(document.getElementsByClassName('timeline-button'));
    buttons.forEach((v, i, a) => {
      if(i === range) {
        v.dataset.current = 'true';
      }
      else {
        v.dataset.current = 'false';
      }
    });

    this.state.chartTime = range;
    this.setChart();
    this.setChartArea();
  }
}