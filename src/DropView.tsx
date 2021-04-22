import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { View, ViewProps } from 'react-native';
import {
  DragDropContext,
  DropContext,
  MeasurePositionCallback,
} from './DragDropContext';

export interface DropViewProps extends ViewProps {
  id: string;
  dragDidEnter?: (dragId: string) => void;
  dragDidLeave?: () => void;
}

const DropView: FunctionComponent<DropViewProps> = ({
  id,
  dragDidEnter,
  dragDidLeave,
  style,
  children,
}) => {
  const ref = useRef<View>(null);
  const { registerDropView } = useContext(DragDropContext);

  const measurePosition = useCallback((callback: MeasurePositionCallback) => {
    ref.current?.measureInWindow((x, y, width, height) => {
      callback({ x, y, width, height });
    });
  }, []);

  useEffect(() => {
    registerDropView({ id, dragDidEnter, dragDidLeave, measurePosition });
  }, [id, dragDidEnter, dragDidLeave, measurePosition, registerDropView]);

  return (
    <View ref={ref} style={style} collapsable={false}>
      <DropContext.Provider value={{ dropId: id }}>
        {children}
      </DropContext.Provider>
    </View>
  );
};

export { DropView };
