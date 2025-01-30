
// https://gis.stackexchange.com/questions/330608/leaflet-marker-popup-link-from-outside-of-map-dynamically

///////////////////////////////////////popup////////////////////////////////////////

function portrait(feature, history){

    let last_update=false;
    let wachstum;
    
    if(history){
        let diffs = diffHistory(history);

	diffs=addHistoricToDiffHistory(feature,diffs)

	let dim = getChanges(diffs, ["height","circumference","diameter_crown"]);
	last_update = dim[dim.length-1].timestamp;
	dim = getChanges(diffs, ["circumference"]);
	let erster = dim[0];
	let letzter = dim[dim.length-1];
	let dauer = decimalYear(letzter.timestamp)-decimalYear(erster.timestamp);
	let zuwachs = letzter.circumference - erster.circumference;
	if(dauer>0.0)wachstum=Math.round((1000.0*zuwachs)/dauer)/10.0;
    }

    
    const tags = feature.properties.tags;
    const id = feature.properties.id;
    

    const portraitDiv = document.getElementById("portrait"+id);
    
    let line=0;
    
    function appendTableRow(table, key, values){
	
	let row = document.createElement("tr");
	if(line%2==0)row.setAttribute("style","background-color:white");
	line++;

	//appendRowData(row,"<b>"+key+"</b>");
	
	let rowKey = document.createElement("td");
	rowKey.setAttribute("style","text-align:right");
	rowKey.innerHTML="<b>"+key+"</b>";
	row.appendChild(rowKey);

	let rowValue = document.createElement("td");
	rowValue.innerHTML=values;
	row.appendChild(rowValue);
	
	table.appendChild(row);
    }

    /*
    #tabelle table{width:100%;}
    #tabelle tr:nth-child(odd){background-color: #ffffff;}
    #tabelle tr:hover {background-color: #ddd;}
    */

    
    let tabelle = document.createElement("table");
    tabelle.setAttribute("style","padding-top:10px;padding-bottom:10px");
    tabelle.setAttribute("display","inline");
    tabelle.setAttribute("float","left");
    portraitDiv.appendChild(tabelle);

    // coordinates
    let lon = feature.geometry.coordinates[0];
    let lat = feature.geometry.coordinates[1];
    appendTableRow(tabelle, 'Position:', '<a href="geo:'+lat+','+lon+'">'+lat+', '+lon+'</a>');


    /*
    let yearTimestamp 
    if(tags["meta:timestamp"]){
        yearTimestamp = tags["meta:timestamp"].slice(0,4);
    }else{
        yearTimestamp=2025;  
    }
    */
    
    if(tags.circumference||tags.diameter_crown||tags.height){
	appendTableRow(tabelle, "letzte Datenerhebung:", year(last_update));
    }
    
    if(tags.circumference) {           
	appendTableRow(tabelle, "Umfang:", tags.circumference+' m');
    }

    if(tags.diameter_crown) {           
	appendTableRow(tabelle, "Krone:", tags.diameter_crown+' m');
    }

    if(tags.height) {           
	appendTableRow(tabelle, "Höhe:", tags.height+' m');
    }

    let propagation;
    if(tags.propagation){
	switch(tags.propagation){
        case 'natural':                                                                                           
            propagation='natürlich'
            break;                                                                                                
        case 'sucker':
            propagation='natürlich (Wurzelbrut)'
            break;                                                                                                
        case 'planted':
            propagation='gepflanzt';
            break;                                                                                                
        case 'graft':
            propagation='gepflanzt (Reiser)';
            break;
        case 'seed':                                                                                              
            propagation='gepflanzt (Samen)';
            break;            
        default:
            propagation='unbekannt';
            break;
	}
	appendTableRow(tabelle, "Vermehrungstyp:", propagation);
    }
    if(feature.properties.parentFeature){
        let parent = feature.properties.parentFeature;
        // later will be pOrt = tags["addr:gemeinde]
        let pOrt = parent.properties.tags["addr:full"].split(',')[0];
        let pGebiet = parent.properties.tags["speierlingproject:gebiet"];
        let pCoords = parent.geometry.coordinates;

	let herkunft = '<span style="color:rgb(0,120,168)" onclick="map.setView(L.latLng('+pCoords[1]+','+pCoords[0]+'))">'+pOrt+'/'+pGebiet+'</span>';
	appendTableRow(tabelle, "Herkunft:", herkunft)
    }
    
    if(tags.start_date){
	let a = 2025 - tags.start_date;
	appendTableRow(tabelle, "Pflanzjahr:", tags.start_date );
	appendTableRow(tabelle, "Alter:", a+' Jahre')
    }else{
	if(tags.circumference){
	    let groth;
	    if(wachstum){
		groth=100.0/wachstum;
	    }else{
		groth=60
	    }
	    let starter=Math.round( (2025-tags.circumference*groth)/10.0 ) * 10;
	     let desc;
	     if(tags.propagation=="natural" || tags.propagation=="sucker"){
		 desc="gesch.&nbsp;Keimjahr:";
	     }else{
		 desc="gesch.&nbsp;Pflanzjahr:";
	     }   
	    appendTableRow(tabelle, desc, starter);
        }
    }

    if(tags.circumference && tags.start_date){
	let a=year(last_update)-tags.start_date
       let w=tags.circumference/a;
       if(a>9){
           w=Math.round(1000.0*w)/10;
	   appendTableRow(tabelle, "BHU-Wachstum:", w+' cm/a');
       }
    }else if(wachstum){
	appendTableRow(tabelle, "BHU-Wachstum:", wachstum+' cm/a');
    }

    if(tags["speierlingproject:Fruechte"]){
	appendTableRow(tabelle, "Früchte:", tags["speierlingproject:Fruechte"])
    }
    
}

function titel(feature){
    
    const tags = feature.properties.tags;
    const id = feature.properties.id;

    const titelDiv = document.getElementById("titel"+id);
  

    let dnArray=feature.properties.tags["addr:full"].split(',').slice(1);
    let dnString=dnArray.join(', ');
    let name=dnString+'<br>';

    let loca=feature.properties.tags["addr:full"].split(',')[0];     
    
    if(tags["speierlingproject:gebiet"]){
       loca+=" ("+tags["speierlingproject:gebiet"]+")";
    }

    titelDiv.innerHTML='<h5 style="margin:0px">'+loca+'</h5>'+name;

}

function miniMap(feature){
    
    let lon=feature.geometry.coordinates[0];
    let lat=feature.geometry.coordinates[1];

    let mapid='karte'+feature.properties.id;
    var map = L.map(mapid, { zoomControl: false, 
                             attributionControl: false,
                             dragging: false,
                             doubleClickZoom: 'center',
                             scrollWheelZoom: false,
                             renderer: L.canvas()
                           }
                   );
 
    map.setView([lat, lon], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
    }).addTo(map);

    L.control.scale({imperial:false}).addTo(map);

    let color='black';
    if(feature.properties.tags.propagation){
       switch(feature.properties.tags.propagation){
         case 'natural': color='green';break;
         case 'sucker': color='yellow';break;
         case 'planted': color='blue';break;
         case 'seed': color='red';break;
         case 'graft': color='orange';break;
         case 'cutting': color='orange';break;
         default: color='white';break;
         }
    }
    
    let circle = L.circle([lat, lon], {
      color: color,
      fillColor: color,
      fillOpacity: 1.0,
      radius: 10
  }).addTo(map);        
}

function bilder(feature){
    
    const tags = feature.properties.tags;
    const id = feature.properties.id;

    const bilderDiv = document.getElementById("bilder"+id);

    let pics='';

    if(!feature.properties.media){
        if(tags.image){
          feature.properties.media={ "type": "mediaCollection", "pictures": [{ "picture": tags.image }] };    
        }
    }

    let minWidth;
    if(feature.properties.media){
	pics='<p>';
    	minWidth=400;
	let id=feature.id;
	let fpp=feature.properties.media.pictures;;
	minWidth=fpp.length*105;
	if(minWidth>420)minWidth=420;
	pics='<div style="min-height:'+100*(Math.floor(fpp.length/5)+1)+'">\n';
	let weitere=0;
	for(let i=0;i<fpp.length;i++){
	    let p=fpp[i];
	    let l;
	    if(i<4){
                if(!p.thumb)p.thumb=p.picture;
		l='<img style="width:100px;height:100px;object-fit:cover" src="'+p.thumb+'">';
		
	    }else{
		weitere++;
		l=''
	    }
	    pics+='<a href="'+p.picture+'" data-lightbox="1" data-title="'+"Titel"+'">'+l+'</a>\n';
	}
	if(weitere>0){
	    let weit
	    if(weitere==1){ weit=' weiteres Bild' }else{ weit=' weitere Bilder ...'}
	    pics+='</br>und noch '+weitere+weit;
	}
	pics+="</div></p>\n";
    }

    bilderDiv.innerHTML=pics;
}

