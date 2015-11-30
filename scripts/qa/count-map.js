'use strict';

module.exports = function(data, tile, writeData, done) {
  let count = 0;
  let fc = data.osm.data;
  if (fc && fc.features) {
    const addressed = fc.features.filter((item) => {
      if (item.properties) {
        //return item.properties["addr:street"];
        return true;
      } else {
        return false;
      }
    });
    count += addressed.length;
  }
  done(null, fc);
}
