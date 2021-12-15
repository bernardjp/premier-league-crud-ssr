const fs = require('fs');
const upload = require('../storage/multer-config');
const db = require('../storage/dbActions');
const { clubListMapper, clubInfoMapper, formDataMapper } = require('../utils/mappers');
const { keyDataValidation } = require('../utils/validations');

const dataPath = { list: './data/equipos.json', club: './data/equipos/' };

function getCreateClubPage(req, res) {
  res.render('clubEditPage', {
    layout: 'index',
    data: { clubInfo: { title: 'NEW CLUB' }, title: 'Create Club Page' }
  });
}

function getUpdateClubPage(req, res) {
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
}

function getClubList(req, res) {
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
}

function getClub(req, res) {
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
}

function deleteClub(req, res) {
  const { deleteID, deleteTLA } = req.body;
  console.log(`DELETE handler. ID: ${deleteID} / TLA: ${deleteTLA}`);

  db.deleteFile(dataPath.club, deleteTLA);
  db.deleteEntry(dataPath.list, deleteID);

  res.end();
}

function createClub(req, res) {
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
        db.createClubFile(dataPath.club, mappedData);
        db.createEntry(dataPath.list, mappedData);

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
}

function updateClub(req, res) {
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

      db.updateClubFile(dataPath.club, originalTLA, mappedData);
      db.updateEntry(dataPath.list, mappedData.id, mappedData);

      res.redirect(303, `/clubs/${mappedData.tla}`);
    }
  });
}

module.exports = {
  getCreateClubPage,
  getUpdateClubPage,
  getClubList,
  getClub,
  deleteClub,
  createClub,
  updateClub
};
