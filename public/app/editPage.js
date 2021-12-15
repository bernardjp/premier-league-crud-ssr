import validateFormData from './validations.js';

const clubForm = document.getElementById('club-form');
const clubCrestInput = document.getElementById('club-crest');
const uploadPath = '/assets/uploads/';

clubForm.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(clubForm);
  const updateTime = new Date().toISOString();
  const clubID = e.target.dataset.id || new Date().getTime();
  const crestOriginalUrl = clubCrestInput.dataset.url;
  const crestFileName = clubCrestInput.value.split('\\').pop();

  formData.append('id', clubID);
  formData.append('last_update', updateTime);

  /* If there is an URL/file associated with the club AND no file
  is uploaded then returns the original URL/file
  if there is not an URL/file associated BUT a new file is
  uploaded then the new file is append to the form */
  if (crestOriginalUrl && !crestFileName) {
    formData.append('crestUrl', crestOriginalUrl);
  } else if (!crestOriginalUrl && !crestFileName) {
    formData.append('crestUrl', '/assets/Premier_League_Isologo.png');
  } else {
    formData.append('crestUrl', `${uploadPath}${crestFileName}`);
  }

  const dataForValidation = formDataMapper(formData);
  const isValidated = validateFormData(dataForValidation);

  if (isValidated) {
    localStorage.setItem('formData', JSON.stringify(dataForValidation));

    fetch(location.pathname, {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (res.redirected) {
          document.location.href = res.url;
        // localStorage.removeItem('formData');
        } else {
          res.text().then(html => {
            document.write(html);
            refillForm();
          });
        }
      });
  } else {
    document.querySelector('.msg-container').style.display = 'flex';
    document.querySelector('.error-msg').textContent = 'Check for empty required inputs. The crest image must be a JPG, JPEG, or PNG file up to 1.5mb.';
  }
});

// --- Helper functions ---
function formDataMapper(formData) {
  let data = {};
  for (const key of formData.keys()) {
    let inputData = formData.get(key);
    if (key !== 'club_crest') inputData = inputData.trim();
    data = { ...data, [key]: inputData };
  }
  return data;
}

function refillForm() {
  const inputs = document.querySelectorAll('.input-container input');
  const form = document.querySelector('#club-form');
  const dataLocalStorage = JSON.parse(localStorage.getItem('formData'));

  inputs.forEach(input => {
    if (input.name !== 'club_crest') {
      // eslint-disable-next-line no-param-reassign
      input.value = dataLocalStorage[input.name];
    }
  });

  form.dataset.id = dataLocalStorage.id;
  form.dataset.tla = dataLocalStorage.tla;

  // localStorage.removeItem('formData');
}
