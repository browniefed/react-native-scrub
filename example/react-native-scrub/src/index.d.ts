import React from 'react';
import { ViewStyle } from 'react-native';
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
export declare const Tick: React.FC<TickProps>;
export declare const CenterLine: React.FC<{
    style?: ViewStyle;
}>;
export declare const Slider: React.FC<Props>;
export {};
