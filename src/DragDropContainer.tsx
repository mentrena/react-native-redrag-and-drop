import React, { FunctionComponent, useState } from 'react';
import { useRef } from 'react';
import { LayoutRectangle, StyleSheet, View, ViewProps } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  DragDropContext,
  DropViewInfo,
  GestureHandlerPayload,
} from './DragDropContext';
import DragDropStateHelper from './DragDropStateHelper';
import type { DragViewHiding } from './DragView';

interface DragDropContainerProps extends ViewProps {
  dragDidStart?: (dragId: string) => void;
  validDropIds?: (dragId: string) => string[];
  dragDidMove?: (position: LayoutRectangle) => void;
  onDropHover?: (dropId: string | undefined) => void;
  onDrop?: (dragId: string, dropId: string) => void;
}

const DragDropContainer: FunctionComponent<DragDropContainerProps> = ({
  dragDidStart,
  validDropIds,
  dragDidMove,
  onDropHover,
  onDrop,
  style,
  children,
}) => {
  const containerRef = useRef<View>(null);
  const [dragDropConfig] = useState(new DragDropStateHelper());
  const isDragging = useSharedValue(false);
  const [draggingChildren, setDraggingChildren] = useState<
    React.ReactNode | undefined
  >(undefined);
  const draggingId = useSharedValue<string>('');
  const initialX = useSharedValue(0);
  const initialY = useSharedValue(0);
  const initialWidth = useSharedValue(0);
  const initialHeight = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const activeHoverId = useSharedValue<string | undefined>(undefined);

  const registerDropView = (info: DropViewInfo) => {
    dragDropConfig.updateDropViewInfo(info);
  };

  const stopDrag = () => {
    setDraggingChildren(undefined);
  };

  const checkDropAreas = (r: LayoutRectangle) => {
    const areaId = dragDropConfig.isDropCandidate(r);
    if (areaId) {
      if (areaId !== activeHoverId.value) {
        if (dragDropConfig.validDropIds.includes(areaId)) {
          if (activeHoverId.value) {
            dragDropConfig.dropViews.get(activeHoverId.value)?.dragDidLeave?.();
          }
          activeHoverId.value = areaId;
          onDropHover?.(areaId);
          dragDropConfig.dropViews
            .get(areaId)
            ?.dragDidEnter?.(draggingId.value);
        } else if (activeHoverId.value) {
          dragDropConfig.dropViews.get(activeHoverId.value)?.dragDidLeave?.();
          activeHoverId.value = '';
          onDropHover?.(undefined);
        }
      }
    } else if (activeHoverId.value) {
      dragDropConfig.dropViews.get(activeHoverId.value)?.dragDidLeave?.();
      activeHoverId.value = '';
    }
  };

  const notifyDrop = () => {
    const dropId = activeHoverId.value;
    if (dropId) {
      onDrop?.(draggingId.value, dropId);
      dragDropConfig.dropViews.get(dropId)?.dragDidLeave?.();
    }
    activeHoverId.value = '';
  };

  const snapshotLayout = (callback: () => void) => {
    containerRef.current?.measureInWindow((x, y, width, height) => {
      dragDropConfig.updateContainerPosition({ x, y, width, height });
      callback();
    });
    dragDropConfig.dropViews.forEach((value, key) => {
      value.measurePosition((r) => {
        dragDropConfig.updateDropViewPosition(key, r);
      });
    });
  };

  const didStartDrag = (
    dragId: string,
    dropId: string | undefined,
    dragChildren: React.ReactNode,
    position: LayoutRectangle,
    {
      translationX,
      translationY,
    }: { translationX: number; translationY: number },
    { hide }: DragViewHiding
  ) => {
    snapshotLayout(() => {
      setDraggingChildren(
        React.Children.map(dragChildren, (child) => {
          return React.isValidElement(child) ? React.cloneElement(child) : null;
        })
      );

      dragDidStart?.(dragId);
      if (validDropIds) {
        dragDropConfig.setValidDropIds(validDropIds(dragId));
      } else {
        dragDropConfig.setDefaultValidDropIds(dropId);
      }

      const adjustedPosition = dragDropConfig.containerCoordinatesForRect({
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
      });

      draggingId.value = dragId;
      initialX.value = adjustedPosition.x;
      initialY.value = adjustedPosition.y;
      initialWidth.value = adjustedPosition.width;
      initialHeight.value = adjustedPosition.height;
      translateX.value = adjustedPosition.x + translationX;
      translateY.value = adjustedPosition.y + translationY;
      isDragging.value = true;
      hide();
    });
  };

  const gestureHandler = {
    onActive: ({ translationX, translationY }: GestureHandlerPayload) => {
      'worklet';
      const rect = {
        x: initialX.value + translationX,
        y: initialY.value + translationY,
        width: initialWidth.value,
        height: initialHeight.value,
      };
      translateX.value = rect.x;
      translateY.value = rect.y;
      dragDidMove?.(rect);
      runOnJS(checkDropAreas)(rect);
    },
    onEnd: (_event: GestureHandlerPayload, { show }: DragViewHiding) => {
      'worklet';

      if (activeHoverId.value) {
        runOnJS(notifyDrop)();
        runOnJS(stopDrag)();
        isDragging.value = false;
        show(10);
      } else {
        translateX.value = withTiming(initialX.value, { duration: 300 });
        translateY.value = withTiming(initialY.value, { duration: 300 }, () => {
          show(0);
          runOnJS(stopDrag)();
          isDragging.value = false;
        });
      }
    },
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value ? 1 : 0,
    width: initialWidth.value,
    height: initialHeight.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View ref={containerRef} style={style} collapsable={false}>
      <GestureHandlerRootView style={styles.gestureRootView}>
        <DragDropContext.Provider
          value={{
            registerDropView,
            didStartDrag,
            gestureHandler,
          }}
        >
          {children}
          <Animated.View
            style={[styles.dragView, animatedStyle]}
            pointerEvents="none"
          >
            {draggingChildren ? draggingChildren : null}
          </Animated.View>
        </DragDropContext.Provider>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  dragView: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 100,
  },
  gestureRootView: {
    flex: 1,
  },
});

export { DragDropContainer };
