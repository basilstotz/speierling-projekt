//const OSM = require("osm-api");
// or
import * as OSM from "osm-api";

//https://openstreetmap.org/node/6598972267

// you can call methods that don't require authentication

async function doit(){
let ans = await OSM.getFeature("node",6598972267 );
console.log(JSON.stringify(ans,null,2));
}
//OSM.configure({ basicAuth: { username: "bstotz", password: "Herakles0815" } });
// Once you login, you can call methods that require authentication.
// See the section below about authentication.
//await OSM.createChangesetComment(114733070, "Thanks for your edit!");
//if(OSM.isLoggedIn()){console.log("ja1")}else{console.log("nein1")}
//let ans2= await OSM.getPreferences();
//console.log(JSON.stringify(ans2,null,2));
//if(OSM.isLoggedIn()){console.log("ja2")}else{console.log("nein2")}

//doit();


async function updateTags(geoIn){

   let maxReq;
   let num;
   
   let features=geoIn.features;

   num=features.length;
   maxReq=500;

   let iter=Math.ceil(num/maxReq);

   for(let j=0;j<iter;j++){

     let start=j*maxReq;
     let stop=(j+1)*maxReq;
     if(stop>num)stop=num;

//     console.log(start,stop);

     let ids=[];

     for(let i=start;i<stop;i++){
        let feature=features[i];
        ids.push(feature.properties.id);
     }
   
     let ans= await OSM.getFeatures("node", ids);

     let indexed={};
     for(let i=start;i<stop;i++){
        let tags=ans[i].tags;
        let id=ans[i].id;
        indexed[id]=tags;
    }

     for(let i=start;i<stop;i++){
        let feature=features[i];
        if(indexed[feature.properties.id]){
           feature.tags=indexed[feature.properties.id].tags;
        }
     }

   }   

   process.stdout.write(JSON.stringify(geoIn,null,2));
}


var chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    updateTags(JSON.parse(chunks));
});
