import React, { FunctionComponent, useContext, useRef } from 'react';
import type { LayoutRectangle, ViewProps } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { DragDropContext, DropContext } from './DragDropContext';

export interface DragViewProps extends ViewProps {
  id: string;
}

export interface DragViewHiding {
  show: (delay: number) => void;
  hide: () => void;
}

const DragView: FunctionComponent<DragViewProps> = ({
  id,
  style,
  children,
}) => {
  const ref = useRef<Animated.View>(null);
  const { didStartDrag, gestureHandler } = useContext(DragDropContext);
  const { dropId } = useContext(DropContext);

  const opacity = useSharedValue(1);
  const show = (delay: number) => {
    'worklet';
    if (delay) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 10 }));
    } else {
      opacity.value = 1;
    }
  };
  const hide = () => {
    'worklet';
    opacity.value = 0;
  };

  const measurePosition = (
    measuredPosition: (pos: LayoutRectangle) => void
  ) => {
    const node = ref.current!.getNode();
    if (node) {
      node.measureInWindow((x, y, width, height) => {
        measuredPosition({ x, y, width, height });
      });
    }
  };

  const notifyDidStartDrag = (translationX: number, translationY: number) => {
    measurePosition((pos: LayoutRectangle) => {
      didStartDrag(
        id,
        dropId,
        children,
        pos,
        { translationX, translationY },
        { show, hide }
      );
    });
  };

  const myGestureHandler = useAnimatedGestureHandler({
    onStart: ({ translationX, translationY }) => {
      runOnJS(notifyDidStartDrag)(translationX, translationY);
    },
    onActive: (event) => {
      gestureHandler.onActive(event);
    },
    onEnd: (event) => {
      gestureHandler.onEnd(event, { show, hide });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <PanGestureHandler onGestureEvent={myGestureHandler}>
      <Animated.View ref={ref} style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export { DragView };
