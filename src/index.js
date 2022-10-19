import './styles/main.scss';

// require('dotenv').config();
// Create heading node
const heading = document.createElement('h1');
heading.textContent = 'Interesting!';

// Append heading node to the DOM
const app = document.querySelector('#root');
app.append(heading);

const form = document.querySelector('.js-form');
// form.addEventListener('submit', handleSubmit);
const nextBtn = document.querySelector('.js-next');
const prevBtn = document.querySelector('.js-prev');
const resultStats = document.querySelector('.js-result-stats');
const spinner = document.querySelector('.js-spinner');
let totalResults;
let currentPage = 1;
let searchQuery;

// const apiKey = process.env.API_KEY;
const apiKey = 'pN5XHlY9irMr4gdfSBGbcNHFiDbbzWMWrmo8I1NmC5k';

// "Your API key";

function pagination(totalPages) {
  nextBtn.classList.remove('hidden');
  if (currentPage >= totalPages) {
    nextBtn.classList.add('hidden');
  }

  prevBtn.classList.add('hidden');
  if (currentPage !== 1) {
    prevBtn.classList.remove('hidden');
  }
}

async function searchUnsplash(searchQry) {
  const endpoint = `https://api.unsplash.com/search/photos?query=${searchQry}&per_page=30&page=${currentPage}&client_id=${apiKey}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const json = await response.json();
  return json;
}

function displayResults(json) {
  const searchResults = document.querySelector('.search-results');
  searchResults.textContent = '';
  json.results.forEach(result => {
    const url = result.urls.small;
    const unsplashLink = result.links.html;
    const photographer = result.user.name;
    const photographerPage = result.user.links.html;
    searchResults.insertAdjacentHTML(
      'beforeend',
      `<div>
        <a href="${unsplashLink}" target="_blank">
          <div class="result-item" style="background-image: url(${url});"></div>
        </a>
        <p class="photographer-name">
          <a href="${photographerPage}" target="_blank" style="color: black; text-decoration: none;">Photo by ${photographer}</a>
        </p>
      </div>`,
    );
  });
  totalResults = json.total;
  resultStats.textContent = `About ${totalResults} results found`;
}

async function fetchResults(srchQuery) {
  spinner.classList.remove('hidden');
  try {
    const results = await searchUnsplash(srchQuery);
    pagination(results.total_pages);
    console.log(results);
    displayResults(results);
  } catch (err) {
    console.log(err);
    alert('Failed to search Unsplash');
  }
  spinner.classList.add('hidden');
}

function handleSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  const inputValue = document.querySelector('.js-search-input').value;
  searchQuery = inputValue.trim();
  console.log(searchQuery);
  fetchResults(searchQuery);
}

nextBtn.addEventListener('click', () => {
  currentPage += 1;
  fetchResults(searchQuery);
});

prevBtn.addEventListener('click', () => {
  currentPage -= 1;
  fetchResults(searchQuery);
});

form.addEventListener('submit', handleSubmit);

// Use HTML5 Local Storage to store and read saved searches.:-------------------
localStorage.setItem('myKey', 'myValue');
window.addEventListener('storage', event => {
  console.log(`The value for ${event.key} was changed from${event.oldValue} to ${event.newValue}`);
}, false);

// Check for HTML5 Storage..
function supportsHtml5Storage() {
  try {
    return 'localStorage' in window && window.localStorage !== null;
  } catch (e) {
    return false;
  }
}
supportsHtml5Storage();
