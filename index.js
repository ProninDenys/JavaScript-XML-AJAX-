document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const title = document.getElementById('title').value;
    const type = document.getElementById('type').value;

    // поиск с первой страницы
    searchMovies(title, type, 1);
});

function searchMovies(title, type, page) {
    const apiKey = '3332b235'; 
    const url = `http://www.omdbapi.com/?s=${encodeURIComponent(title)}&type=${type}&page=${page}&apikey=${apiKey}`;

    //  AJAX-запрос
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            displayResults(data, title, type, page);
        } else {
            console.error('Request failed. Status:', xhr.status);
        }
    };
    xhr.send();
}

function displayResults(data, title, type, currentPage) {
    const resultsDiv = document.getElementById('results');
    const paginationDiv = document.getElementById('pagination');
    
    resultsDiv.innerHTML = '';
    paginationDiv.innerHTML = '';

    if (data.Response === 'True') {
        // список фильмов
        data.Search.forEach(item => {
            const movieDiv = document.createElement('div');
            movieDiv.className = 'movie-card'; 
            movieDiv.innerHTML = `
                <h2>${item.Title} (${item.Year})</h2>
                <p>Type: ${item.Type}</p>
                <button onclick="toggleMovieDetails('${item.imdbID}', this)">Details</button>
                <div class="movie-details" style="display: none;"></div>`; 
            resultsDiv.appendChild(movieDiv);
        });

        // пагинация
        const totalResults = parseInt(data.totalResults);
        const totalPages = Math.ceil(totalResults / 10);
        const maxVisiblePages = 5;
        const pageNumbers = [];

        // диапазон страниц для отображения
        let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
        let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(endPage - maxVisiblePages + 1, 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (startPage > 1) {
            pageNumbers.unshift(1);
            pageNumbers.splice(1, 0, '...');
        }

        if (endPage < totalPages) {
            pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }

        // кнопки страниц
        pageNumbers.forEach(page => {
            const pageButton = document.createElement('button');
            pageButton.textContent = page;
            if (page === currentPage) {
                pageButton.disabled = true;
            }
            if (page === '...') {
                pageButton.disabled = true;
            } else {
                pageButton.addEventListener('click', function() {
                    searchMovies(title, type, page);
                });
            }
            paginationDiv.appendChild(pageButton);
        });
    } else {
        resultsDiv.innerHTML = '<p>Movie not found!</p>';
    }
}

function toggleMovieDetails(imdbID, buttonElement) {
    const detailsDiv = buttonElement.nextElementSibling;

    if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
        getMovieDetails(imdbID, detailsDiv);
        detailsDiv.style.display = 'block';
        buttonElement.textContent = 'Hide Details';
    } else {
        detailsDiv.style.display = 'none';
        buttonElement.textContent = 'Details';
    }
}

function getMovieDetails(imdbID, detailsDiv) {
    const apiKey = '3332b235'; 
    const url = `http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

    // AJAX-запрос для получения деталей фильма
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            displayMovieDetails(data, detailsDiv);
        } else {
            console.error('Request failed. Status:', xhr.status);
        }
    };
    xhr.send();
}

function displayMovieDetails(data, detailsDiv) {
    detailsDiv.innerHTML = `
        <h2>${data.Title} (${data.Year})</h2>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Director:</strong> ${data.Director}</p>
        <p><strong>Actors:</strong> ${data.Actors}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
        <img src="${data.Poster !== "N/A" ? data.Poster : ''}" alt="Poster">
    `;
}
