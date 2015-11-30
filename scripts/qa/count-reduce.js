'use strict';

import tileReduce from 'tile-reduce';
import path from 'path';

let numFeatures = 0;

tileReduce({
  zoom: 14,
  map: path.join(__dirname, '/count-map.js'),
  sources: [{
    name: 'osm',
    mbtiles: path.join(__dirname, '../../mbtiles/austin.mbtiles')
  }]
})
.on('reduce', function(num) {
  debugger;
  numFeatures += num;
})
.on('end', function() {
  console.log('Features total: %s', numFeatures);
});
