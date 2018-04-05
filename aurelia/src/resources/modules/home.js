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
    this.chart = null;
  }

  attached() {
    let ctx = document.getElementById('chart-canvas').getContext('2d');
    this.chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [{
              label: "My First dataset",
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderColor: 'rgb(255, 99, 132)',
              data: [0, 10, 5, 2, 20, 30, 45],
          }]
      },

      // Configuration options go here
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}

/*
//https://github.com/chartjs/Chart.js/issues/2958#issuecomment-261949718

var ctx = document.getElementById("myChart").getContext("2d");
var chart = {
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      onComplete: function(animation) {
        var sourceCanvas = myLiveChart.chart.canvas;
        var copyWidth = myLiveChart.scales['y-axis-0'].width - 10;
        var copyHeight = myLiveChart.scales['y-axis-0'].height + myLiveChart.scales['y-axis-0'].top + 10;
        var targetCtx = document.getElementById("myChartAxis").getContext("2d");
        targetCtx.canvas.width = copyWidth;
        targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
      }
    }
  },
  type: 'bar',
  data: {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [{
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
      data: [65, 59, 80, 81, 56, 55, 40]
    }]
  }
};

var myLiveChart = new Chart(ctx, chart);
setInterval(function() {
  myLiveChart.data.datasets[0].data.push(Math.random() * 100);
  myLiveChart.data.labels.push("Test");
  var newWidth = $('.chartAreaWrapperInner').width() + 60;
  $('.chartAreaWrapperInner').width(newWidth);
  $('.chartAreaWrapperOuter').animate({ scrollLeft: newWidth });
}, 5000);
*/

/*
function generateLabels() {
  var chartLabels = [];
  for (x = 0; x < 100; x++) {
    chartLabels.push("Label" + x);
  }
  return chartLabels;
}

function generateData() {
  var chartData = [];
  for (x = 0; x < 100; x++) {
    chartData.push(Math.floor((Math.random() * 100) + 1));
  }
  return chartData;
}

function addData(numData, chart){
  for (var i = 0; i < numData; i++){
    chart.data.datasets[0].data.push(Math.random() * 100);
    chart.data.labels.push("Label" + i);
    var newwidth = $('.chartAreaWrapper2').width() +60;
    $('.chartAreaWrapper2').width(newwidth);
  }
}

var chartData = {
  labels: generateLabels(),
  datasets: [{
    label: "Test Data Set",
    data: generateData()
  }]
};

$(function() {
  var canvasFuelSpend = $('#chart-FuelSpend');
  var chartFuelSpend = new Chart(canvasFuelSpend, {
    type: 'bar',
    data: chartData,
    maintainAspectRatio: false,
    responsive: true,
    options: {
      tooltips: {
        titleFontSize: 0,
        titleMarginBottom: 0,
        bodyFontSize: 12
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            fontSize: 12,
            display: false
          }
        }],
        yAxes: [{
          ticks: {
            fontSize: 12,
            beginAtZero: true
          }
        }]
      },
      animation: {
        onComplete: function() {
          var sourceCanvas = chartFuelSpend.chart.canvas;
          var copyWidth = chartFuelSpend.scales['y-axis-0'].width - 10;
          var copyHeight = chartFuelSpend.scales['y-axis-0'].height + chartFuelSpend.scales['y-axis-0'].top + 10;
          var targetCtx = document.getElementById("axis-FuelSpend").getContext("2d");
          targetCtx.canvas.width = copyWidth;
          targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
        }
      }
    }
  });
  addData(5, chartFuelSpend);
});
*/