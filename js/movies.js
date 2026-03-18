const moviesContainer = document.getElementById("moviesContainer");
const searchInput = document.getElementById("searchInput");
const carouselInner = document.getElementById("carouselInner");
const typeFilter = document.getElementById("typeFilter");
const yearFilter = document.getElementById("yearFilter");
const ratingFilter = document.getElementById("ratingFilter");

searchInput.addEventListener("keyup", searchWithFilters);
typeFilter.addEventListener("change", searchWithFilters);
yearFilter.addEventListener("change", searchWithFilters);
ratingFilter.addEventListener("change", searchWithFilters);

/* LOAD MOVIES */
async function loadMovies(){
    const movies = await getPopularMovies();
    displayCarousel(movies);
}
loadMovies();

// Додаємо популярні слайдери
loadPopularMovies();
loadPopularSeries();

/* DISPLAY CAROUSEL */
function displayCarousel(movies){
    carouselInner.innerHTML = "";
    movies.slice(0,5).forEach((movie,index)=>{
        const activeClass = index === 0 ? "active" : "";
        const carouselHTML = `
            <div class="carousel-item ${activeClass}">
                <div class="ratio ratio-16x9">    
                    <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" class="carousel-img d-block w-100" onclick="openTrailer(${movie.id})">
                </div>
            </div>
        `;
        carouselInner.innerHTML += carouselHTML;
    });
}

/* DISPLAY GRID MOVIES */
function displayMovies(movies){
    moviesContainer.innerHTML = "";
    movies.forEach(movie => {
        const movieHTML = `
           
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="card h-100 bg-dark text-white shadow movie-card">
                    <img src="${IMAGE_URL + movie.poster_path}" class="card-img-top h-100" onclick="openTrailer(${movie.id})">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title || movie.name}</h5>
                        <p class="card-text">
                            ⭐ Rating: ${movie.vote_average.toFixed(1)} / 10<br>
                            📅 Release: ${movie.release_date}
                        </p>
                    </div>
                </div>
            </div>
            `;
        moviesContainer.innerHTML += movieHTML;
    });
}

/* DISPLAY SLIDER */
function displaySliderMovies(movies, containerId){
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    movies.forEach(movie => {
        const movieHTML = `
            <div class="slider-card">
                <img src="${IMAGE_URL + movie.poster_path}" onclick="openTrailer(${movie.id})">
            </div>
        `;
        container.innerHTML += movieHTML;
    });
}

/* SCROLL SLIDER */
function scrollSlider(id, direction){
    const slider = document.getElementById(id);
    slider.scrollBy({
        left: direction * 400,
        behavior: "smooth"
    });
}

/* SEARCH */
async function searchWithFilters(){

    const query = searchInput.value;
    const type = typeFilter.value;
    const year = yearFilter.value;  
    const rating = ratingFilter.value;

    if(query.length < 2) return;

    let results = await searchContent(query, type);

    if(year){
        results = results.filter(item => {
            const date = item.release_date || item.first_air_date;
            return date && date.startsWith(year);
        });
    }

    if(rating){
        results = results.filter(item => item.vote_average >= rating);
    }

    displayMovies(results);

}

/* OPEN TRAILER */
async function openTrailer(movieId){
    const videos = await getTrailer(movieId);
    const trailer = videos.find(video => video.type === "Trailer");
    if(!trailer) return;
    const frame = document.getElementById("trailerFrame");
    frame.src = `https://www.youtube.com/embed/${trailer.key}`;
    const modal = new bootstrap.Modal(document.getElementById("trailerModal"));
    modal.show();
}