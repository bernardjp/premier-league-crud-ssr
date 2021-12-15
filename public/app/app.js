const btnContainers = document.querySelectorAll('.btn-container');
const modalWindow = document.querySelector('.modal-window');

btnContainers.forEach(container => container.addEventListener('click', e => {
  const btn = e.target.parentElement;

  if (btn.classList.contains('delete-btn')) {
    modalWindow.style.display = 'flex';
    modalWindow.dataset.id = container.dataset.id;
    modalWindow.dataset.tla = container.dataset.tla;
  }

  if (btn.classList.contains('edit-btn')) {
    location.href = `/clubs/${container.dataset.tla}/edit`;
  }
}));

modalWindow.addEventListener('click', e => {
  if (e.target.id === 'modal-yes-btn') {
    fetch('/clubs', {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        deleteID: modalWindow.dataset.id,
        deleteTLA: modalWindow.dataset.tla
      })
    })
      .then(() => location.replace('http://localhost:3000/clubs'))
      .catch(err => console.error(err));
  }

  if (e.target.className === 'modal-btn') {
    modalWindow.style.display = 'none';
  }
});
