import React from 'react';
import { StyleSheet, Text, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { DropView } from 'react-native-redrag-and-drop';

interface MyDropViewProps extends ViewProps {
  id: string;
  count: number;
}

const MyDropView = ({ id, count, style }: MyDropViewProps) => {
  const isHighlighted = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: isHighlighted.value ? 'blue' : 'transparent',
  }));

  const dragDidEnter = () => {
    isHighlighted.value = true;
  };

  const dragDidLeave = () => {
    isHighlighted.value = false;
  };

  return (
    <DropView {...{ id, style, dragDidEnter, dragDidLeave }}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <Text>Dropped: {count}</Text>
      </Animated.View>
    </DropView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderWidth: 2,
  },
});

export default MyDropView;
