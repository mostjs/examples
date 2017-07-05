import { input } from '@most/dom-event'
import { map, filter, debounce, skipRepeats, switchLatest, fromPromise, merge } from 'most'
import rest from 'rest/client/jsonp'

const url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='

const search = document.getElementById('search')
const resultList = document.getElementById('results')
const template = document.getElementById('template').innerHTML

// Fetch results with rest.js
// Returns a promise for the wikipedia json response
const getResults = text => rest(url + text).entity()

// Get input value when it changes
const searchText = input(search)
  .map(e => e.target.value.trim())
  .skipRepeats()

// Get results from wikipedia API and render
// Only search if the user stopped typing for 500ms
// and is different than the last time we saw the text
// Ignore empty results, extract and return the actual
// list of results from the wikipedia payload
const results = searchText
  .filter(text => text.length > 1)
  .debounce(500)
  .map(getResults)
  .map(fromPromise)
  .switch()
  .filter(results => results.length > 1)
  .map(results => results[1])

// Empty results list if there is no search term
const emptyResults = searchText
  .filter(text => text.length < 1)
  .constant([])

// Render the results
merge(results, emptyResults)
  .observe(resultContent => {
    resultList.innerHTML = resultContent.reduce(
      (html, item) => html + template.replace(/\{name\}/g, item), ''
    )
  })
