import {inject, bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {Chart} from 'chartjs';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
    this.chartMain = null;
    this.chartYAxis = null;
    this.chartLegend = null;
  }

  attached() {
    this.getInitialChartData();

    let chartAreaOuter = document.getElementById('chart-area-outer');
    let chartAreaInner = document.getElementById('chart-area-inner');

    let dataMain = {};
    let dataYAxis = {};

    let optionsMain = {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      responsiveAnimationDuration: 0,
      tooltips: {
        enabled: true
      },
      legend: {
        display: false
      }
    };
    let optionsYAxis = {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      responsiveAnimationDuration: 0,
      tooltips: {
        enabled: false
      },
      legend: {
        display: false
      }
    };

    this.chartMain = new Chart(document.getElementById('chart-main').getContext('2d'), {
      type: 'line',
      data: dataMain,
      options: optionsMain
    });

    this.chartYAxis = new Chart(document.getElementById('chart-y-axis').getContext('2d'), {
      type: 'line',
      data: dataYAxis,
      options: optionsYAxis
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
    this.state.yearStart = data.yearStart;
    this.state.yearEnd = data.yearEnd;
    this.state.monthStart = data.monthStart;
    this.state.monthEnd = data.monthEnd;
    this.state.valueMin = data.valueMin;
    this.state.valueMax = data.valueMax;

    this.setChart();
  }

  setChart() {
    let labels = setLabels(this.state.yearStart, this.state.monthStart, this.state.yearEnd, this.state.monthEnd);

    

    console.log(labels);
  }
}

function setLabels(yearStart, monthStart, yearEnd, monthEnd) {
  console.log(yearStart, monthStart, yearEnd, monthEnd);
  let months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
  let labels = [];

  while(yearStart <= yearEnd) {
    while(monthStart <= 12) {
      let date = null;
      if(!labels.length || monthStart === 1 || (yearStart === yearEnd && monthStart === monthEnd)) {
        date = [months[monthStart - 1], yearStart];
      }
      else {
        date = months[monthStart - 1];
      }

      labels.push(date);

      if(yearStart === yearEnd && monthStart === monthEnd) {
        monthStart = 13;
      }
      else {
        monthStart++;
      }
    }

    yearStart++;
    monthStart = 1;
  }

  return(labels);
}