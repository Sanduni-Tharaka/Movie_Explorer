const API_KEY = 'ee54881f';
const BASE_URL = 'https://www.omdbapi.com/';

const TOP_RATED_MOVIES = [
    'tt0111161',
    'tt0068646',
    'tt0468569',
    'tt0071562',
    'tt0050083'
];

let searchInput, keywordInput, imdbInput, loading, error, results, topMoviesContainer, topMoviesSection;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    searchInput = document.getElementById('searchInput');
    keywordInput = document.getElementById('keywordInput');
    imdbInput = document.getElementById('imdbInput');
    loading = document.getElementById('loading');
    error = document.getElementById('error');
    results = document.getElementById('results');
    topMoviesContainer = document.getElementById('topMovies');
    topMoviesSection = document.querySelector('.top-movies-section');

    setupEventListeners();
    loadTopRatedMovies();
    showHome();
}

function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchMovie();
        });
    }
    
    if (keywordInput) {
        keywordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchByKeyword();
        });
    }
    
    if (imdbInput) {
        imdbInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchByImdb();
        });
    }
}

async function loadTopRatedMovies() {
    if (!topMoviesContainer) return;
    
    try {
        topMoviesContainer.innerHTML = '<div style="text-align: center; color: #8ecae6;">Loading top movies...</div>';
        
        const moviePromises = TOP_RATED_MOVIES.map(imdbId => 
            fetchMovieByImdbId(imdbId)
        );

        const movies = await Promise.all(moviePromises);
        const validMovies = movies.filter(movie => movie && movie.Response === 'True');
        
        displayTopMovies(validMovies);
    } catch (err) {
        if (topMoviesContainer) {
            topMoviesContainer.innerHTML = '<p style="text-align: center; color: #8ecae6;">Failed to load top movies</p>';
        }
    }
}

function displayTopMovies(movies) {
    if (!topMoviesContainer) return;
    
    if (movies.length === 0) {
        topMoviesContainer.innerHTML = '<p style="text-align: center; color: #8ecae6;">No movies found</p>';
        return;
    }

    const moviesHTML = movies.map((movie, index) => `
        <div class="movie-card" onclick="getMovieDetails('${movie.imdbID}')">
            ${index < 3 ? '<div class="top-movie-badge">TOP ' + (index + 1) + '</div>' : ''}
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300/333/fff?text=No+Poster'}" 
                 alt="${movie.Title}" 
                 class="movie-poster"
                 onerror="this.src='https://via.placeholder.com/200x300/333/fff?text=No+Poster'">
            ${movie.imdbRating && movie.imdbRating !== 'N/A' ? 
                `<div class="movie-rating">⭐ ${movie.imdbRating}</div>` : ''}
            <div class="movie-info">
                <div class="movie-title">${movie.Title}</div>
                <div class="movie-year">${movie.Year}</div>
            </div>
        </div>
    `).join('');
    
    topMoviesContainer.innerHTML = moviesHTML;
}

function hideTopMovies() {
    if (topMoviesSection) {
        topMoviesSection.style.display = 'none';
    }
}

function showTopMovies() {
    if (topMoviesSection) {
        topMoviesSection.style.display = 'block';
    }
}

async function searchMovie() {
    if (!searchInput) return;
    
    const title = searchInput.value.trim();
    if (!title) {
        showError('Please enter a movie title');
        return;
    }
    
    showLoading();
    hideError();
    hideTopMovies();
    
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
            showMovieDetails(data);
        } else {
            showError('Movie not found. Please try another title.');
            showTopMovies();
        }
    } catch (err) {
        showError('Failed to search movie. Please try again.');
        showTopMovies();
    } finally {
        hideLoading();
    }
}

async function searchByKeyword() {
    if (!keywordInput) return;
    
    const keyword = keywordInput.value.trim();
    if (!keyword) {
        showError('Please enter a keyword');
        return;
    }
    
    showLoading();
    hideError();
    hideTopMovies();
    
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(keyword)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True' && data.Search) {
            showMovieList(data.Search, `Search results for: "${keyword}"`);
        } else {
            showError('No movies found for this keyword.');
            showTopMovies();
        }
    } catch (err) {
        showError('Failed to search movies. Please try again.');
        showTopMovies();
    } finally {
        hideLoading();
    }
}

async function searchByImdb() {
    if (!imdbInput) return;
    
    const imdbId = imdbInput.value.trim();
    if (!imdbId) {
        showError('Please enter an IMDb ID');
        return;
    }
    
    showLoading();
    hideError();
    hideTopMovies();
    
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbId}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
            showMovieDetails(data);
        } else {
            showError('Movie not found with this IMDb ID.');
            showTopMovies();
        }
    } catch (err) {
        showError('Failed to search movie. Please try again.');
        showTopMovies();
    } finally {
        hideLoading();
    }
}

async function fetchMovieByImdbId(imdbId) {
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbId}&plot=short`;
        const response = await fetch(url);
        return await response.json();
    } catch (err) {
        return null;
    }
}

function showMovieList(movies, title) {
    if (!results) return;
    
    const moviesHTML = movies.map(movie => `
        <div class="movie-card" onclick="getMovieDetails('${movie.imdbID}')">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300/333/fff?text=No+Poster'}" 
                 alt="${movie.Title}" 
                 class="movie-poster"
                 onerror="this.src='https://via.placeholder.com/200x300/333/fff?text=No+Poster'">
            <div class="movie-info">
                <div class="movie-title">${movie.Title}</div>
                <div class="movie-year">${movie.Year}</div>
            </div>
        </div>
    `).join('');
    
    results.innerHTML = `
        <h2 style="color: #00b4d8; margin-bottom: 20px;">${title}</h2>
        <div class="movies-grid">
            ${moviesHTML}
        </div>
    `;
}

async function getMovieDetails(imdbId) {
    showLoading();
    hideError();
    hideTopMovies();
    
    try {
        const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbId}&plot=full`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
            showMovieDetails(data);
        } else {
            showError('Failed to load movie details.');
            showTopMovies();
        }
    } catch (err) {
        showError('Failed to load movie details. Please try again.');
        showTopMovies();
    } finally {
        hideLoading();
    }
}

function showMovieDetails(movie) {
    if (!results) return;
    
    results.innerHTML = `
        <button class="back-btn" onclick="goBackToHome()">← Back to Home</button>
        <div class="movie-details">
            <div class="details-header">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/333/fff?text=No+Poster'}" 
                     alt="${movie.Title}" 
                     class="details-poster"
                     onerror="this.src='https://via.placeholder.com/300x450/333/fff?text=No+Poster'">
                <div class="details-info">
                    <h1 class="details-title">${movie.Title} (${movie.Year})</h1>
                    <div class="details-meta">
                        ${movie.imdbRating && movie.imdbRating !== 'N/A' ? 
                            `<span class="meta-item rating">⭐ ${movie.imdbRating}/10</span>` : ''}
                        <span class="meta-item">${movie.Rated}</span>
                        <span class="meta-item">${movie.Runtime}</span>
                        <span class="meta-item">${movie.Genre}</span>
                    </div>
                    <p class="details-plot">${movie.Plot !== 'N/A' ? movie.Plot : 'No plot available.'}</p>
                </div>
            </div>
            <div class="details-content">
                ${movie.Director && movie.Director !== 'N/A' ? 
                    `<div class="detail-row"><span class="detail-label">Director:</span> ${movie.Director}</div>` : ''}
                ${movie.Actors && movie.Actors !== 'N/A' ? 
                    `<div class="detail-row"><span class="detail-label">Cast:</span> ${movie.Actors}</div>` : ''}
                ${movie.Writer && movie.Writer !== 'N/A' ? 
                    `<div class="detail-row"><span class="detail-label">Writer:</span> ${movie.Writer}</div>` : ''}
                ${movie.Language && movie.Language !== 'N/A' ? 
                    `<div class="detail-row"><span class="detail-label">Language:</span> ${movie.Language}</div>` : ''}
                ${movie.Country && movie.Country !== 'N/A' ? 
                    `<div class="detail-row"><span class="detail-label">Country:</span> ${movie.Country}</div>` : ''}
                ${movie.Released && movie.Released !== 'N/A' ? 
                    `<div class="detail-row"><span class="detail-label">Released:</span> ${movie.Released}</div>` : ''}
                ${movie.BoxOffice && movie.BoxOffice !== 'N/A' ? 
                    `<div class="detail-row"><span class="detail-label">Box Office:</span> ${movie.BoxOffice}</div>` : ''}
            </div>
        </div>
    `;
}

function goBackToHome() {
    showHome();
    showTopMovies();
    if (searchInput) searchInput.value = '';
    if (keywordInput) keywordInput.value = '';
    if (imdbInput) imdbInput.value = '';
}

function showHome() {
    if (!results) return;
    
    results.innerHTML = `
        <div style="text-align: center; padding: 50px; color: #8ecae6;">
            <h2>Welcome to Movie Search</h2>
            <p>Browse top rated movies or use the search boxes to find your favorite movies!</p>
        </div>
    `;
}

function showLoading() {
    if (loading) loading.classList.remove('hidden');
}

function hideLoading() {
    if (loading) loading.classList.add('hidden');
}

function showError(message) {
    if (error) {
        error.textContent = message;
        error.classList.remove('hidden');
    }
}

function hideError() {
    if (error) error.classList.add('hidden');
}