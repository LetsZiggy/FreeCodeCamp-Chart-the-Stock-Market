export const chartMainData = {
    labels: [],
    datasets: []
};

export const chartMainOptions = {
  responsive: true,
  responsiveAnimationDuration: 0,
  maintainAspectRatio: false,
  onResize: null,
  onHover: null,
  onClick: null,
  devicePixelRatio: window.devicePixelRatio,
  events: [
    'mousemove',
    'mouseout',
    'click',
    'touchstart',
    'touchmove',
    'touchend',
  ],
  hover: {
    mode: 'index',
    intersect: false,
    axis: 'xy',
    animationDuration: 0,
  },
  animation: {
    duration: 0,
    easing: 'easeOutQuart',
    onProgress: null,
    onComplete: null,
  },
  layout: {
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  legend: {
    display: false,
    // position: 'top',
    // fullWidth: true,
    // reverse: false,
    // onClick: , // () => {}
    // onHover: , // () => {}
    // labels: {
    //   boxWidth: 50,
    //   fontSize: 12,
    //   fontStyle: 'normal',
    //   fontColor: '#666666',
    //   fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
    //   padding: 15,
    //   // generateLabels: , // () => {}
    //   filter: null,
    //   usePointStyle: false,
    // },
  },
  title: {
    display: false,
    // position: 'top',
    // fontSize: 12,
    // fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
    // fontColor: '#666666',
    // fontStyle: 'bold',
    // padding: 15,
    // lineHeight: 1.2,
    // text: '',
  },
  tooltips: {
    enabled: true,
    custom: null,
    mode: 'index',
    intersect: false,
    position: 'average',
    // callbacks: {
    //   // beforeTitle: , // ([tooltipItem], data) => {}
    //   // title: , // ([tooltipItem], data) => {}
    //   // afterTitle: , // ([tooltipItem], data) => {}
    //   // beforeBody: , // ([tooltipItem], data) => {}
    //   // beforeLabel: , // (tooltipItem, data) => {}
    //   // label: , // (tooltipItem, data) => {}
    //   // labelColor: , // (tooltipItem, data) => {}
    //   // labelTextColor: , // (tooltipItem, data) => {}
    //   // afterLabel: , // (tooltipItem, data) => {}
    //   // afterBody: , // ([tooltipItem], data) => {}
    //   // beforeFooter: , // ([tooltipItem], data) => {}
    //   // footer: , // ([tooltipItem], data) => {}
    //   // afterFooter: , // ([tooltipItem], data) => {}
    // },
    itemSort: (a, b) => {
      a = parseFloat(a.yLabel);
      b = parseFloat(b.yLabel);
      return((a < b) ? 1 : (a > b) ? -1 : 0);
    },
    // filter: , // () => {}
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    titleFontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
    titleFontSize: 12,
    titleFontStyle: 'bold',
    titleFontColor: '#ffffff',
    titleSpacing: 5,
    titleMarginBottom: 10,
    bodyFontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
    bodyFontSize: 12,
    bodyFontStyle: 'bold',
    bodyFontColor: '#ffffff',
    bodySpacing: 5,
    footerFontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
    footerFontSize: 12,
    footerFontStyle: 'bold',
    footerFontColor: '#ffffff',
    footerSpacing: 3,
    footerMarginTop: 10,
    xPadding: 10,
    yPadding: 10,
    caretpadding: 3,
    caretSize: 5,
    cornerRadius: 10,
    multiKeyBackground: '#ffffff',
    displayColors: true,
    borderColor: 'rbga(0, 0, 0, 0)',
    borderWidth: 0,
  },
  scales: {
    xAxes: [{
      display: true,
      id: 'xAxis',
      labelString: '',
      lineHeight: 1.2,
      fontColor: '#666666',
      fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
      fontSize: 12,
      fontStyle: 'normal',
      padding: 0,
      weight: 0,
      type: 'category',
      // labels: , // ['']
      // min: , // ''
      // max: , // ''
      position: 'bottom',
      offset: false,
      callbacks: {
        // beforeUpdate: , // (axis) => {}
        // beforeSetDimensions: , // (axis) => {}
        // afterSetDimensions: , // (axis) => {}
        // beforeDataLimits: , // (axis) => {}
        // afterDataLimits: , // (axis) => {}
        // beforeBuildTicks: , // (axis) => {}
        // afterBuildTicks: , // (axis) => {}
        // beforeTickToLabelConversion: , // (axis) => {}
        // afterTickToLabelConversion: , // (axis) => {}
        // beforeCalculateTickRotation: , // (axis) => {}
        // afterCalculateTickRotation: , // (axis) => {}
        // beforeFit: , // (axis) => {}
        // afterFit: , // (axis) => {}
        // afterUpdate: , // (axis) => {}
      },
      gridLines: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
        borderDashOffset: 0,
        lineWidth: 1,
        drawBorder: true,
        drawOnChartArea: true,
        drawTicks: true,
        tickMarkLength: 10,
        zeroLineWidth: 1,
        zeroLineColor: 'rgba(0, 0, 0, 0.25)',
        zeroLineBorderDashOffset: 0,
        offsetGridLines: false,
        borderDash: [],
        zeroLineBorderDash: [],
      },
      scaleLabel: {
        display: false,
        labelString: '',
        lineHeight: 1.2,
        fontColor: '#666666',
        fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
        fontSize: 12,
        fontStyle: 'normal',
        padding: 0,
      },
      ticks: {
        autoSkip: true,
        autoSkipPadding: 0,
        labelOffset: 0,
        maxRotation: 90,
        minRotation: 0,
        mirror: false,
        padding: 10,
        beginAtZero: false,
        // callback: , // (value, index, values) => {}
      },
    }],
    yAxes: [{
      display: false,
      // id: 'yAxis',
      // labelString: '',
      // lineHeight: 1.2,
      // fontColor: '#666666',
      // fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
      // fontSize: 12,
      // fontStyle: 'normal',
      // padding: 0,
      // weight: 0,
      // type: 'category',
      // // labels: , // ['']
      // // min: , // ''
      // // max: , // ''
      // position: 'bottom',
      // offset: false,
      // callbacks: {
      //   // beforeUpdate: , // (axis) => {}
      //   // beforeSetDimensions: , // (axis) => {}
      //   // afterSetDimensions: , // (axis) => {}
      //   // beforeDataLimits: , // (axis) => {}
      //   // afterDataLimits: , // (axis) => {}
      //   // beforeBuildTicks: , // (axis) => {}
      //   // afterBuildTicks: , // (axis) => {}
      //   // beforeTickToLabelConversion: , // (axis) => {}
      //   // afterTickToLabelConversion: , // (axis) => {}
      //   // beforeCalculateTickRotation: , // (axis) => {}
      //   // afterCalculateTickRotation: , // (axis) => {}
      //   // beforeFit: , // (axis) => {}
      //   // afterFit: , // (axis) => {}
      //   // afterUpdate: , // (axis) => {}
      // },
      // gridLines: {
      //   display: true,
      //   color: 'rgba(0, 0, 0, 0.1)',
      //   borderDashOffset: 0,
      //   lineWidth: 1,
      //   drawBorder: true,
      //   drawOnChartArea: true,
      //   drawTicks: true,
      //   tickMarkLength: 10,
      //   zeroLineWidth: 1,
      //   zeroLineColor: 'rgba(0, 0, 0, 0.25)',
      //   zeroLineBorderDashOffset: 0,
      //   offsetGridLines: false,
      //   borderDash: [],
      //   zeroLineBorderDash: [],
      // },
      // scaleLabel: {
      //   display: false,
      //   labelString: '',
      //   lineHeight: 1.2,
      //   fontColor: '#666666',
      //   fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
      //   fontSize: 12,
      //   fontStyle: 'normal',
      //   padding: 0,
      // },
      // ticks: {
      //   autoSkip: true,
      //   autoSkipPadding: 0,
      //   labelOffset: 0,
      //   maxRotation: 90,
      //   minRotation: 0,
      //   mirror: false,
      //   padding: 10,
      //   beginAtZero: false,
      //   // callback: , // (value, index, values) => {}
      // },
    }],
  },
}