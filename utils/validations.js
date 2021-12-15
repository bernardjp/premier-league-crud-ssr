function keyDataValidation(dbData, clientData) {
  const isTlaValid = dbData.every(club => club.tla !== clientData.tla);
  const isIdValid = dbData.every(club => club.id !== clientData.id);

  return (isTlaValid && isIdValid);
}

module.exports = keyDataValidation;
