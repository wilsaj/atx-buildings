# This is a Makefile for automatically downloading and preparing data

BABEL = node_modules/babel/bin/babel-node.js


.PHONY: addresses buildings clean json tiles

all: json

addresses: shp/atx-addresses.shp
buildings: shp/atx-buildings.shp json/osm-buildings.json
blockgroups: json/blockgroups
json: json/atx-buildings.json json/addresses.json json/osm-buildings.json json/blcockgroups


clean:
	rm -rf gz
	rm -rf json
	rm -rf shp
	rm -rf tiles
	rm -rf zip


# download zip files
zip/building_footprints_2013.zip:
	mkdir -p $(dir $@)
	curl 'https://data.austintexas.gov/api/geospatial/d9te-zi9f?method=export&format=Shapefile' -o $@.download
	mv $@.download $@

zip/address_point.zip:
	mkdir -p $(dir $@)
	curl 'https://data.austintexas.gov/api/geospatial/bpa2-q2tj?method=export&format=Shapefile' -o $@.download
	mv $@.download $@


# unzip shapefiles
shp/%.shp:
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

shp/atx-addresses.shp: zip/address_point.zip
shp/atx-buildings.shp: zip/building_footprints_2013.zip


# convert to geojohnson
json/addresses.json: shp/atx-addresses.shp
	mkdir -p $(dir $@)
	ogr2ogr -f GeoJSON -dim 2 -t_srs EPSG:4326 $@ $<

json/atx-buildings.json: shp/atx-buildings.shp
	mkdir -p $(dir $@)
	ogr2ogr -f GeoJSON -dim 2 -t_srs EPSG:4326 $@ $<

json/osm-buildings.json: scripts/osm-buildings.ql
	mkdir -p $(dir $@)
	node_modules/query-overpass/cli.js $< > $@

# convert block groups to GeoJSON, transform to WGS84, and clip to Austin bbox
json/atx-blockgroups.json: shp/texas-blockgroups.shp
	ogr2ogr -f "GeoJSON" -clipdst -98.2 29.9 -97.3 30.7 -t_srs EPSG:4326 $@ $<

json/blockgroups/: json/atx-blockgroups.json
	mkdir -p $@
	cat $^ | \
		$(BABEL) scripts/uncollect-features.js | \
		$(BABEL) scripts/write-to-files.js --pre $@/ --propertyName 'GEOID'


# borrowed from https://github.com/mbostock/us-atlas
# Census Block Groups
gz/tl_2012_%_bg.zip:
	mkdir -p $(dir $@)
	curl 'http://www2.census.gov/geo/tiger/TIGER2012/BG/$(notdir $@)' -o $@.download
	mv $@.download $@

shp/texas-blockgroups.shp: gz/tl_2012_48_bg.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@
