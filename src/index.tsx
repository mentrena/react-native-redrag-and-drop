export default {
  multiply(a: number, b: number) {
    return Promise.resolve(a * b);
  },
};

export * from './DragDropContainer';
export * from './DragView';
export * from './DropView';
