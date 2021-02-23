import React, { createContext } from 'react';
import type { LayoutRectangle } from 'react-native';
import type {
  GestureEventPayload,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import type { DragViewHiding } from './DragView';

export type GestureHandlerPayload = Readonly<
  GestureEventPayload & PanGestureHandlerEventPayload
>;

export type MeasurePositionCallback = (r: LayoutRectangle) => void;

export interface DropViewInfo {
  id: string;
  dragDidEnter?: (dragId: string) => void;
  dragDidLeave?: () => void;
  measurePosition: (callback: MeasurePositionCallback) => void;
}

interface DropState {
  dropId: string | undefined;
}

const DropContext = createContext<DropState>({
  dropId: undefined,
});

interface DragDropState {
  registerDropView: (info: DropViewInfo) => void;
  didStartDrag: (
    dragId: string,
    dropId: string | undefined,
    dragChildren: React.ReactNode,
    position: LayoutRectangle,
    translation: { translationX: number; translationY: number },
    hiding: DragViewHiding
  ) => void;
  gestureHandler: {
    onActive: (event: GestureHandlerPayload) => void;
    onEnd: (event: GestureHandlerPayload, hiding: DragViewHiding) => void;
  };
}

const DragDropContext = createContext<DragDropState>({
  registerDropView: () => {},
  didStartDrag: () => {},
  gestureHandler: {
    onActive: () => {},
    onEnd: () => {},
  },
});

export { DragDropContext, DropContext };
