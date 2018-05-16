let useDates = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  [3, 6, 9, 12],
  [6, 12],
  [12]
];

export function setLabels(yearStart, monthStart, yearEnd, monthEnd, allYear, chartTime) {
  let months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

  let month = monthStart;
  let year = yearStart;
  let labels = [];

  while(year <= yearEnd) {
    while(month <= 12) {
      let date = null;

      if((allYear && useDates[chartTime].includes(month)) || (chartTime === 3 && useDates[chartTime].includes(month)) || (!labels.length || (year === yearEnd && month === monthEnd) || (month === useDates[chartTime][0] && year !== yearStart))) {
        date = [months[month - 1], year];
        labels.push(date);
      }
      else if(useDates[chartTime].includes(month)) {
        date = months[month - 1];
        labels.push(date);
      }

      if(year === yearEnd && month === monthEnd) {
        month = 13;
      }
      else {
        month++;
      }
    }

    year++;
    month = 1;
  }

  return(labels);
}

export function setDatasets(stocks, yearStart, monthStart, yearEnd, monthEnd, colours, chartTime) {
  let datasets = stocks.map((v, i, a) => {
    let data = conformToChartTime(v.data, chartTime);

    let colour = colours.reduce((accu, rv, ri, ra) => `#${ra[i]}`, '');

    return({
      label: v.symbol,
      data: data,
      // xAxisID: '',
      // yAxisID: '',
      showLine: true,
      spanGaps: true,
      steppedLine: false,
      fill: false,
      backgroundColor: colour,
      borderCapStyle: 'round',
      borderJoinStyle: 'round',
      borderWidth: 2,
      borderColor: colour,
      pointStyle: 'rectRot',
      pointHitRadius: 10,
      pointRadius: 8,
      pointHoverRadius: 10,
      pointBorderColor: colour,
      pointHoverBorderColor: colour,
      pointBackgroundColor: colour,
      pointHoverBackgroundColor: colour,
      pointBorderWidth: 2,
      pointHoverBorderWidth: 2,
    });
  });

  return(datasets);
}

function conformToChartTime(data, chartTime) {
  let conformed = data.reduce((acc, v, i, a) => {
    if(useDates[chartTime].includes(v.month) || i === 0 || i === (a.length - 1)) {
      if(v.close === null) {
        acc.push(null);
      }
      else {
        acc.push(v.close);
      }
    }

    return(acc)
  }, []);

  return(conformed);
}