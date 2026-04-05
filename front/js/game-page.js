function showEditForm(id, rating, text, gameId) {
  const bodyDiv = document.getElementById('review-body-' + id);
  bodyDiv.innerHTML = `
    <form action="/review/${id}?_method=PUT" method="POST" class="inline-edit-form">
        <input type="hidden" name="returnTo" value="/games/${gameId}">  
        <label>Оцінка (1-10): <input type="number" name="rating" min="1" max="10" value="${rating}" required style="width:40px"></label><br>
        <label>Відгук:<br>
        <textarea name="text" rows="2" cols="38">${text ? text.replace(/"/g, '&quot;') : ''}</textarea>
        </label><br>
        <button type="submit" class="btn save-btn">Зберегти</button>
        <button type="button" class="btn cancel-btn" onclick="cancelEdit('${id}', \`${text ? text.replace(/`/g, '\\`') : ''}\`)">Скасувати</button>
    </form>`;
}
function cancelEdit(id, text) {
  const bodyDiv = document.getElementById('review-body-' + id);
  bodyDiv.innerHTML = `<span class="review-text">${text || "(Без тексту)"}</span>`;
}