const validateFile = file => {
  const validExt = ['jpg', 'jpeg', 'png'];
  const validSize = 1500000; // 1.5mb~ (1.47mb)

  if (!file) return true;

  const fileExt = file.name.split('.').pop();
  const fileSize = file.size;

  return (validExt.includes(fileExt) && fileSize <= validSize);
};

const validateName = name => /^[a-zA-Z0-9&?\s]{1,50}$/.test(name);

const validateTLA = tla => /^[a-zA-Z]{3}$/.test(tla);

const validateYear = year => {
  if (/^[-?0-9]*$/.test(year)) {
    const currentYear = new Date().getFullYear();
    return (Number(year) <= currentYear);
  }
  return false;
};

const validateEmail = email => {
  if (email.length === 0) return true;
  if (email.length <= 254) return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
  return false;
};

const validateWebsite = websiteURL => {
  if (websiteURL.length <= 2000) return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(websiteURL);
  return false;
};

const validateFormData = formData => (
  validateFile(formData.club_crest)
    && validateName(formData.full_name)
    && validateName(formData.short_name)
    && validateTLA(formData.tla)
    && validateYear(formData.founding_year)
    && validateEmail(formData.email)
    && validateWebsite(formData.website)
);

export default validateFormData;
