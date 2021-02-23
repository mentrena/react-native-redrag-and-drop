import React, { useState } from 'react';

import { StyleSheet, View, SafeAreaView } from 'react-native';
import { DragDropContainer, DragView } from 'react-native-redrag-and-drop';
import { useSharedValue } from 'react-native-reanimated';
import MyDropView from './MyDropView';
import { ScrollView } from 'react-native-gesture-handler';

interface Item {
  id: string;
  color: string;
}

const randomColor = () => {
  return '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
};

const createItems: (count: number) => Item[] = (count: number) => {
  let array: Item[] = [];
  for (var i = 0; i < count; i++) {
    array.push({ id: String(i), color: randomColor() });
  }
  return array;
};

export default function App() {
  const [items, setItems] = useState(createItems(40));
  const [dropArea1Items, setDropArea1Items] = useState(0);
  const [dropArea2Items, setDropArea2Items] = useState(0);
  const activeDropId = useSharedValue<string>('');

  const validDropIds = (_dragId: string) => {
    return ['1', '2'];
  };

  const onDrop = (dragId: string, dropId: string) => {
    setItems(items.filter((i) => i.id !== dragId));
    if (dropId === '1') {
      setDropArea1Items(dropArea1Items + 1);
    } else {
      setDropArea2Items(dropArea2Items + 1);
    }
    activeDropId.value = '';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DragDropContainer
        style={styles.container}
        {...{
          onDrop,
          validDropIds,
        }}
      >
        <MyDropView id={'1'} count={dropArea1Items} style={styles.dropArea1} />
        <MyDropView id={'2'} count={dropArea2Items} style={styles.dropArea2} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {items.map((item: Item) => {
            return (
              <DragView id={item.id} key={item.id} style={styles.dragItem}>
                <View
                  style={[styles.dragItem, { backgroundColor: item.color }]}
                />
              </DragView>
            );
          })}
        </ScrollView>
      </DragDropContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContainer: {
    backgroundColor: 'white',
  },
  dropArea1: {
    backgroundColor: 'yellow',
    height: 100,
  },
  dropArea2: {
    backgroundColor: 'brown',
    height: 100,
  },
  dragItem: {
    width: 100,
    height: 100,
  },
});
