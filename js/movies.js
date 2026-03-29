const moviesContainer = document.getElementById("moviesContainer");
const searchInput = document.getElementById("searchInput");
const carouselInner = document.getElementById("carouselInner");
const typeFilter = document.getElementById("typeFilter");
const yearFilter = document.getElementById("yearFilter");
const ratingFilter = document.getElementById("ratingFilter");
const clearBtn = document.getElementById("clearBtn");

const popularMoviesSection = document.getElementById("popularMovies").parentElement.parentElement;
const popularSeriesSection = document.getElementById("popularSeries").parentElement.parentElement;

searchInput.addEventListener("keyup", searchWithFilters);
typeFilter.addEventListener("change", searchWithFilters);
yearFilter.addEventListener("change", searchWithFilters);
ratingFilter.addEventListener("change", searchWithFilters);


/* LOAD MOVIES (carousel) */
async function loadMovies() {
    const movies = await getPopularMovies();
    displayCarousel(movies);
}
loadMovies();
loadPopularMovies();
loadPopularSeries();


/* DISPLAY CAROUSEL */
function displayCarousel(movies) {
    carouselInner.innerHTML = "";
    movies.slice(0, 5).forEach((movie, index) => {
        const activeClass = index === 0 ? "active" : "";
        carouselInner.innerHTML += `
            <div class="carousel-item ${activeClass}">
                <div class="ratio ratio-16x9">
                    <img
                        src="https://image.tmdb.org/t/p/original${movie.backdrop_path}"
                        class="carousel-img d-block w-100"
                        alt="${movie.title || movie.name}"
                        onclick="openTrailer(${movie.id}, 'movie')"
                        style="cursor:pointer;"
                    >
                </div>
                <div class="carousel-caption d-none d-md-block">
                    <h5>${movie.title || movie.name}</h5>
                    <p>⭐ ${movie.vote_average.toFixed(1)} / 10</p>
                </div>
            </div>
        `;
    });
}


/* DISPLAY GRID MOVIES */
function displayMovies(movies, type = "movie") {
    moviesContainer.innerHTML = "";

    if (movies.length === 0) {
        moviesContainer.innerHTML = `
            <div class="col-12 text-center text-white py-5">
                <i class="bi bi-film fs-1 d-block mb-3 opacity-50"></i>
                <p class="fs-5 opacity-75">Nie znaleziono wyników. Spróbuj innego wyszukiwania.</p>
            </div>
        `;
        return;
    }

    movies.forEach(movie => {
        const poster = movie.poster_path
            ? IMAGE_URL + movie.poster_path
            : "https://via.placeholder.com/500x750?text=Brak+plakatu";

        moviesContainer.innerHTML += `
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="card h-100 bg-dark text-white shadow movie-card">
                    <img
                        src="${poster}"
                        class="card-img-top"
                        style="height:300px;object-fit:cover;cursor:pointer;"
                        alt="${movie.title || movie.name}"
                        onclick="openTrailer(${movie.id}, '${type}')"
                    >
                    <div class="card-body">
                        <h5 class="card-title">${movie.title || movie.name}</h5>
                        <p class="card-text">
                            ⭐ Rating: ${movie.vote_average.toFixed(1)} / 10<br>
                            📅 Release: ${movie.release_date || movie.first_air_date || "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        `;
    });
}


/* DISPLAY SLIDER */
function displaySliderMovies(movies, containerId, type = "movie") {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    movies.forEach(movie => {
        const poster = movie.poster_path
            ? IMAGE_URL + movie.poster_path
            : "https://via.placeholder.com/200x300?text=N/A";

        container.innerHTML += `
            <div class="slider-card">
                <img
                    src="${poster}"
                    alt="${movie.title || movie.name}"
                    onclick="openTrailer(${movie.id}, '${type}')"
                    title="${movie.title || movie.name}"
                >
            </div>
        `;
    });
}


/* SCROLL SLIDER */
function scrollSlider(id, direction) {
    const slider = document.getElementById(id);
    slider.scrollBy({ left: direction * 400, behavior: "smooth" });
}


/* SEARCH WITH FILTERS */
async function searchWithFilters() {
    const query = searchInput.value.trim();
    const type = typeFilter.value;      // "movie" or "tv"
    const year = yearFilter.value;
    const rating = ratingFilter.value;

    if (query.length < 2) {
        moviesContainer.innerHTML = "";
        return;
    }

    let results = await searchContent(query, type);

    if (year) {
        results = results.filter(item => {
            const date = item.release_date || item.first_air_date;
            return date && date.startsWith(year);
        });
    }

    if (rating) {
        results = results.filter(item => item.vote_average >= parseFloat(rating));
    }

    displayMovies(results, type);
}


/* CLEAR BUTTON */
searchInput.addEventListener("input", () => {
    clearBtn.style.display = searchInput.value.length > 0 ? "block" : "none";
});

clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
    moviesContainer.innerHTML = "";
});


/* NAVIGATE TO DETAIL PAGE */
function openTrailer(id, type = "movie") {
    window.location.href = `movie.html?id=${id}&type=${type}`;
}
