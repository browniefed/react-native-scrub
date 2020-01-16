import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  ViewStyle,
} from 'react-native';
//@ts-ignore
import { linear } from './linear';
import { clamp, range } from 'lodash-es';

import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

interface TickProps {
  value: number;
  index: number;
  spacing: number;
}

interface Props {
  min: number;
  max: number;
  step: number;
  value: number;
  spacing?: number;
  onChange: (value: number) => void;
  onUpdate: (value: number) => void;
  round?: (value: number) => number;
  renderTick: (tick: TickProps) => React.ReactNode;
}

const FULL_WIDTH = Dimensions.get('window').width;

const defaultRound = (v: number) => Math.round(v);

export const Tick: React.FC<TickProps> = ({ value, index, spacing }) => {
  let tickSize = 30;
  if (index % 5 === 0) {
    tickSize = 40;
  }
  if (index % 10 === 0) {
    tickSize = 50;
  }

  return (
    <View
      style={{
        alignItems: 'center',
        left: index * spacing,
      }}
    >
      <View
        style={[
          styles.tick,
          {
            height: tickSize,
          },
        ]}
      />
      {index % 10 === 0 && (
        <Text style={styles.tickLabel}>{Math.round(value)}</Text>
      )}
    </View>
  );
};

export const CenterLine: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return <View style={[styles.centerLine, style]} />;
};

export const Slider: React.FC<Props> = ({
  min,
  max,
  step,
  value,
  onChange,
  onUpdate,
  round = defaultRound,
  spacing = 20,
  renderTick,
  children,
}) => {
  const TICKS_ARRAY = range(min, max, step);
  const NUMBER_OF_TICKS = TICKS_ARRAY.length;
  const [width, setWidth] = useState(FULL_WIDTH);
  const halfWidth = (width || 0) / 2;
  const minScroll = -(NUMBER_OF_TICKS * spacing);
  const maxScroll = 0;

  const valueToPx = (degrees: number) => {
    return linear(degrees, [max, min], [minScroll, maxScroll])[0];
  };

  const [translateX] = useState(() => new Animated.Value(valueToPx(value)));
  const offsetX = useRef(0);

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: valueToPx(value),
    }).start();
    offsetX.current = 0;
  }, [value]);

  const dragXToValue = (x: number) => {
    const value = linear(x, [minScroll, maxScroll], [max, min])[0];
    return round(value);
  };

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    let activeValue = value;

    if (event.nativeEvent.state === State.END) {
      activeValue = dragXToValue(
        valueToPx(value) + offsetX.current + event.nativeEvent.translationX
      );
    }

    if (event.nativeEvent.oldState === State.ACTIVE) {
      offsetX.current += event.nativeEvent.translationX;
      onChange(clamp(activeValue, min, max));
    }
  };

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (
      event.nativeEvent.state === State.ACTIVE ||
      event.nativeEvent.state === State.END
    ) {
      let activeValue = dragXToValue(
        valueToPx(value) + offsetX.current + event.nativeEvent.translationX
      );

      if (activeValue < min) {
        activeValue = min;
      } else if (activeValue > max) {
        activeValue = max;
      }

      onUpdate(activeValue);

      Animated.spring(translateX, {
        toValue: valueToPx(activeValue),
        velocity: event.nativeEvent.velocityX,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <View
        style={styles.container}
        onLayout={e => {
          setWidth(e.nativeEvent.layout.width);
        }}
      >
        <Animated.View
          style={[
            styles.ticks,
            {
              left: halfWidth,
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [valueToPx(max), valueToPx(min)],
                    outputRange: [valueToPx(max), valueToPx(min)],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          {TICKS_ARRAY.map((i, index) => {
            return renderTick({
              value: i,
              index,
              spacing,
            });
          })}
        </Animated.View>
        {children}
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 100,
  },
  ticks: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    height: 100,
  },
  tick: {
    position: 'absolute',
    top: 0,
    width: 1,
    backgroundColor: '#dfdfe6',
    overflow: 'visible',
  },
  tickLabel: {
    position: 'absolute',
    bottom: 0,
    fontSize: 14,
    textAlign: 'center',
  },
  centerLine: {
    position: 'absolute',
    top: 0,
    left: '50%',
    height: 50,
    width: 2,
    borderRadius: 1,
  },
});
