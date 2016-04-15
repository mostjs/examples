import { map, startWith, observe } from 'most'
import { mousemove } from '@most/dom-event'

const toCoords = e => `${e.clientX},${e.clientY}`
const render = s => { document.body.textContent = s }

const coords = map(toCoords, mousemove(document))

observe(render, startWith('move the mouse, please', coords))
