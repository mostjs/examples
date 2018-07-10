import { combine, map, runEffects, startWith, tap } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import { input } from '@most/dom-event'

// Display the result of adding two inputs.
// The result is reactive and updates whenever *either* input changes.

const xInput = document.querySelector('input.x')
const yInput = document.querySelector('input.y')
const resultNode = document.querySelector('.result')

const add = (x, y) => x + y
const toNumber = e => Number(e.target.value)
const renderResult = result => { resultNode.textContent = result }

// x represents the current value of xInput
const x = startWith(0, map(toNumber, input(xInput)))

// y represents the current value of yInput
const y = startWith(0, map(toNumber, input(yInput)))

// result is the live current value of adding x and y
const result = combine(add, x, y)

// Observe the result value by rendering it to the resultNode
runEffects(tap(renderResult, result), newDefaultScheduler())
