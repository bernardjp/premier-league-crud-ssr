const fs = require('fs');

const dataPath = { list: './data/equipos.json', club: './data/equipos/' };

function createClubFile(path, data) {
  fs.writeFileSync(`${path}${data.tla}.json`, JSON.stringify(data, null, 2));
}

function deleteClubFile(path, tla, res) {
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

function updateClubFile(path, tla, newData, res) {
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

function deleteEntry(path, id, res) {
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

function updateEntry(path, id, newData, res) {
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

function createEntry(path, newData, res) {
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

function renameFile(path, originalName, newName) {
  const oldPath = `${path}${originalName}.json`;
  const newPath = `${path}${newName}.json`;

  fs.renameSync(oldPath, newPath);
}

module.exports = {
  createClubFile,
  deleteClubFile,
  updateClubFile,
  createEntry,
  deleteEntry,
  updateEntry
};
