
// https://gis.stackexchange.com/questions/330608/leaflet-marker-popup-link-from-outside-of-map-dynamically

///////////////////////////////////////popup////////////////////////////////////////


class Tabulator {
    constructor(parent){
	this.parent = parent;
	this.tabulator = document.createElement('div');
	this.tabulator.setAttribute('class','tab');
	this.tabcontent = [];
	this.tablink = [];
	parent.appendChild(this.tabulator);
    }

    addTab(content,text){
	if(content){
	    let tab = document.createElement('div');
	    tab.className="tabcontent";
	    tab.setAttribute("style","display:none");

	    tab.appendChild(content);
	    
	    this.tabcontent.push(tab);
	    this.parent.appendChild(tab);

	    let index = this.tabcontent.length-1;
	    let button = document.createElement('button');
	    button.className = 'tablinks';
	    button.innerHTML=text;
	    button.addEventListener('click', (event) => { this.openTab(event,index)});

	    this.tablink.push(button);
	    this.tabulator.appendChild(button);
	    return tab
	}else{
	    return false
	}
    }

    openFirstTab(){
	if(this.tablink[0])this.tablink[0].click();
    }
    
    openTab(evt,index){
	for (let i = 0; i < this.tabcontent.length; i++) {
	    if(index==i){
		this.tabcontent[i].style.display = "block";
		this.tablink[i].className += " active"
		//evt.currentTarget.className += " active";
	    }else{
		this.tabcontent[i].style.display = "none";
		this.tablink[i].className = this.tablink[i].className.replace(" active", "");
	    }
	}
    }
	
    
} // end class

function projekt(feature){
    
    let projektDiv = false;

    let tags = feature.properties.tags;

    let count = 0;
    txt='<table class="tabelle">'; 
    for (const [key, value] of Object.entries(tags)) {
	
        if(key.startsWith('speierlingproject:')){
	    let k=key.split(':')[1];

	    let deny=[ 'gebiet','datum'];
	    if(!devMode)deny.push('hauptinfo');
	    
	    if( !deny.includes(k) ){
		let titel=false;
		switch(k){
		case 'hauptinfo':
		    titel = 'Hauptinfo';
		    break;
		case 'erhaltungs-plantage_biel_nr':
		    titel='Erhaltungsplantage&nbsp;Biel';
		    break;
		case 'seba':
		    titel='Seba';
		    break;
		case 'fruechte':
		    titel='Früchte'
		    break;
		case 'verluste_erklaerung':
		    titel='Verluste';
		    break;
		case 'dna_probe':
		    titel='DNA-Probe';
		    break;
		case 'bemerkung':
		    titel='Bemerkung';
		    break;
		case 'reiser':
		    titel='Reiser';
		    break;
		default:
		    titel=k;
		    break;
		}
		if(titel){
		    count++;
		    txt+='<tr ><td style="text-align:right"><b>'+titel+':</b></td><td>'+value+'</td></tr>'
		}
	    }
	}
    }
    txt+='</table>';

    if(count>0){
	projektDiv = document.createElement('div');
	projektDiv.innerHTML=txt
    }
    
    return projektDiv
}


function notes(feature, history){
    
    let diffs = diffHistory(history);
    let notes = getChanges(diffs,["note"])

    let notesDiv = false;
        
    if(notes.length>0){
	notesDiv = document.createElement("div");
	for(i=notes.length-1;i>=0;i--){
	    //for(i=0;i<notes.length;i++){
	    //noteDiv=document.getElementById("note"+history[0].id);
	    noteElm = document.createElement('p');
	    let note=notes[i]

	    if(i%2==0){
		noteElm.setAttribute("style","background:white;padding:0px;margin:0px");
	    }else{
		noteElm.setAttribute("style","padding:0px;margin:0px");
	    }
	    noteElm.innerHTML='<b style="background-color:lightgrey;width:100%">'+dateToString(note.timestamp.slice(0,10))+'</b><br/>'+note.note;
	    notesDiv.appendChild(noteElm);
	}
    }
    return notesDiv
}

function dimension(feature, history){

    let dim;

    let dimensionDiv = false;
    let plotdata={}
    
    if(history){
                                    
        //get history data
        let diffs = diffHistory(history);
        let rawDim = getChanges(diffs, ["height","circumference"]);


        dim=filterOutdatedDiffHistory(feature,rawDim);
	
	dim=addHistoricToDiffHistory(feature,dim);
	
    }
   if(history && dim.length>1){
        const tags = feature.properties.tags;
        const id = feature.properties.id;
       //const dimensionDiv = document.getElementById("dimension"+id);
       dimensionDiv = document.createElement('div');
        let line=0;

        function appendTableRow2(table, header, key, circumference, height){

            let type;
            let row = document.createElement("tr");

            if(header){
                row.setAttribute("style","background-color:lightgrey;color:black");
                type="th";
            }else{
                if(line%2==0)row.setAttribute("style","background-color:white");
                line++;
                type="td"
            }
                
            let rowKey = document.createElement(type);
            //rowKey.setAttribute("style","text-align:right");
            rowKey.innerHTML=key;
            row.appendChild(rowKey);

            let rowCircum = document.createElement(type);
            rowCircum.innerHTML=circumference;
            row.appendChild(rowCircum);

            let rowHeight = document.createElement(type);
            rowHeight.innerHTML=height;
            row.appendChild(rowHeight);

            table.appendChild(row);
        }
        let tabelle = document.createElement("table");
        tabelle.setAttribute("style","padding-top:10px;padding-bottom:10px;max-height:50px;overflow:auto");
        tabelle.setAttribute("display","inline");
        tabelle.setAttribute("float","left");
        dimensionDiv.appendChild(tabelle);

        appendTableRow2(tabelle,true,"&nbsp;Datum","&nbsp;Umfang&nbsp;","&nbsp;Höhe&nbsp;");

        let circumference;
        let height;
        let datum;

       // get minimal circumference
       let minCircumference = 100000;
       for(let i=0;i<dim.length;i++){
	   let line=dim[i];
	   if(line.circumference){
	       if(line.circumference<minCircumference)minCircumference=line.circumference
	   }
       }

       // muss vorwärts sein!
       for(let i=0;i<dim.length;i++){
	   let line=dim[i];
	   let timestamp=line.timestamp;
	   if(minCircumference>0.1){
	       datum=timestamp.slice(0,4)
	   }else{
	       datum=timestamp.slice(0,7)
	   }
	   if(line.circumference){
	       circumference=line.circumference
	   }else{
	       circumference=''
	   }

	   if(line.height){
	       height=line.height
	   }else{
	       height=''
	   }

	   appendTableRow2(tabelle,false,'<b>'+datum+'</b>&nbsp;','&nbsp;'+circumference,'&nbsp;'+height);

       }
       feature.properties["plotdata"] = plotdata; 
   }
    return dimensionDiv
}

function plot(feature){

    let plotDiv=false;
    let plotdata;
    let layout;
    //                    this is wrong. should be plotdata
    if(feature.properties.plotdata2){
	plotDiv = document.createElement('div');
	plotDiv.setAttribute("id","plotdiv");
	//plotDiv.id="plotdiv";
	plotdata=feature.properties.plotdata;
	Plotly.newPlot('plotdiv', plotdata, layout);
    }
    return plotDiv;
}

function backlink(feature){
    
    const tags = feature.properties.tags;
    const id = feature.properties.id;
    const backlink = feature.properties.backlink;
    
    //const backlinkDiv = document.getElementById("backlink"+id);
    let backlinkDiv = false;
    
    let txt;
    
    if(backlink){
	backlinkDiv = document.createElement('div');
	txt='<table><tr style="background:lightgrey"><th>Ort</th><th>Gebiet</th><th>Vermehrungstyp</th><th>Planzjahr</th></tr>';
        for(let i=0;i<backlink.length;i++){
            t=backlink[i].properties.tags
            let ort=t["addr:full"].split(',')[0];
            let gebiet=t["speierlingproject:gebiet"];
            let start_date=t.start_date;
            let propagation=t.propagation

            let typ;
	    let style;
            if(i%2==0){
                style=' style="background:white" '
            }else{
                style=''
            }
	    let color;
	    if(propagation=="graft"){
		typ='Reiser';
		color="orange"
	    }else{
		typ='Samen';
		color="red"
	    }             
            txt+='<tr '+style+' ><td>'+ort+'</td><td>'+gebiet+'</td><td style="color:'+color+'">'+typ+'</td><td>'+start_date+'</td></tr>'
        }
	backlinkDiv.innerHTML=txt+'</table></br>';
    }
    return backlinkDiv
    
}

function tabs(parent, feature, history){


    let tabulator = new Tabulator(parent);

    let dimensionElm = dimension(feature,history)
    if (dimensionElm){
	tabulator.addTab(dimensionElm,'<b>Wachstum</b>');
	let plotElm = plot(feature);
	if(plotElm) tabulator.addTab(plotElm,'<b>Plot</p>')
    }
    

    tabulator.addTab(backlink(feature), '<b>Kinder</b>');
    tabulator.addTab(projekt(feature), '<b>Projekt</b>');
    if(devMode)tabulator.addTab(notes(feature, history), "<b>Notizen</b>");

    tabulator.openFirstTab();
}

