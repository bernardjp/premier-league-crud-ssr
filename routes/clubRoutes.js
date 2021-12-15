const express = require('express');
const fs = require('fs');
const upload = require('../storage/multer-config');
const { clubListMapper, clubInfoMapper, formDataMapper } = require('../utils/mappers');

const router = express.Router();
const dataPath = { list: './data/equipos.json', club: './data/equipos/' };

// --------- Routes --------- //
router.route('/')
  .get((req, res) => {
    try {
      const clubsData = fs.readFileSync(dataPath.list);
      const clubsList = clubListMapper(JSON.parse(clubsData));

      res.render('clubListPage', {
        layout: 'index',
        data: { clubsList, title: 'PL Clubs list' }
      });
    } catch (err) {
      console.error(err);

      res.status(404).render('clubListPage', {
        layout: 'index',
        data: {
          clubsList: null,
          message: { text: 'Sorry, but the Club List you were trying to view is currently unavailable.' },
          title: 'Information unavailable'
        }
      });
    }
  })
  .delete((req, res) => {
    const { deleteID, deleteTLA } = req.body;
    console.log(`DELETE handler. ID: ${deleteID} / TLA: ${deleteTLA}`);

    deleteFile(dataPath.club, deleteTLA);
    deleteEntry(dataPath.list, deleteID);

    res.end();
  });

router.route('/create')
  .get((req, res) => {
    res.render('clubEditPage', {
      layout: 'index',
      data: { clubInfo: { title: 'NEW CLUB' }, title: 'Create Club Page' }
    });
  })
  .post((req, res) => {
    upload(req, res, err => {
      if (err) {
        console.error(err);

        res.status(400).render('clubEditPage', {
          layout: 'index',
          data: {
            clubInfo: {},
            message: { text: err, type: 'error' },
            title: 'Error uploading files'
          }
        });
      } else {
        const clubListData = JSON.parse(fs.readFileSync(dataPath.list));
        const mappedData = formDataMapper(req.body);

        if (keyDataValidation(clubListData, mappedData)) {
          fs.writeFileSync(`${dataPath.club}${mappedData.tla}.json`, JSON.stringify(mappedData, null, 2));
          createEntry(dataPath.list, mappedData);

          res.redirect(303, `/clubs/${mappedData.tla}`);
        }

        res.status(400).render('clubEditPage', {
          layout: 'index',
          data: {
            clubInfo: {},
            message: { text: 'TLA already in use. Try another combination.', type: 'error' },
            title: 'Error uploading data'
          }
        });
      }
    });
  });

router.route('/:clubTLA')
  .get((req, res) => {
    const { clubTLA } = req.params;

    fs.readFile(`${dataPath.club}${clubTLA}.json`, (err, data) => {
      if (err) {
        console.error(err);
        res.render('clubInfoPage', {
          layout: 'index',
          data: {
            clubInfo: null,
            message: { text: 'Sorry, but the Club you were trying to view does not exist.' },
            title: 'Club not found'
          }
        });
      }

      try {
        const clubInfo = clubInfoMapper(JSON.parse(data));

        res.render('clubInfoPage', {
          layout: 'index',
          data: { clubInfo, title: `${clubInfo.short_name} Page` }
        });
      } catch (error) {
        console.error(error);

        res.status(409).render('clubInfoPage', {
          layout: 'index',
          data: {
            clubInfo: null,
            message: { text: 'Sorry, but the Club data you were trying to view is currently unavailable.' },
            title: 'Information unavailable'
          }
        });
      }
    });
  });

router.route('/:clubTLA/edit')
  .get((req, res) => {
    const { clubTLA } = req.params;

    fs.readFile(`${dataPath.club}${clubTLA}.json`, (err, data) => {
      if (err) {
        console.error(err);

        res.status(404).render('clubInfoPage', {
          layout: 'index',
          data: {
            clubInfo: null,
            message: { text: 'Sorry, but the Club you were trying to view does not exist.' },
            title: 'Club not found'
          }
        });
      }

      try {
        const clubInfo = clubInfoMapper(JSON.parse(data));

        res.render('clubEditPage', {
          layout: 'index',
          data: { clubInfo, title: `${clubInfo.short_name} Edit Page` }
        });
      } catch (error) {
        console.error(error);

        res.status(409).render('clubInfoPage', {
          layout: 'index',
          data: {
            clubInfo: null,
            message: { text: 'Sorry, but the Club data you were trying to view is currently unavailable.' },
            title: 'Information unavailable'
          }
        });
      }
    });
  })
  .post((req, res) => {
    upload(req, res, err => {
      if (err) {
        console.error(err);

        res.status(400).render('clubEditPage', {
          layout: 'index',
          data: {
            clubInfo: {},
            message: { text: err },
            title: 'Error uploading files'
          }
        });
      } else {
        const formData = req.body;
        const originalTLA = req.params.clubTLA;
        const mappedData = formDataMapper(formData);

        updateClubFile(dataPath.club, originalTLA, mappedData);
        updateEntry(dataPath.list, mappedData.id, mappedData);

        res.redirect(303, `/clubs/${mappedData.tla}`);
      }
    });
  });

// --------- Helper functions --------- //
// Deletes file and creates a new one on the "papelera" folder
function deleteFile(path, tla) {
  fs.readFile(`${path}${tla}.json`, (err, data) => {
    if (err) {
      console.error(err);

      res.status(404).render('clubInfoPage', {
        layout: 'index',
        data: {
          clubInfo: null,
          message: { text: 'Sorry, but the Club you were trying to view does not exist.' },
          title: 'Club not found'
        }
      });
    }

    try {
      fs.writeFileSync(`./data/papelera/${tla}.json`, data);
      fs.unlinkSync(`${path}${tla}.json`);
    } catch (error) {
      console.error(error);

      res.status(409).render('clubInfoPage', {
        layout: 'index',
        data: {
          clubInfo: null,
          message: { text: 'Delete request has been canceled. Try again later.' },
          title: 'Delete request failed'
        }
      });
    }
  });
}

// Filters out and deletes the club entry tied to the ID sent.
function deleteEntry(path, id) {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.error(err);

      res.status(404).render('clubInfoPage', {
        layout: 'index',
        data: {
          clubInfo: null,
          message: { text: 'Sorry, but the Club you were trying to view does not exist.' },
          title: 'Club not found'
        }
      });
    }

    try {
      const clubListData = JSON.parse(data);
      const updatedListData = clubListData.filter(club => club.id !== Number(id));

      fs.writeFileSync('./data/equipos.json', JSON.stringify(updatedListData, null, 2));
    } catch (error) {
      console.error(error);

      res.status(409).render('clubInfoPage', {
        layout: 'index',
        data: {
          clubInfo: null,
          message: { text: 'Delete request has been canceled. Try again later.' },
          title: 'Error: delete request failed'
        }
      });
    }
  });
}

// Updates file with new data from the client.
function updateClubFile(path, tla, newData) {
  fs.readFile(`${path}${tla}.json`, (err, data) => {
    if (err) {
      console.error(err);

      res.status(404).render('clubInfoPage', {
        layout: 'index',
        data: { clubInfo: null, title: 'Error: Club not found' }
      });
    }

    try {
      const originalData = JSON.parse(data);

      fs.writeFileSync(`${path}${tla}.json`, JSON.stringify({ ...originalData, ...newData }, null, 2));
      if (originalData.tla !== newData.tla) {
        renameFile(dataPath.club, originalData.tla, newData.tla);
      }

      console.log('Data updated');
    } catch (error) {
      console.error(error);

      res.status(409).render('clubInfoPage', {
        layout: 'index',
        data: { clubInfo: null, title: 'Error: update request failed' }
      });
    }
  });
}

// Updates club entry tied to the ID sent.
function updateEntry(path, id, newData) {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.error(err);

      res.status(404).render('clubInfoPage', {
        layout: 'index',
        data: { clubInfo: null, title: 'Error: Club list not found' }
      });
    }

    try {
      const clubListData = JSON.parse(data);
      const updatedList = clubListData
        .map(club => (club.id === id ? { ...club, ...newData } : club));

      fs.writeFileSync(path, JSON.stringify(updatedList, null, 2));
    } catch (error) {
      console.error(error);

      res.status(409).render('clubInfoPage', {
        layout: 'index',
        data: { clubInfo: null, title: 'Error: update request failed' }
      });
    }
  });
}

// Creates club entry.
function createEntry(path, newData) {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.error(err);

      res.status(404).render('clubInfoPage', {
        layout: 'index',
        data: { clubInfo: null, title: 'Error: Club list not found' }
      });
    }

    try {
      const clubListData = JSON.parse(data);
      clubListData.push(newData);

      fs.writeFileSync(path, JSON.stringify(clubListData, null, 2));
    } catch (error) {
      console.error(error);

      res.status(409).render('clubInfoPage', {
        layout: 'index',
        data: { clubInfo: null, title: 'Error: create request failed' }
      });
    }
  });
}

// Changes file name.
function renameFile(path, originalName, newName) {
  const oldPath = `${path}${originalName}.json`;
  const newPath = `${path}${newName}.json`;

  fs.renameSync(oldPath, newPath);
}

// Filetype (mime and extension) validation for Multer (jpg, jpeg, png).
// function fileFilter(file, cb) {
//   const allowedFileTypes = /jpg|jpeg|png/;
//   const extensionType = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimeType = allowedFileTypes.test(file.mimetype);

//   if (extensionType && mimeType) {
//     return cb(null, true);
//   }
//   return cb('The crest image must be a JPG, JPEG, or PNG file up to 1.5mb.');
// }

function keyDataValidation(dbData, clientData) {
  const isTlaValid = dbData.every(club => club.tla !== clientData.tla);
  const isIdValid = dbData.every(club => club.id !== clientData.id);

  return (isTlaValid && isIdValid);
}

module.exports = router;
