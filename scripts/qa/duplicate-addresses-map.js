'use strict';

import R from 'ramda';

module.exports = function(data, tile, writeData, done) {
  let matches = {};
  let fc = data.osm.data;
  if (fc && fc.features) {
    fc.features.forEach((feature) => {
      if ('addr:street' in feature.properties && 'addr:housenumber' in feature.properties) {
        var key = `${feature.properties['addr:housenumber']}|${feature.properties['addr:street']}`;
        var id = feature.properties.osm_id;
        if (matches[key] === undefined) {
          matches[key] = [];
        }
        matches[key].push(id);
      }
    });
  }
  done(null, matches);
}
