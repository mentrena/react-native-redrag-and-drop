# react-native-redrag-and-drop

Easy drag and drop implementation for React Native.

## Installation

```sh
npm install react-native-redrag-and-drop
```

or

```sh
yarn add react-native-redrag-and-drop
```

The package depends on `react-native-gesture-handler` and `react-native-reanimated`, your app should have those installed.

## Usage

There are three components that you need to use: `DragDropContainer`, `DragView` and `DropView`.

```typescript
import {
  DragDropContainer,
  DropView,
  DragView,
} from 'react-native-redrag-and-drop';

const App = () => {
  const [items, setItems] = useState([{ id: '1' }, { id: '2' }]);

  const onDrop = (dragId: string, dropId: string) => {
    // Remove dropped item
    setItems(items.filter((i) => i.id !== dragId));
  }

  return (
    <DragDropContainer>
      <DropView id='drop-1' style={styles.dropArea}/>
      {items.map((i) => {
        return (
          <DragView id={i.id} key={i.id}>
            <Text>Drag me</Text>
          </DragView>);
      })}
    </DragDropContainer>
  )
};
```

### DragDropContainer

Use this view at the top level. The whole interaction will happen within the bounds of the container and the other views will be somewhere within that hierarchy.

Props | Description
-------|------
dragDidStart?: (dragId: string) => void | This will be called when a drag starts happening, and you will get the id of the view being dragged.
validDropIds?: (dragId: string) => string[] | Implement this to return a list of valid drop views for a given drag view. If a function is not provided, the default behavior will be to allow a drop for all drop views except the one currently containing the drag view, if any.
dragDidMove?: (position: LayoutRectangle) => void | You can provide a worklet to be called during the animation, in case you want to animate some other view concurrently. The position will be in the coordinates of the container. The funciont _must_ be a worklet.
onDropHover?: (dropId: string \| undefined) => void | It will be called when a drag view enters the bounds of a drop view.
onDrop?: (dragId: string, dropId: string) => void | Called when a drag view is dropped inside a drop view. You get both ids and can perform your state-changing actions here.

### DropView

A `DropView` will allow you to drop a dragView in it. It is identified by a provided `id` string. It can have any children, including drag views.

Props | Description
-------|--------
id: string | The id of this view.
dragDidEnter?: (dragId: string) => void | Called when the dragView with the given dragId enters the bounds of this dropView. This can be used to highlight the drop view, for example
dragDidLeave?: () => void | Called when a dragView left the bounds of this view.

### DragView

A `DragView` will wrap the view that you want to move around and into a `DropView`. It _should_ have children, as these are used to perform the drag animation.

Props | Description
--------|--------
id: string | The id of this view.

### Sample

![](https://github.com/mentrena/react-native-redrag-and-drop/blob/main/redragdrop.gif)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
