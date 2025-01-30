#!/usr/bin/env node

function logger(t){
    process.stderr.write(JSON.stringify(t,null,2)+"\n");
}
    
function martin(text){
    let trimmed=text.toString().trim();
    let cleaned=trimmed.replace(/(\r\n|\n|\r)/gm, " ");
    return cleaned;
}

function decimalYear(dateString){
    let date = new Date(dateString);
    let zeit=date.getFullYear()+(1.0/12.0)*date.getMonth()+(1.0/365.0)*date.getDate();
    return Math.round(zeit*1000)/1000.0
}


function clone(x){
    return JSON.parse(JSON.stringify(x))
}


function processNominatim(geoIn){

    let features= geoIn.features;
    for(let i=0;i<features.length;i++){
	let feature=features[i];
        let tags=feature.properties.tags;
	
	    // process nominatim	
	let address=feature.properties.nominatim.address;
	let addrArray=Object.entries(address);
	addrArray.forEach( ([key,value]) => {
	    if(!( key=="postcode" || key.indexOf("ISO")!=-1) ){
		let tag="addr:"+key;
		tags[tag]=value;	
	    }
	});
	if(feature.properties.nominatim.display_name){
	    tags["addr:full"]=feature.properties.nominatim.display_name;
	    tags["addr:gemeinde"]=feature.properties.nominatim.display_name.split(',')[0];
	}
	//if(feature.properties.nominatim){ delete feature.properties.nominatim }


	// claenup
	if(feature.properties.relations){ delete feature.properties.relations }
    }
    return geoIn
}




function processGeojson(geoIn){


    let geoOut=processNominatim(geoIn);

    process.stdout.write(JSON.stringify(geoOut,null,2)+'\n');	    
}



var chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    processGeojson(JSON.parse(chunks))
});
