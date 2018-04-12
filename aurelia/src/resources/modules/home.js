import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Chart} from 'chartjs';
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
    this.chart = null;
  }

  attached() {
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

    // setTimeout(() => {
    //   dataMain.datasets.push({
    //     backgroundColor: 'rgba(0, 0, 0, 0)',
    //     borderColor: 'rgb(99, 255, 132)',
    //     data: [3, 2, 8, 20, 10, 40, 5],
    //   });
    //   dataMain.labels.push('August');
    //   dataMain.datasets[0].dataMain.push(50);
    //   dataMain.datasets[1].dataMain.push(5);
    //   let width = chartAreaInner.getBoundingClientRect().width + 50;
    //   chartAreaInner.style.width = `${width}px`;
    //   chartAreaOuter.scrollLeft = width;
    // }, 3000);
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
      this.chartMainData.datasets = setDatasets(this.state.stocks, this.state.yearStart.curr, this.state.monthStart.curr, this.state.yearEnd.curr, this.state.monthEnd.curr);
    }

    this.chart.update();

    let chartAreaOuter = document.getElementById('chart-area-outer');
    let chartAreaInner = document.getElementById('chart-area-inner');

    let width = this.chartMainData.labels.length * 35;
    chartAreaInner.style.width = `${width}px`;
    chartAreaOuter.scrollLeft = width;
  }
}