#!/bin/sh

cd "$(dirname $0)/../."

pwd

./bin/update-history.sh >> ./update-history/update-history.log

cat ./osm/sorbusdomestica.geojson | \
            ./bin/devel/check-tags.js | \
            ./bin/devel/process-nominatim.js | \
            ./bin/devel/process-media.js ./tmp/bilder.json | \
            ./bin/devel/process-project.js ./tmp/project.json 2> project.log | \
            ./bin/devel/add-historic.js   | \
            ./bin/devel/process-history.js ./update-history/history.geojson  |  \
	    ./bin/devel/add-growth.js > sorbusdomestica.geojson
              

cat sorbusdomestica_devel.geojson | ./bin/devel/reduce.js | ./bin/devel/flatten-tags.js > ./../../sorbusdomestica.geojson


echo "done"

