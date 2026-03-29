
const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
const mediaType = params.get("type") || "movie";

// Redirect home if no ID in URL
if (!movieId) {
    window.location.href = "index.html";
}


/* ===== LOAD ALL DATA ===== */
async function loadDetail() {
    try {
        // Fetch details, credits, videos and similar titles all at once
        const [detailRes, creditsRes, videosRes, similarRes] = await Promise.all([
            fetch(`${BASE_URL}/${mediaType}/${movieId}?api_key=${API_KEY}&language=pl-PL`),
            fetch(`${BASE_URL}/${mediaType}/${movieId}/credits?api_key=${API_KEY}&language=pl-PL`),
            fetch(`${BASE_URL}/${mediaType}/${movieId}/videos?api_key=${API_KEY}&language=pl-PL`),
            fetch(`${BASE_URL}/${mediaType}/${movieId}/similar?api_key=${API_KEY}&language=pl-PL`)
        ]);

        let detail = await detailRes.json();
        const credits = await creditsRes.json();
        let videos = await videosRes.json();
        const similar = await similarRes.json();

        // Fallback to English if Polish overview is missing
        if (!detail.overview || detail.overview.length < 10) {
            const enRes = await fetch(`${BASE_URL}/${mediaType}/${movieId}?api_key=${API_KEY}&language=en-US`);
            detail = await enRes.json();
        }

        // Fallback to English if no Polish videos
        if (!videos.results || videos.results.length === 0) {
            const enVid = await fetch(`${BASE_URL}/${mediaType}/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
            videos = await enVid.json();
        }

        renderPage(detail, credits, videos.results || [], similar.results || []);

    } catch (err) {
        console.error(err);
        document.getElementById("loadingSpinner").innerHTML = `
            <div class="text-center text-white">
                <i class="bi bi-exclamation-triangle fs-1 text-warning d-block mb-3"></i>
                <p>Nie udało się załadować danych.
                   <a href="index.html" class="text-warning">Wróć do strony głównej.</a>
                </p>
            </div>
        `;
    }
}


/* ===== RENDER PAGE ===== */
function renderPage(detail, credits, videos, similar) {
    const title    = detail.title || detail.name || "Brak tytułu";
    const overview = detail.overview || "Brak opisu.";
    const poster   = detail.poster_path
        ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
        : "https://via.placeholder.com/220x330?text=Brak+plakatu";
    const backdrop = detail.backdrop_path
        ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}`
        : "";
    const rating  = detail.vote_average ? detail.vote_average.toFixed(1) : "N/A";
    const year    = (detail.release_date || detail.first_air_date || "").slice(0, 4);
    const runtime = detail.runtime
        ? `${detail.runtime} min`
        : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} min / odcinek` : null);
    const tagline = detail.tagline || "";

    // Browser tab title
    document.title = `${title} – OceanTrailerów`;

    // Hero backdrop image
    if (backdrop) {
        document.getElementById("heroSection").style.backgroundImage = `url(${backdrop})`;
    }

    // Poster
    document.getElementById("posterImg").src = poster;
    document.getElementById("posterImg").alt = title;

    // Title & tagline
    document.getElementById("movieTitle").textContent    = title;
    document.getElementById("movieTagline").textContent  = tagline;

    // Overview
    document.getElementById("movieOverview").textContent = overview;

    // Genre badges
    const genreDiv = document.getElementById("genreBadges");
    (detail.genres || []).forEach(g => {
        genreDiv.innerHTML += `<span class="genre-badge">${g.name}</span>`;
    });

    // Stat pills
    const statsDiv = document.getElementById("statsRow");
    statsDiv.innerHTML = `
        <div class="stat-pill">⭐ <span>${rating}</span> / 10</div>
        ${year    ? `<div class="stat-pill">📅 <span>${year}</span></div>`    : ""}
        ${runtime ? `<div class="stat-pill">⏱ <span>${runtime}</span></div>` : ""}
        ${detail.vote_count
            ? `<div class="stat-pill">🗳 <span>${detail.vote_count.toLocaleString()}</span> głosów</div>`
            : ""}
    `;

    // Details table
    const director = (credits.crew || []).find(p => p.job === "Director");
    const creator  = (detail.created_by || [])[0];
    const rows = [
        ["Tytuł oryginalny", detail.original_title || detail.original_name],
        ["Reżyser",          director ? director.name : (creator ? creator.name : null)],
        ["Status",           detail.status],
        ["Język oryginalny", detail.original_language?.toUpperCase()],
        ["Budżet",           detail.budget  ? `$${detail.budget.toLocaleString()}`  : null],
        ["Przychód",         detail.revenue ? `$${detail.revenue.toLocaleString()}` : null],
        ["Sezony",           detail.number_of_seasons  ? `${detail.number_of_seasons} sezonów`   : null],
        ["Odcinki",          detail.number_of_episodes ? `${detail.number_of_episodes} odcinków` : null],
    ];
    const table = document.getElementById("detailsTable");
    rows.forEach(([label, value]) => {
        if (!value) return;
        table.innerHTML += `
            <tr>
                <td class="text-secondary fw-semibold" style="width:45%">${label}</td>
                <td class="text-white">${value}</td>
            </tr>
        `;
    });

    // Production companies
    const companies = detail.production_companies || [];
    if (companies.length > 0) {
        document.getElementById("productionSection").style.display = "block";
        const prodDiv = document.getElementById("productionCompanies");
        companies.forEach(c => {
            prodDiv.innerHTML += c.logo_path
                ? `<div class="text-center">
                       <img src="https://image.tmdb.org/t/p/w200${c.logo_path}"
                            alt="${c.name}"
                            style="height:40px;object-fit:contain;filter:brightness(0) invert(1);opacity:0.7;">
                       <p class="text-secondary mt-1" style="font-size:0.72rem;">${c.name}</p>
                   </div>`
                : `<span class="text-secondary small">${c.name}</span>`;
        });
    }

    // Trailer
    const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube")
                 || videos.find(v => v.site === "YouTube");
    if (trailer) {
        document.getElementById("trailerSection").style.display = "block";
        document.getElementById("trailerFrame").src = `https://www.youtube.com/embed/${trailer.key}`;
    }

    // Cast
    const cast = (credits.cast || []).slice(0, 20);
    if (cast.length > 0) {
        document.getElementById("castSection").style.display = "block";
        const castDiv = document.getElementById("castContainer");
        cast.forEach(actor => {
            const photo = actor.profile_path
                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                : "https://via.placeholder.com/120x150?text=?";
            castDiv.innerHTML += `
                <div class="cast-card">
                    <img src="${photo}" alt="${actor.name}">
                    <div class="cast-info">
                        <strong>${actor.name}</strong>
                        ${actor.character}
                    </div>
                </div>
            `;
        });
    }

    // Similar titles
    const filteredSimilar = similar.filter(m => m.poster_path).slice(0, 15);
    if (filteredSimilar.length > 0) {
        document.getElementById("similarSection").style.display = "block";
        document.getElementById("similarTitle").textContent =
            mediaType === "tv" ? "📺 Podobne seriale" : "🍿 Podobne filmy";
        const simDiv = document.getElementById("similarContainer");
        filteredSimilar.forEach(m => {
            const simTitle = m.title || m.name;
            simDiv.innerHTML += `
                <div class="similar-card"
                     onclick="window.location.href='movie.html?id=${m.id}&type=${mediaType}'">
                    <img src="https://image.tmdb.org/t/p/w300${m.poster_path}" alt="${simTitle}">
                    <p>${simTitle}</p>
                </div>
            `;
        });
    }

    // Show page content, hide spinner
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("pageContent").style.display   = "block";
}


/* ===== BACK TO TOP ===== */
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
    backToTop.classList.toggle("show", window.scrollY > 300);
});
backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});


// Kick everything off
loadDetail();
