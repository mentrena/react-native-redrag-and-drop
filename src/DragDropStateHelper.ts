import type { LayoutRectangle } from 'react-native';
import type { DropViewInfo } from './DragDropContext';

export default class DragDropStateHelper {
  dropViews: Map<string, DropViewInfo>;
  dropViewPositions: Map<string, LayoutRectangle>;
  containerPosition: LayoutRectangle;
  validDropIds: string[];

  constructor() {
    this.dropViews = new Map();
    this.dropViewPositions = new Map();
    this.validDropIds = [];
    this.containerPosition = { x: 0, y: 0, width: 0, height: 0 };
  }

  containerCoordinatesForRect(r1: LayoutRectangle) {
    return {
      x: r1.x - this.containerPosition.x,
      y: r1.y - this.containerPosition.y,
      width: r1.width,
      height: r1.height,
    };
  }

  updateContainerPosition(pos: LayoutRectangle) {
    this.containerPosition = pos;
  }

  updateDropViewInfo(view: DropViewInfo) {
    this.dropViews.set(view.id, view);
  }

  updateDropViewPosition(id: string, position: LayoutRectangle) {
    this.dropViewPositions.set(id, position);
  }

  isDropCandidate: (rect: LayoutRectangle) => string | null = (
    rect: LayoutRectangle
  ) => {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    for (const [id, dropRect] of this.dropViewPositions.entries()) {
      const adjustedDropRect = this.containerCoordinatesForRect(dropRect);
      if (
        centerX > adjustedDropRect.x &&
        centerX < adjustedDropRect.x + adjustedDropRect.width &&
        centerY > adjustedDropRect.y &&
        centerY < adjustedDropRect.y + adjustedDropRect.height
      ) {
        return id;
      }
    }

    return null;
  };

  setValidDropIds(dropIds: string[]) {
    this.validDropIds = dropIds;
  }

  setDefaultValidDropIds(dropId: string | undefined) {
    this.validDropIds = Object.keys(this.dropViews).filter((k) => k !== dropId);
  }

  clearValidDropIds() {
    this.validDropIds = [];
  }
}
