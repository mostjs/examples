//
// Behavior switching is a powerful aspect of streams.
// It allows a stream to behave like one stream, and then
// switch to behave like another, all without using shared
// variables or other mutable state.
//
// This demo implements drag and drop using behavior switching.
//
import { just, merge } from 'most'
import { mousedown, mousemove, mouseup } from '@most/dom-event'

const DROP = 0
const GRAB = 1
const DRAG = 2

// The area where we want to do the dragging
const area = document.querySelector('.dragging-area')
// The thing we want to make draggable
const draggable = document.querySelector('.draggable')

// A higher-order stream (stream whose items are themselves streams)
// A mousedown DOM event generates a stream event which is
// a stream of 1 GRAB followed by DRAGs (ie mousemoves).
const makeDraggable = (area, draggable) => {
  const drag = mousedown(draggable)
    .tap(preventDefault) // On Firefox, avoid the dragging to select text
    .map(beginDrag(area, draggable))

  // A mouseup DOM event generates a stream event which is a
  // stream containing a DROP.
  const drop = mouseup(area)
    .map(endDrag(draggable))

  // Merge the drag and drop streams.
  // Then use switch() to ensure that the resulting stream behaves
  // like the drag stream until an event occurs on the drop stream.  Then
  // it will behave like the drop stream until the drag stream starts
  // producing events again.
  // This effectively *toggles behavior* between dragging behavior and
  // dropped behavior.
  return merge(drag, drop).switch()
}

const preventDefault = e => e.preventDefault()

const beginDrag = (area, draggable) => e => {
  // Memorize click position within the box
  const dragOffset = {
    dx: e.clientX - draggable.offsetLeft,
    dy: e.clientY - draggable.offsetTop
  }

  return mousemove(area)
    .map(e => eventToDragInfo(DRAG, draggable, e, dragOffset))
    .startWith(eventToDragInfo(GRAB, draggable, e))
}

const endDrag = draggable => e =>
  just(eventToDragInfo(DROP, draggable, e))

// dragOffset is undefined and unused for actions other than DRAG.
const eventToDragInfo = (action, target, e, dragOffset) =>
  ({ action: action, target: target, x: e.clientX, y: e.clientY, offset: dragOffset })

const handleDrag = dragInfo => {
  const el = dragInfo.target

  if (dragInfo.action === GRAB) {
    el.classList.add('dragging')
    return
  }

  if (dragInfo.action === DROP) {
    el.classList.remove('dragging')
    return
  }

  const els = el.style
  els.left = (dragInfo.x - dragInfo.offset.dx) + 'px'
  els.top = (dragInfo.y - dragInfo.offset.dy) + 'px'
}

makeDraggable(area, draggable)
  .observe(handleDrag)
