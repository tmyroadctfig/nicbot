const _ = require('underscore');
const fetch = require('node-fetch');
const moment = require('moment');

exports.WEATHER_STATIONS = {
  bellambi: 'http://www.bom.gov.au/fwo/IDN60801/IDN60801.94749.json'
};

exports.reportObservations = async function(station = 'bellambi') {
  const url = exports.WEATHER_STATIONS[station];

  return fetch(url, {
    method: 'get'
  })
    .then(response => response.json())
    .then(jsonData => {
      const latestEntry = jsonData.observations.data[0];
      const latestTime = moment(latestEntry.local_date_time_full, "YYYYMMDDHHmmss");

      // Filter down to last 24 hours
      const data = _.filter(jsonData.observations.data, entry => {
        const entryTime = moment(entry.local_date_time_full, "YYYYMMDDHHmmss");
        const duration = moment.duration(latestTime.diff(entryTime))
        return duration.asDays() < 1
      });

      // Grab the max stats
      const maxWind = _.max(data, entry => entry.wind_spd_kmh);
      const maxGust = _.max(data, entry => entry.gust_kmh);
      const rain = _.max(data, entry => entry.rain_trace);

      return {
        latestEntry: latestEntry,
        latestTime: latestTime,
        maxWind: {
          date: moment(maxWind.local_date_time_full, "YYYYMMDDHHmmss"),
          direction: maxGust.wind_dir,
          windSpdKmh: maxWind.wind_spd_kmh
        },
        maxGust: {
          date: moment(maxGust.local_date_time_full, "YYYYMMDDHHmmss"),
          direction: maxGust.wind_dir,
          gustKmh: maxGust.gust_kmh

        },
        rain: {
          date: moment(rain.local_date_time_full, "YYYYMMDDHHmmss"),
          rain: rain.rain_trace
        }
      }
    })
};
