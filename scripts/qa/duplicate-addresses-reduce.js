'use strict';

import tileReduce from 'tile-reduce';
import path from 'path';
import R from 'ramda';

let totalMatches = {};

tileReduce({
  zoom: 14,
  map: path.join(__dirname, '/duplicate-addresses-map.js'),
  sources: [{
    name: 'osm',
    mbtiles: path.join(__dirname, '../../mbtiles/austin.mbtiles')
  }]
})
.on('reduce', function(tileMatches) {
  R.toPairs(tileMatches).forEach(([key, ids]) => {
    totalMatches[key] = totalMatches[key] ? R.union(totalMatches[key], ids) : ids;
  });
})
.on('end', function() {
  var duplicates = R.toPairs(totalMatches)
    .filter(([key, ids]) => {
      return ids.length > 1;
    })
    .map(([key, ids]) => {
      return ids;
    });
  console.log('matches total: %s', duplicates.length);
  duplicates.forEach((duplicate) => {
    console.log(duplicate.join(','));
  });
});
