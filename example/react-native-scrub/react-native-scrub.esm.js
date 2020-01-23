import React, { useState, useRef, useEffect } from 'react';
import { Dimensions, View, Text, Animated, StyleSheet } from 'react-native';
import { range, clamp } from 'lodash-es';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

function makeItArrayIfItsNot(input) {
  return Object.prototype.toString.call(input) !== '[object Array]' ? [input] : input;
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


function findIntervalBorderIndex(point, intervals, useRightBorder) {
  //If point is beyond given intervals
  if (point < intervals[0]) return 0;
  if (point > intervals[intervals.length - 1]) return intervals.length - 1; //If point is inside interval
  //Start searching on a full range of intervals

  var indexOfNumberToCompare,
      leftBorderIndex = 0,
      rightBorderIndex = intervals.length - 1; //Reduce searching range till it find an interval point belongs to using binary search

  while (rightBorderIndex - leftBorderIndex !== 1) {
    indexOfNumberToCompare = leftBorderIndex + Math.floor((rightBorderIndex - leftBorderIndex) / 2);
    point >= intervals[indexOfNumberToCompare] ? leftBorderIndex = indexOfNumberToCompare : rightBorderIndex = indexOfNumberToCompare;
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

function linear(pointsToEvaluate, functionValuesX, functionValuesY) {
  var results = [];
  pointsToEvaluate = makeItArrayIfItsNot(pointsToEvaluate);
  pointsToEvaluate.forEach(function (point) {
    var index = findIntervalBorderIndex(point, functionValuesX);
    if (index == functionValuesX.length - 1) index--;
    results.push(linearInterpolation(point, functionValuesX[index], functionValuesY[index], functionValuesX[index + 1], functionValuesY[index + 1]));
  });
  return results;
}

var FULL_WIDTH =
/*#__PURE__*/
Dimensions.get('window').width;

var defaultRound = function defaultRound(v) {
  return Math.round(v);
};

var Tick = function Tick(_ref) {
  var value = _ref.value,
      index = _ref.index,
      spacing = _ref.spacing;
  var tickSize = 30;

  if (index % 5 === 0) {
    tickSize = 40;
  }

  if (index % 10 === 0) {
    tickSize = 50;
  }

  return React.createElement(View, {
    style: {
      alignItems: 'center',
      left: index * spacing
    }
  }, React.createElement(View, {
    style: [styles.tick, {
      height: tickSize
    }]
  }), index % 10 === 0 && React.createElement(Text, {
    style: styles.tickLabel
  }, Math.round(value)));
};
var CenterLine = function CenterLine(_ref2) {
  var style = _ref2.style;
  return React.createElement(View, {
    style: [styles.centerLine, style]
  });
};
var Slider = function Slider(_ref3) {
  var min = _ref3.min,
      max = _ref3.max,
      step = _ref3.step,
      value = _ref3.value,
      onChange = _ref3.onChange,
      onUpdate = _ref3.onUpdate,
      _ref3$round = _ref3.round,
      round = _ref3$round === void 0 ? defaultRound : _ref3$round,
      _ref3$spacing = _ref3.spacing,
      spacing = _ref3$spacing === void 0 ? 20 : _ref3$spacing,
      renderTick = _ref3.renderTick,
      children = _ref3.children;
  var TICKS_ARRAY = range(min, max, step);
  var NUMBER_OF_TICKS = TICKS_ARRAY.length;

  var _useState = useState(FULL_WIDTH),
      width = _useState[0],
      setWidth = _useState[1];

  var halfWidth = (width || 0) / 2;
  var minScroll = -(NUMBER_OF_TICKS * spacing);
  var maxScroll = 0;

  var valueToPx = function valueToPx(degrees) {
    return linear(degrees, [max, min], [minScroll, maxScroll])[0];
  };

  var _useState2 = useState(function () {
    return new Animated.Value(valueToPx(value));
  }),
      translateX = _useState2[0];

  var offsetX = useRef(0);
  useEffect(function () {
    Animated.spring(translateX, {
      toValue: valueToPx(value)
    }).start();
    offsetX.current = 0;
  }, [value]);

  var dragXToValue = function dragXToValue(x) {
    var value = linear(x, [minScroll, maxScroll], [max, min])[0];
    return round(value);
  };

  var onHandlerStateChange = function onHandlerStateChange(event) {
    var activeValue = value;

    if (event.nativeEvent.state === State.END) {
      activeValue = dragXToValue(valueToPx(value) + offsetX.current + event.nativeEvent.translationX);
    }

    if (event.nativeEvent.oldState === State.ACTIVE) {
      offsetX.current += event.nativeEvent.translationX;
      onChange(clamp(activeValue, min, max));
    }
  };

  var onGestureEvent = function onGestureEvent(event) {
    if (event.nativeEvent.state === State.ACTIVE || event.nativeEvent.state === State.END) {
      var activeValue = dragXToValue(valueToPx(value) + offsetX.current + event.nativeEvent.translationX);

      if (activeValue < min) {
        activeValue = min;
      } else if (activeValue > max) {
        activeValue = max;
      }

      onUpdate(activeValue);
      Animated.spring(translateX, {
        toValue: valueToPx(activeValue),
        velocity: event.nativeEvent.velocityX
      }).start(function () {
        offsetX.current = 0;
      });
    }
  };

  return React.createElement(PanGestureHandler, {
    onGestureEvent: onGestureEvent,
    onHandlerStateChange: onHandlerStateChange
  }, React.createElement(View, {
    style: styles.container,
    onLayout: function onLayout(e) {
      setWidth(e.nativeEvent.layout.width);
    }
  }, React.createElement(Animated.View, {
    style: [styles.ticks, {
      left: halfWidth,
      transform: [{
        translateX: translateX.interpolate({
          inputRange: [valueToPx(max), valueToPx(min)],
          outputRange: [valueToPx(max), valueToPx(min)],
          extrapolate: 'clamp'
        })
      }]
    }]
  }, TICKS_ARRAY.map(function (i, index) {
    return renderTick({
      value: i,
      index: index,
      spacing: spacing
    });
  })), children));
};
var styles =
/*#__PURE__*/
StyleSheet.create({
  container: {
    width: '100%',
    height: 100
  },
  ticks: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    height: 100
  },
  tick: {
    position: 'absolute',
    top: 0,
    width: 1,
    backgroundColor: '#dfdfe6',
    overflow: 'visible'
  },
  tickLabel: {
    position: 'absolute',
    bottom: 0,
    fontSize: 14,
    textAlign: 'center'
  },
  centerLine: {
    position: 'absolute',
    top: 0,
    left: '50%',
    height: 50,
    width: 2,
    borderRadius: 1
  }
});

export { CenterLine, Slider, Tick };
//# sourceMappingURL=react-native-scrub.esm.js.map
