import { combine } from 'most'
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
var x = input(xInput).map(toNumber).startWith(0)

// x represents the current value of yInput
var y = input(yInput).map(toNumber).startWith(0)

// result is the live current value of adding x and y
var result = combine(add, x, y)

// Observe the result value by rendering it to the resultNode
result.observe(renderResult)
