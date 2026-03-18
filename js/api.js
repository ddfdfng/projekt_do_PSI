const API_KEY = 'b53e87d6d9e6dd2ea9fd63e73fe99e4c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";


/* GET POPULAR MOVIES */

async function getPopularMovies(){

    const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pl-PL`
    );

    const data = await response.json();

    return data.results;

}


/* SEARCH MOVIES */

async function searchMovies(query){

    const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=pl-PL`
    );

    const data = await response.json();

    return data.results;

}


/* GET TRAILER */

async function getTrailer(movieId){

    const response = await fetch(
        `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=pl-PL`
    );

    const data = await response.json();

    return data.results;

}

async function loadPopularMovies(){

    const res = await fetch(BASE_URL + "/movie/popular?api_key=" + API_KEY);

    const data = await res.json();

    displaySliderMovies(data.results, "popularMovies");

}

async function loadPopularSeries(){

    const res = await fetch(BASE_URL + "/tv/popular?api_key=" + API_KEY);

    const data = await res.json();

    displaySliderMovies(data.results, "popularSeries");

}