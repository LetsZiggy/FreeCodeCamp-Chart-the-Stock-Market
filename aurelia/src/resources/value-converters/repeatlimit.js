export class RepeatlimitValueConverter {
  toView(arr, start, count) {
    return(arr.slice(start, start + count));
  }

  fromView(arr) {

  }
}