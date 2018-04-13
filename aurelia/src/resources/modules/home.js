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
  }

  attached() {
    this.ps = new PerfectScrollbar('#chart-area-outer');

    this.getInitialChartData();

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

        if(label) {
          let labelArr = label.toString().split('.');
          labelArr[1] = labelArr[1].padEnd(4, 0);
          label = ` $${labelArr[0]}.${labelArr[1]}`;
        }

        return(label);
      }
    }

    this.chart = new Chart(document.getElementById('chart-main').getContext('2d'), {
      type: 'line',
      data: this.chartMainData,
      options: this.chartMainOptions
    });
  }

  detached() {
    this.ps.destroy();
    this.ps = null;
  }

  async getInitialChartData() {
    let data = await this.api.getStocks();

    this.state.stocks = data.stocks.map((v, i, a) => v);

    this.state.yearStart.prev = this.state.yearStart.curr;
    this.state.yearEnd.prev = this.state.yearEnd.curr;
    this.state.monthStart.prev = this.state.monthStart.curr;
    this.state.monthEnd.prev = this.state.monthEnd.curr;
    this.state.valueMin.prev = this.state.valueMin.curr;
    this.state.valueMax.prev = this.state.valueMax.curr;

    this.state.yearStart.curr = data.yearStart;
    this.state.yearEnd.curr = data.yearEnd;
    this.state.monthStart.curr = data.monthStart;
    this.state.monthEnd.curr = data.monthEnd;
    this.state.valueMin.curr = data.valueMin;
    this.state.valueMax.curr = data.valueMax;

    this.colours = palette.default('rainbow', this.state.stocks.length);

    this.setChart(true);
  }

  setChart(initial) {
    if(   initial
       || (this.state.yearStart.prev !== this.state.yearStart.curr
           && this.state.monthStart.prev !== this.state.monthStart.curr)
       || (this.state.yearEnd.prev !== this.state.yearEnd.curr
           && this.state.monthEnd.prev !== this.state.monthEnd.curr)
      ) {
      this.chartMainData.labels = setLabels(this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr);
      xAxisLabels = setLabels(this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr, true);
      this.chartMainData.datasets = setDatasets(this.state.stocks, this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr, this.colours);
    }

    this.chart.update();

    let chartAreaOuter = document.getElementById('chart-area-outer');
    let chartAreaInner = document.getElementById('chart-area-inner');

    let width = this.chartMainData.labels.length * 35;
    chartAreaInner.style.width = `${width}px`;
    chartAreaOuter.scrollLeft = width;
  }

  handleKeydown(event, elem) {
    let value = document.getElementById(elem).value;
    let regex = new RegExp('^[a-zA-Z\.\s]$');
    let otherKeys = ['Enter', 'Shift', 'Alt', 'Control', 'Backspace', 'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    if(event.key === 'Enter' && !value.length) {
      return(false);
    }
    else if(regex.test(event.key) || otherKeys.includes(event.key)) {
      return(true);
    }
    else {
      return(false);
    }
  }

  async addStock(elem) {
    let value = document.getElementById(elem).value;
    let result = await this.api.getStock(value);
    console.log(result);
  }
  
  async removeStock(symbol, index) {
    console.log(symbol, index);
  }
}