import { input } from '@most/dom-event'
import { map, filter, debounce, skipRepeats, switchLatest, fromPromise } from 'most'
import rest from 'rest/client/jsonp'

const url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='

const search = document.getElementById('search')
const resultList = document.getElementById('results')
const template = document.getElementById('template').innerHTML

// Fetch results with rest.js
// Returns a promise for the wikipedia json response
const getResults = text => rest(url + text).entity()

// Debounce keystrokes and get input value when it changes
// Only search if the user stopped typing for 500ms, and if the
// text is longer than 1 character and is different than the last
// time we saw the text.
const searchText = input(search)
  .debounce(500)
  .map(e => e.target.value.trim())
  .filter(text => text.length > 1)
  .skipRepeats()

// Get results from wikipedia API and render
// Ignore empty results, extract the actual list of results
// from the wikipedia payload, then render the results
searchText.map(getResults)
  .map(fromPromise)
  .switch()
  .filter(response => response.length > 1)
  .map(response => response[1])
  .observe(results => {
    resultList.innerHTML = results.reduce((html, item) =>
      html + template.replace(/\{name\}/g, item), '')
  })
