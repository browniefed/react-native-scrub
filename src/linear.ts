function makeItArrayIfItsNot(input) {
  return Object.prototype.toString.call(input) !== '[object Array]'
    ? [input]
    : input;
}

/**
 *
 * Utilizes bisection method to search an interval to which
 * point belongs to, then returns an index of left or right
 * border of the interval
 *
 * @param {Number} point
 * @param {Array} intervals
 * @param {Boolean} useRightBorder
 * @returns {Number}
 */

function findIntervalBorderIndex(point, intervals, useRightBorder?: boolean) {
  //If point is beyond given intervals
  if (point < intervals[0]) return 0;
  if (point > intervals[intervals.length - 1]) return intervals.length - 1;
  //If point is inside interval
  //Start searching on a full range of intervals
  var indexOfNumberToCompare,
    leftBorderIndex = 0,
    rightBorderIndex = intervals.length - 1;
  //Reduce searching range till it find an interval point belongs to using binary search
  while (rightBorderIndex - leftBorderIndex !== 1) {
    indexOfNumberToCompare =
      leftBorderIndex + Math.floor((rightBorderIndex - leftBorderIndex) / 2);
    point >= intervals[indexOfNumberToCompare]
      ? (leftBorderIndex = indexOfNumberToCompare)
      : (rightBorderIndex = indexOfNumberToCompare);
  }
  return useRightBorder ? rightBorderIndex : leftBorderIndex;
}

/**
 * Evaluates interpolating line/lines at the set of numbers
 * or at a single number for the function y=f(x)
 *
 * @param {Number|Array} pointsToEvaluate     number or set of numbers
 *                                            for which polynomial is calculated
 * @param {Array} functionValuesX             set of distinct x values
 * @param {Array} functionValuesY             set of distinct y=f(x) values
 * @returns {Array}
 */

/**
 *
 * Evaluates y-value at given x point for line that passes
 * through the points (x0,y0) and (y1,y1)
 *
 * @param x
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @returns {Number}
 */

function linearInterpolation(x, x0, y0, x1, y1) {
  var a = (y1 - y0) / (x1 - x0);
  var b = -a * x0 + y0;
  return a * x + b;
}

export function linear(pointsToEvaluate, functionValuesX, functionValuesY) {
  var results: any = [];
  pointsToEvaluate = makeItArrayIfItsNot(pointsToEvaluate);
  pointsToEvaluate.forEach(function(point) {
    var index = findIntervalBorderIndex(point, functionValuesX);
    if (index == functionValuesX.length - 1) index--;
    results.push(
      linearInterpolation(
        point,
        functionValuesX[index],
        functionValuesY[index],
        functionValuesX[index + 1],
        functionValuesY[index + 1]
      )
    );
  });
  return results;
}
