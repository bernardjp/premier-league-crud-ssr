const clubListMapper = list => {
  const mappedList = list.map(club => ({
    full_name: club.name,
    id: club.id,
    crestUrl: club.crestUrl,
    tla: club.tla,
    website: club.website,
    last_update: new Date(club.lastUpdated).toLocaleDateString()
  }));

  return mappedList;
};

const playerInfoMapper = player => ({
  id: player.id,
  full_name: player.name,
  position: player.position || 'Coaching',
  date_of_birth: new Date(player.dateOfBirth).toLocaleDateString(),
  country_of_birth: player.countryOfBirth,
  nationality: player.nationality,
  number: player.shirtNumber || 'n/a',
  role: player.role.toLowerCase()
});

const clubInfoMapper = data => ({
  colors: data.clubColors || "Club's colors not provided",
  crestUrl: data.crestUrl || 'Crest image not provided',
  email: data.email,
  founding_year: data.founded,
  full_name: data.name,
  id: data.id,
  last_update: new Date(data.lastUpdated).toLocaleString(),
  short_name: data.shortName,
  tla: data.tla,
  venue_address: data.address || 'Address not provided',
  venue_name: data.venue || 'Venue name not provided',
  venue_phone: data.phone || 'Phone not provided.',
  website: data.website,
  squad: data?.squad?.map(player => playerInfoMapper(player)) || [],
  gmapsUrl: `https://www.google.com/maps/search/?api=1&query=${getUrlEscapedAddress(data.venue)}`
});

const formDataMapper = formData => ({
  address: formData.venue_address || null,
  clubColors: formData.colors || null,
  crestUrl: formData.crestUrl,
  email: formData.email || null,
  founded: Number(formData.founding_year) || null,
  id: Number(formData.id),
  lastUpdated: formData.last_update,
  name: formData.full_name,
  phone: formData.venue_phone || null,
  shortName: formData.short_name,
  tla: formData.tla.toUpperCase(),
  venue: formData.venue_name || null,
  website: formData.website
});

function getUrlEscapedAddress(string) {
  const newString = string.trim().toLowerCase().split(' ');
  newString.push('stadium');
  return newString.join('+');
}

module.exports = { clubListMapper, clubInfoMapper, formDataMapper };
