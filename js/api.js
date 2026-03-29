const API_KEY = 'b53e87d6d9e6dd2ea9fd63e73fe99e4c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";


/* GET POPULAR MOVIES */
async function getPopularMovies() {
    const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pl-PL`
    );
    const data = await response.json();
    return data.results;
}


/* SEARCH MOVIES OR SERIES — fixes missing searchContent() bug */
async function searchContent(query, type = "movie") {
    const endpoint = type === "tv" ? "search/tv" : "search/movie";
    const response = await fetch(
        `${BASE_URL}/${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pl-PL`
    );
    const data = await response.json();
    return data.results;
}

/* SEARCH MOVIES (kept for backward compat) */
async function searchMovies(query) {
    return searchContent(query, "movie");
}


/* GET TRAILER — tries Polish first, falls back to English */
async function getTrailer(movieId, type = "movie") {
    const endpoint = type === "tv"
        ? `${BASE_URL}/tv/${movieId}/videos?api_key=${API_KEY}&language=pl-PL`
        : `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=pl-PL`;

    let response = await fetch(endpoint);
    let data = await response.json();

    // Fallback to English if no Polish trailer found
    if (!data.results || data.results.length === 0) {
        const fallback = type === "tv"
            ? `${BASE_URL}/tv/${movieId}/videos?api_key=${API_KEY}&language=en-US`
            : `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`;
        response = await fetch(fallback);
        data = await response.json();
    }

    return data.results || [];
}


/* LOAD POPULAR MOVIES SLIDER */
async function loadPopularMovies() {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pl-PL`);
    const data = await res.json();
    displaySliderMovies(data.results, "popularMovies", "movie");
}

/* LOAD POPULAR SERIES SLIDER */
async function loadPopularSeries() {
    const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pl-PL`);
    const data = await res.json();
    displaySliderMovies(data.results, "popularSeries", "tv");
}
