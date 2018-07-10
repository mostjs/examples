import { map, runEffects, startWith, tap } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import { mousemove } from '@most/dom-event'

const toCoords = e => `${e.clientX},${e.clientY}`
const render = s => { document.body.textContent = s }

const coords = map(toCoords, mousemove(document))
const updates = startWith('move the mouse, please', coords)

runEffects(tap(render, updates), newDefaultScheduler())
