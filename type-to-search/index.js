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

// Get input value when it changes
const searchText = input(search).map(e => e.target.value.trim()).skipRepeats()

// Get results from wikipedia API and render
// Only search if the user stopped typing for 500ms
// and is different than the last time we saw the text
// Ignore empty results, extract the actual list of results
// from the wikipedia payload, then render the results
searchText
  .filter(text => text.length >= 1)
  .debounce(500)
  .map(getResults)
  .map(fromPromise)
  .switch()
  .filter(response => response.length > 1)
  .map(response => response[1])
  .observe(results => {
    resultList.innerHTML = results.reduce((html, item) =>
      html + template.replace(/\{name\}/g, item), '')
  })

// Empty the results list if there is no search term
searchText
  .filter(text => text.length < 1)
  .observe(_ => resultList.innerHTML = "")
