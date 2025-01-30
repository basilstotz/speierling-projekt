.PHONY: all
all: site/sorbusdomestica.geojson

site/sorbusdomestica.geojson: tmp/project.json tmp/bilder.json
	./bin/update-geojson.sh

tmp/bilder.json: node  
	./bin/make-bilder.sh ./site/node  | ./bin/make-media.js > ./tmp/bilder.json


tmp/project.json: projekt.csv
	csv2json -d ./projekt.csv ./tmp/project.json 

.PHONY: node
node:
	@test -d ../Gemeinden || (echo "../Gemeinden not found";false)
	./bin/convert-all.sh ../Gemeinden ./site/node

.PHONY: archive
archive:
	./bin/archive.sh	

########################################################################################
osm/sorbusdomestica.geojson:
	$(MAKE) -C ./osm all
