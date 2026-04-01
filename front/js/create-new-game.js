const searchInput = document.getElementById('igdb-title');
const searchButton = document.getElementById('igdb-search-button');
const resultsContainer = document.getElementById('igdb-results');

const form = document.getElementById('create-game-form');

const fillFormWithGame = (game) => {
    form.elements.title.value = game.title || '';
    form.elements.genre.value = game.genre || '';
    form.elements.release_year.value = game.release_year || '';
    form.elements.developer.value = game.developer || '';
    form.elements.description.value = game.description || '';
    form.elements.imageURL.value = game.imageURL || '';
    form.elements.trailerYoutubeId.value = game.trailerYoutubeId || '';
    form.elements.bannerURL.value = game.bannerURL || '';
};

const renderResults = (games) => {
    resultsContainer.innerHTML = '';

    if (!games.length) {
        resultsContainer.innerHTML = '<p>Нічого не знайдено в IGDB.</p>';
        return;
    }

    games.forEach((game) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn';
        button.style.marginRight = '8px';
        button.style.marginBottom = '8px';
        button.textContent = `${game.title} (${game.release_year})`;
        button.addEventListener('click', () => fillFormWithGame(game));
        resultsContainer.appendChild(button);
    });
};

searchButton?.addEventListener('click', async () => {
    const title = searchInput.value.trim();
    if (title.length < 3) {
        resultsContainer.innerHTML = '<p>Введіть щонайменше 3 символи.</p>';
        return;
    }

    resultsContainer.innerHTML = '<p>Пошук в IGDB...</p>';

    try {
        const response = await fetch(`/games/igdb/search?title=${encodeURIComponent(title)}`);
        const data = await response.json();

        if (!response.ok) {
            resultsContainer.innerHTML = `<p>${data.error || 'Не вдалося отримати дані з IGDB.'}</p>`;
            return;
        }

        renderResults(data);
    } catch {
        resultsContainer.innerHTML = '<p>Помилка підключення до сервера.</p>';
    }
});