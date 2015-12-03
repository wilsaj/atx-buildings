// stream in individual features from extract -> stream out a cleaned up version
// of the same features (OSM id converted to string, tags extracted) that will
// make the data more congenial for QA process e.g. (tippecanoe and tile-reduce)
import es from 'event-stream';
import JSONStream from 'JSONStream';
import fs from 'fs';
import R from 'ramda';


process.stdin
  .pipe(JSONStream.parse())
  .pipe(es.map(function(feature, cb) {
    feature.properties.osm_id = String(feature.properties.osm_id);
    if(feature.properties.tags) {
      var split = feature.properties.tags.slice(1).split('\", \"')
      var pairs = split.map(function (comb) {
        return comb.split('"=>"');
      });
      var tagProperties = R.fromPairs(pairs);

      feature.properties = R.merge(feature.properties, tagProperties);
      delete feature.properties.tags;
    }
    cb(null, feature);
  }))
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout);

