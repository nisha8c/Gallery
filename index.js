import './styles/main.scss';

// Create heading node
const heading = document.createElement('h1');
heading.textContent = 'Interesting!';

// Append heading node to the DOM
const app = document.querySelector('#root');
app.append(heading);

const form = document.querySelector('.js-form');
const nextBtn = document.querySelector('.js-next');
const prevBtn = document.querySelector('.js-prev');
const resultStats = document.querySelector('.js-result-stats');
const spinner = document.querySelector('.js-spinner');
let totalResults;
let currentPage = 1;
let searchQuery;

const apiKey = process.env.API_KEY;

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
    console.log('results.total_pages::: ', results.total_pages);
    pagination(results.total_pages);
    console.log('results::: ', results);
    displayResults(results);
  } catch (err) {
    console.log('Erroor:: ', err);
    alert('Failed to search Unsplash');
  }
  spinner.classList.add('hidden');
}

function handleSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  const inputValue = document.querySelector('.js-search-input').value;
  searchQuery = inputValue.trim();
  console.log('searchQuery:: ', searchQuery);
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

// -------Storage code starts

// function supportsLocalStorage() {
//   try {
//     return 'localStorage' in window && window.localStorage !== null;
//   } catch (e) {
//     return false;
//   }
// }

function getRecentSearches() {
  const searches = localStorage.getItem('recentSearches');
  if (searches) {
    return JSON.parse(searches);
  }
  return [];
}

function saveSearchString(str) {
  const searches = getRecentSearches();
  if (!str || searches.indexOf(str) > -1) {
    return false;
  }

  searches.push(str);
  localStorage.setItem('recentSearches', JSON.stringify(searches));
  return true;
}

function removeSearches() {
  localStorage.removeItem('recentSearches');
}

// Create an li, given string contents, append to the supplied ul
function appendListItem(listElement, string) {
  const listItemElement = document.createElement('LI');
  listItemElement.innerHTML = string;
  listElement.appendChild(listItemElement);
}

// Empty the contents of an element (ul)
function clearList(listElement) {
  // eslint-disable-next-line no-param-reassign
  listElement.innerHTML = '';
}

window.onload = function () {
  if (localStorage) {
    const searchForm = document.getElementById('searchForm');
    const searchBar = document.getElementById('searchBar');
    const recentSearchList = document.getElementById('recentSearchList');
    const clearButton = document.getElementById('clearStorage');

    // Initialize display list
    const recentSearches = getRecentSearches();
    recentSearches.forEach(searchString => {
      appendListItem(recentSearchList, searchString);
    });

    // Set event handlers
    searchForm.addEventListener('submit', () => {
      const searchString = searchBar.value;
      if (saveSearchString(searchString)) {
        appendListItem(recentSearchList, searchString);
      }
    });

    clearButton.addEventListener('click', () => {
      removeSearches();
      clearList(recentSearchList);
    });
  }
};

// -- try state changes way
