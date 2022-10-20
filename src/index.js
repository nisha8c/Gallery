import './styles/main.scss';

let state = {
  searchHistory: '',
  imageUrls: '',
};

const template = inputState => `
    <datalist id="searchHistory">${inputState.searchHistory}</datalist>
    <div id="images">${inputState.imageUrls}</div>
  `;

const render = (htmlString, el) => {
  const element = el;
  element.innerHTML = htmlString;
};

const update = newState => {
  state = { ...state, ...newState };
  console.log('State: ', state);
  window.dispatchEvent(new Event('statechange'));
};

// -------------------------------
const form = document.querySelector('.js-form');
const nextBtn = document.querySelector('.js-next');
const prevBtn = document.querySelector('.js-prev');
const resultStats = document.querySelector('.js-result-stats');
const spinner = document.querySelector('.js-spinner');
let totalResults;
let currentPage = 1;
let searchQuery;

const apiKey = process.env.API_KEY;

const pagination = totalPages => {
  nextBtn.classList.remove('hidden');
  if (currentPage >= totalPages) {
    nextBtn.classList.add('hidden');
  }

  prevBtn.classList.add('hidden');
  if (currentPage !== 1) {
    prevBtn.classList.remove('hidden');
  }
};

async function searchUnsplash(searchQry) {
  const endpoint = `https://api.unsplash.com/search/photos?query=${searchQry}&per_page=30&page=${currentPage}&client_id=${apiKey}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const json = await response.json();
  return json;
}

const displayResults = json => {
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
};

async function fetchResults(srchQuery) {
  spinner.classList.remove('hidden');
  try {
    const results = await searchUnsplash(srchQuery);
    pagination(results.total_pages);
    displayResults(results);
  } catch (err) {
    console.log('Error:: ', err);
  }
  spinner.classList.add('hidden');
}

const handleSubmit = event => {
  event.preventDefault();
  currentPage = 1;
  const inputValue = document.querySelector('.js-search-input').value;
  searchQuery = inputValue.trim();
  fetchResults(searchQuery);
};

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

const getRecentSearches = () => {
  const searches = localStorage.getItem('recentSearches');
  if (searches) {
    return JSON.parse(searches);
  }
  return [];
};

const saveSearchString = str => {
  const searches = getRecentSearches();
  if (!str || searches.indexOf(str) > -1) {
    return false;
  }

  searches.push(str);
  localStorage.setItem('recentSearches', JSON.stringify(searches));
  return true;
};

const removeSearches = () => {
  localStorage.removeItem('recentSearches');
};

// Create an li, given string contents, append to the supplied ul
const appendListItem = (listElement, string) => {
  const listItemElement = document.createElement('LI');
  listItemElement.innerHTML = string;
  listElement.appendChild(listItemElement);
};

// Empty the contents of an element (ul)
const clearList = listElement => {
  // eslint-disable-next-line no-param-reassign
  listElement.innerHTML = '';
};

window.onload = () => {
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

    // searchBar.addEventListener('keyup', () => {
    //   console.log('Key Up Event...');
    // });

    // const searchTerm = document.querySelector('#searchfield').value;
    // const searchHTML = `<option value="${searchTerm}">${searchTerm}</option>`;

    update({ searchHistory: recentSearchList.textContent });
  }
};

// -------------------------------

window.addEventListener('statechange', () => {
  render(template(state), document.querySelector('#root'));
});
