import React, { useState } from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import {
  Slider,
  Tick,
  CenterLine,
} from './react-native-scrub/react-native-scrub.esm';

const App = () => {
  const [display, setDisplay] = useState(50);
  const [value, setValue] = useState(50);

  return (
    <SafeAreaView>
      <Text
        style={{
          paddingVertical: 20,
          fontSize: 40,
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
        {display}
      </Text>
      <Slider
        min={10}
        max={100}
        step={1}
        value={value}
        onUpdate={v => {
          setDisplay(v);
        }}
        onChange={v => {
          setDisplay(v);
          setValue(v);
        }}
        renderTick={tick => <Tick key={tick.index} {...tick} />}>
        <CenterLine
          style={{
            backgroundColor: 'red',
          }}
        />
      </Slider>
    </SafeAreaView>
  );
};

export default App;
