export function setLabels(yearStart, monthStart, yearEnd, monthEnd, allYear=false) {
  let months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
  let month = monthStart;
  let year = yearStart;
  let labels = [];

  while(year <= yearEnd) {
    while(month <= 12) {
      let date = null;
      if(allYear || !labels.length || month === 1 || (year === yearEnd && month === monthEnd)) {
        date = [months[month - 1], year];
      }
      else {
        date = months[month - 1];
      }

      labels.push(date);

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

export function setDatasets(stocks, yearStart, monthStart, yearEnd, monthEnd, colours) {
  let datasets = stocks.map((v, i, a) => {
    let data = v.data.map((mv, mi, ma) => mv.close);

    // Pad data array if stock starts later than yearStart && monthStart
    if(v.yearStart !== yearStart || v.monthStart !== monthStart) {
      let unshift = ((v.yearStart * 12) + v.monthStart) - ((yearStart * 12) + monthStart);

      if(unshift > 0) {
        while(unshift > 0) {
          data.unshift(null);
          unshift--;
        }
      }
    }

    // Pad data array if stock ends earlier than yearEnd && monthEnd
    if(v.yearEnd !== yearEnd || v.monthEnd !== monthEnd) {
      let push = ((v.yearEnd * 12) + v.monthEnd) - ((yearEnd * 12) + monthEnd);

      if(push < 0) {
        while(push < 0) {
          data.push('end');
          push++;
        }
      } 
    }

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
      pointHoverBorderWidth: 2
    });
  });

  return(datasets);
}