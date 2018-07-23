import { map, now, runEffects, filter, fromPromise, debounce, skipRepeats, switchLatest, tap } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import { input } from '@most/dom-event'
import { partition, mapEither, unpartition } from 'most-product'
import rest from 'rest/client/jsonp'

const url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='

const search = document.getElementById('search')
const resultList = document.getElementById('results')
const template = document.getElementById('template').innerHTML

// Fetch results with rest.js
// Returns a promise for the wikipedia json response
const getResults = text => rest(url + text).entity()

// Get input value when it changes
// Multicast the stream as it's later being merged by an observer
const searchText = input(search) |>
  map(e => e.target.value.trim()) |>
  skipRepeats |>
  debounce(500)

// Get results from wikipedia API and render
// Only search if the user stopped typing for 500ms
// and is different than the last time we saw the text
// Ignore empty results, extract and return the actual
// list of results from the wikipedia payload
const results = searchText |>
  filter(text => text.length > 1) |>
  map(getResults) |>
  map(fromPromise) |>
  switchLatest |>
  partition(results => results.length > 1) |>
  mapEither(_ => [], results => results[1]) |>
  unpartition

const render = resultContent => {
  resultList.innerHTML = resultContent.reduce(
    (html, item) => html + template.replace(/\{name\}/g, item), ''
  )
}

// Render the results
runEffects(tap(render, results), newDefaultScheduler())
