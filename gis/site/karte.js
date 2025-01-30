//let offline=false;

//let treesGeojson;
                                

function addParent(geojson){

    let indexed= {};

    // add featureIndex                                                                                                     
    for(let i=0;i<geojson.features.length;i++){
        let feature=geojson.features[i];
        feature.featureIndex=i;
    }

    // make indexOpbject                                                                                                    
    for(let i=0;i<geojson.features.length;i++){
        let feature=geojson.features[i];
        indexed[feature.properties.id]=feature;
    }

    // make parentIndex;                                                                                                    
    for(let i=0;i<geojson.features.length;i++){
        let feature=geojson.features[i];
        if(feature.properties.tags["propagation:parent"]){
            let parent=feature.properties.tags["propagation:parent"];
            if(indexed[parent]){
                let parentIndex=indexed[parent].featureIndex;
                feature.properties.parentIndex=parentIndex;

               // link to myself
                let parentFeature=geojson.features[parentIndex];
                feature.properties.parentFeature=parentFeature;

                //nicht richtig so !!!!!!!
                //add backling to parentFeature
                if(!parentFeature.properties.backlink)parentFeature.properties.backlink=[];
                parentFeature.properties.backlink.push(feature);                
            }
        }
    }
    return geojson;
}

function getRelationGeojson(geojson){

    let relationGeojson= { type: "featureCollection", features: [] };

    for(let i=0;i<geojson.features.length;i++){
        let feature=geojson.features[i];
        if(feature.properties.parentFeature){

            let coords=feature.geometry.coordinates;
            let pCoords=feature.properties.parentFeature.geometry.coordinates;

            let item={ "type": "Feature",
                       "properties": {},
                       "geometry": {
                              "type": "LineString",
                              "coordinates": [ pCoords, coords ]
                       }
                     };
            relationGeojson.features.push(item);
        }

    }
    return relationGeojson;
}

///////////////////////////////////////marker////////////////////////////////////////

function pointToLayer(feature, latlng) {

    let tags=feature.properties.tags;  
 
    let color;
    let radius;
    let weight;

    if(tags.propagation){
        switch(tags.propagation){
            case 'planted':
                color='blue';
                break;
            case 'natural':
                color='green';
                break;
            case 'graft':
                color='orange';
                break;
            case 'seed':
                color='red';
                break;
            case 'sucker':
                color='yellow';
                break;
            default:
                color='white';
                break;
        }
    }else{
        color='black'
    }

    if (tags.circumference) {
	let c=tags.circumference;
        radius=Math.round(6.0*Math.sqrt(c));
	if(radius<3)radius=3;
	fillOpacity=0.6;
    }else{
	radius=5;
	fillOpacity=0.3;
    }

    if(tags.media||tags.image){
	weight=3;
    }else{
	weight=0;
    }

    let m;
    let pro=false;

    if(pro){
       m = L.shapeMarker(latlng, {
                fillColor: color,
                color: color,
                shape: "triangle",
                radius: radius*0.7
        });         
    }else{
       m = L.circleMarker(latlng,
                          {
                              radius: radius,
                              weight: weight,
                              color: color,
                              opacity: 1.0,
                              fillColor: color,
                              fillOpacity: fillOpacity
                          }
                         );
    }

    return m;
    //end neu                              
}

function onEachFeature(feature, layer) {

    //rohSet(tags+project);

    let options = { maxWidth: 700, minWidth: 500, maxHeight: 400 };
    let popup = L.popup(options); 

    // function popuopen is in popup.js
    layer
      .bindPopup(popup)
      .on("popupopen", (event) => { popupopen(event, feature)} );    

}


///////////////////////////////////////lightbox////////////////////////////////////////

lightbox.option({
      'resizeDuration': 200,
      'imageFadeDuration': 200,
      'fadeDuration': 600,
      'wrapAround': true
});

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////map/////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

var map = L.map('map').setView([47.7,8.0 ], 10);

//https://github.com/xtk93x/Leaflet.TileLayer.ColorFilter
let myFilter = [
    'blur:0px',
    'brightness:110%',
    'contrast:80%',
    'grayscale:100%',
    'hue:0deg',
    'opacity:90%',
    'invert:0%',
    'saturate:100%',
    'sepia:0%'
];


if(offline==true){
   // uses local scout server !!!!!!!!
   L.tileLayer('http://localhost:8553/v1/tile?style=pedestrian&daylight=1&scale=4&shift=0&z={z}&x={x}&y={y}', {
	maxZoom: 20,
        tileSize: 1024,
        zoomOffset: -2,
        detectRetina: true,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
	'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	'Imagery © <a href="https://github.com/rinigus/osmscout-server">OSM Scout Server</a>',
    }).addTo(map);
}else{
   L.tileLayer.colorFilter('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
        filter: myFilter,
   }).addTo(map);
}

L.control.scale({imperial:false, maxWidth: 50}).addTo(map);

var gps = new L.Control.Gps({
		//autoActive:true,
		autoCenter:true
	});//inizialize control

	gps
	.on('gps:located', function(e) {
		//	e.marker.bindPopup(e.latlng.toString()).openPopup()
		//console.log(e.latlng, map.getCenter())
	})
	.on('gps:disabled', function(e) {
		e.marker.closePopup()
	});

	gps.addTo(map);

//////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// sdd gesojson layers   ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////


function addGeojsonLayer(responseText){

    // rapairTags and addParentIndex goes here

    let geojsonLayer=addParent(JSON.parse(responseText));

    let trees=L.geoJSON(geojsonLayer, {
        //style: style,
        //filter: filter,
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
    });

    let relationGeojson=getRelationGeojson(geojsonLayer);
    let relative=L.geoJSON( relationGeojson, {
        style: function(feature){return { opacity:0.15,color:"#000000" }}
        //filter: filter,
        //onEachFeature: onEachFeature,
        //pointToLayer: pointToLayer
    });

    relative.addTo(map);
    trees.addTo(map);
    stopSpinner();

}

function addGeojsonDistri(responseText){

    let geojsonLayer=JSON.parse(responseText);

    let distri=L.geoJSON(geojsonLayer, {
        style: function(feature){return { opacity:0.0,fillOpacity:0.09,color:"#004400" }}
        //filter: filter,
        //onEachFeature: onEachFeature,
        //pointToLayer: pointToLayer
    });

    distri.addTo(map);
}

function addGeojsonCliff(responseText){

    let geojsonLayer=JSON.parse(responseText);

    let cliff=L.geoJSON(geojsonLayer, {
        style: function(feature){return { opacity:0.5,fillOpacity:0.5,color:"#00ff00" }}
        //filter: filter,
        //onEachFeature: onEachFeature,
        //pointToLayer: pointToLayer
    });

    cliff.addTo(map);
}

function addGeojsonRect(responseText){

    let geojsonLayer=JSON.parse(responseText);

    let rect=L.geoJSON(geojsonLayer, {
        style: function(feature){return { fill:true,opacity:1.0,fillOpacity:0.05,color:"#111111",weight:0 }}
        //filter: filter,
        //onEachFeature: onEachFeature,
        //pointToLayer: pointToLayer
    });

    rect.addTo(map);
}

///////////////////////////////////////////////////////////////////////////////////////////////

/*
function httpGet(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
*/

// load and add layers
//httpGet('cliff+045+005.geojson', addGeojsonCliff);

httpGet('Rect.geojson', addGeojsonRect);

httpGet('Sorbus_domestica_plg.geojson', addGeojsonDistri);

httpGet('sorbusdomestica.geojson', addGeojsonLayer);

