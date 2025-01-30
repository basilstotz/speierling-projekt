
// https://gis.stackexchange.com/questions/330608/leaflet-marker-popup-link-from-outside-of-map-dynamically

///////////////////////////////////////popup////////////////////////////////////////

function content(feature){

    let tags=feature.properties.tags;
    let id=feature.properties.id;

   function wopen(){
      window.open('https://openstreetmap.org/'+feature.id );
   }

    //ugly """"" and '''' trick
    let mapurl='https://openstreetmap.org/'+feature.id;
    let onclick=' onclick=window.open("'+mapurl+'") ';

    let karDiv='<div '+onclick+'  id="karte'+id+
         '" style="margin-left:5px;margin-bottom:5px;height:150px;width:150px;float:left"></div>';

    let titDiv='<p id="titel'+id+'" style="margin:0px;margin-bottom:5px"></p>';
    let porDiv='<span id="portrait'+id+'" style="float:left"></span>';
    let cDiv='<div style="clear:both"></div>';
    let bilDiv='<p id="bilder'+id+'" style="margin:0px"></p>';
    
    let notDiv='<div id="note'+id+'" style="max-height:200px;overflow:auto"></div>';
    let dimDiv='<div id="dimension'+id+'"></div>';
    let linDiv='<div id="backlink'+id+'"></div>';

    let tabDiv='<div id="tabs'+id+'" style="height:400px;overflow:auto"></div>';
    
    
    let content='<div id="content'+id+'" style="padding:5px;background:#eeeeee">'+
        titDiv+'<span>'+porDiv+karDiv+'</span>'+cDiv+bilDiv + notDiv+dimDiv+linDiv+tabDiv+
        '</div>';

    
    return content; 

}

async function popupopen(event,feature){

    const tags = feature.properties.tags; 
    const id = feature.properties.id; 
    
    let history = false;
    
    if(tags.media){
        const response = await fetch(tags.media);
        media = await response.json();
        if(media.type=="mediaCollection"){
            feature.properties.media=media;
        }
    }

    if(tags.circumference || tags.height || tags.crown_diameter){
        history = await OSM.getFeatureHistory("node", id);
    }else
        history = false


    let cont=content(feature);
    event.popup.setContent(cont);

    titel(feature);
    portrait(feature,history);
    miniMap(feature);
    bilder(feature);
    
    let parentElm = document.getElementById("tabs"+id); 
    tabs(parentElm, feature, history);

}
