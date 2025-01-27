//let trees

let records=[];
let recordsYoung=[];

let options = {staticPlot: true, displaylogo: false }

let tabulator;

function createNode(element) {
    return document.createElement(element);
}

function append(parent, el) {
  return parent.appendChild(el);
}


//const url = 'https://speierling.arglos.ch/gis/sorbusdomestica.geojson';
const url = 'sorbusdomestica.geojson';

function onBody(){
    fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
	let trees  = data;
	//console.log(trees);
	processTrees(trees)    
    })
    .catch(function(error) {
      console.log(error);
    });
}

function processTrees(trees){
    
    let takeList = [
	'speierlingproject:neupflanzung',
	'propagation',
	'propagation:parent',
	'circumference',
	'circumference:groth',
	'circumference:groth:estimated',
	'height',
	'height:groth',
	'start_date',
	'start_date:estimated',
	'start_date:young'
    ];

    let features=trees.features;
    for(let i=0;i<features.length;i++){
	
	let feature=features[i];
	let tags=feature.properties.tags

	calcGroth(feature)
	
	let record = {}	
	for( const key of Object.keys(tags)){
	    if(tags[key]){
		if(key=='circumference'){
		    let c=tags[key];
		    if(c >5.0)tags[key]=c/1000.0;
		}
		if(key=='start_date'){
		    let s=tags[key];
		    if(decimalYear(s)<1900){delete tags[key]}
		}
		record[key]=tags[key]
	    }
	}
	
	if(tags['speierlingproject:neupflanzung']){
	    recordsYoung.push(record);
	}else{
	    records.push(record)
	}
       
    }
    
    let parent = document.getElementById('inhalt');
    tabulator= new Tabulator(parent);
    tabDash(records.concat(recordsYoung));
    tabAlle(records.concat(recordsYoung));
    tabYoung(recordsYoung);
    tabNatural(records);
    tabPlanted(records);
    tabulator.openFirstTab();
}

function appendPlotDiv(container,id){
    let plotdiv = document.createElement('div')
    plotdiv.setAttribute('id',id);
    container.appendChild(plotdiv);
}

function tabDash(records){
    let container = document.createElement('div');

    appendPlotDiv(container,'general')
    appendPlotDiv(container,'stats');
    /*
    appendPlotDiv(container,'circumhist')
    appendPlotDiv(container,'circumhistcum')
    appendPlotDiv(container,'starthist')
    appendPlotDiv(container,'starthistcum')
    appendPlotDiv(container,'wuchshist')
    appendPlotDiv(container,'wuchshistcum')
    */
    tabulator.addTab(container,"Übersicht")

    general('general', records);
    stats('stats',archive);

    /*
    general('general', records);
    circumHist('circumhist',records);
    startHist('starthist',records);
    wuchsHist('wuchshist', records);
    */
}


function tabAlle(records){
    let container = document.createElement('div');

    appendPlotDiv(container,'general')
    appendPlotDiv(container,'circumhist')
    appendPlotDiv(container,'circumhistcum')
    appendPlotDiv(container,'starthist')
    appendPlotDiv(container,'starthistcum')
    appendPlotDiv(container,'wuchshist')
    appendPlotDiv(container,'wuchshistcum')
   
    tabulator.addTab(container,"Alle")
    
    circumHist('circumhist',records, [] );
    startHist('starthist',records, [] );
    wuchsHist('wuchshist', records, [] );
}


function tabPlanted(records){
    let container = document.createElement('div');

    //appendPlotDiv(container,'pgeneral')
    appendPlotDiv(container,'pcircumhist')
    appendPlotDiv(container,'pcircumhistcum')
    appendPlotDiv(container,'pstarthist')
    appendPlotDiv(container,'pstarthistcum')
    appendPlotDiv(container,'pwuchshist')
    appendPlotDiv(container,'pwuchshistcum')
   
    tabulator.addTab(container,"Gepflanzt")
    
    //general('general', records);
    circumHist('pcircumhist',records, [ 'planted', 'seed', 'graft' ]);
    startHist('pstarthist',records, [ 'planted', 'seed', 'graft' ]);
    wuchsHist('pwuchshist', records, [ 'planted', 'seed', 'graft' ]);
}

function tabNatural(records){
    let container = document.createElement('div');

    //appendPlotDiv(container,'pgeneral')
    appendPlotDiv(container,'ncircumhist')
    appendPlotDiv(container,'ncircumhistcum')
    appendPlotDiv(container,'nstarthist')
    appendPlotDiv(container,'nstarthistcum')
    appendPlotDiv(container,'nwuchshist')
    appendPlotDiv(container,'nwuchshistcum')
   
    tabulator.addTab(container,"Natürlich")
    
    //general('general', records);  //sould have sucker too, but throws an error
    circumHist('ncircumhist',records, [ 'natural' ]);
    startHist('nstarthist',records, [ 'natural' ]);
    wuchsHist('nwuchshist', records, [ 'natural' ]);
}

function tabYoung(records){
    let container = document.createElement('div');

    //appendPlotDiv(container,'pgeneral')
    appendPlotDiv(container,'ystarthist')
    appendPlotDiv(container,'ystarthistcum')
    appendPlotDiv(container,'yheightgrothhist')
    appendPlotDiv(container,'yheightgrothhistcum')
    appendPlotDiv(container,'ycircumhist')
    appendPlotDiv(container,'ycircumhistcum')
    if(devMode){
	appendPlotDiv(container,'ywuchshist')
	appendPlotDiv(container,'ywuchshistcum')
    }
    tabulator.addTab(container,"Projektbäume")
    
    //general('general', records);
    heightGrothHist('yheightgrothhist', records, [ 'seed', 'graft']);
    startHist('ystarthist',records , [ 'seed','graft' ]);
    circumHist('ycircumhist',records, [ 'seed','graft' ]);
    if(devMode){
	wuchsHist('ywuchshist', records, [ 'seed','graft' ]);
    }
}

function makeData(records,key, props=[]){
   let propList = ['natural', 'sucker', 'planted','seed', 'graft', 'unknown'];
    let colorList = [ 'green','yellow','blue','red','orange','black' ]

    
    if(props.length>0){
	let propTmp=[];
	let colorTmp=[];
	for(const p of props){
	    propTmp.push(p);
	    colorTmp.push(colorList[propList.indexOf(p)]);
	}
	propList=propTmp;
	colorList=colorTmp;
    }
    
    let data =[];
    for(const prop of propList){
	let index=propList.indexOf(prop);
	data.push( {
	    x: [],
	    type: 'histogram',
	    marker: { color: colorList[index] },
	    name: prop
	} );
    }	
	
    let propagation;
    for(const record of records){
	if(record.propagation){
	    propagation=record.propagation;
	}else{
	    propagation='unknown'
	}
	if(record[key]){
	    let c=record[key];
            if(propList.includes(propagation)){
		data[propList.indexOf(propagation)].x.push(c);
	    }
	}else if(record[key+':estimated']){
	    let c=record[key+':estimated'];
            if(propList.includes(propagation)){
		data[propList.indexOf(propagation)].x.push(c);
	    }
	}
    }
    return data
}

function stats(id, archive){
    //let archive = JSON.parse(fs.readFileSync('archive-stats.json');

    let trace1 = {
      x: [],
      y: [],
      name: 'Speierlinge',
      type: 'scatter'
    };

    let trace2 = {
      x: [],
      y: [],
      name: 'Bilder',
      yaxis: 'y2',
      type: 'scatter'
	 };

    for( let [ key, value ] of Object.entries(archive)){
	    trace1.x.push(key);
	    trace2.x.push(key);
	    trace1.y.push(value.trees);
	    trace2.y.push(value.pics);
	}

    var data = [trace1, trace2];

    var layout = {
	plot_bgcolor: '#eeeeee',
	title: {text: 'Anzahl der Speierlinge und Bilder in der Datenbank'},
	xaxis: { title: { text: 'Datum' }, type: 'date'  },
      yaxis: {
	title: {
	  text: 'Speierlinge [ ]'
	}
      },
      yaxis2: {
	title: {
	  text: 'Bilder [ ]',
	  font: {color: 'rgb(148, 103, 189)'}
	},
	tickfont: {color: 'rgb(148, 103, 189)'},
	overlaying: 'y',
	side: 'right'
      }
    };

    Plotly.newPlot('stats', data, layout, options);

}

function circumHist(id,records, props=[]){

    let data = makeData(records,'circumference',props);
    
    let layout = {
	barmode: 'stack',
	plot_bgcolor: '#eeeeee',
	title: { text: 'Verteilung des Umfangs'},
	xaxis: { title: { text: 'Umfang [m]' }},
	yaxis: { title: { text: 'Anzahl [ ]' }},
    }

    Plotly.newPlot(id, data, layout, options);

    layout.title= {text: 'Kumulative Verteilung des Umfangs'}
    for(let i=0;i<data.length;i++){
	data[i].cumulative= { enabled: true };
	//data[i].histnorm = 'probability';
    }

    Plotly.newPlot(id+'cum', data, layout, options);
    
}

function heightGrothHist(id,records, props=[]){

    let data = makeData(records,'height:groth',props);
    
    let layout = {
	barmode: 'stack',
	plot_bgcolor: '#eeeeee',
	title: { text: 'Verteilung des Höhenwachstums'},
	xaxis: { title: { text: 'Höhenwachstum [m/a]' }},
	yaxis: { title: { text: 'Anzahl [ ]' }},
    }

    Plotly.newPlot(id, data, layout, options);

    layout.title= {text: 'Kumulative Verteilung Höhenwachstums'}
    for(let i=0;i<data.length;i++){
	data[i].cumulative= { enabled: true };
	//data[i].histnorm = 'probability';
    }

    Plotly.newPlot(id+'cum', data, layout, options);
    
}

    

function startHist(id, records,props=[]){

    let data;
    //if(props.length==1 && props[0]=='natural'){
    //	data = makeData(records,'start_date:estimated', props)
    //}else if(props.length==2 && props.includes('graft') && props.includes('seed') ){
    //	data = makeData(records,'start_date:young',props);
    //}else{
	data = makeData(records,'start_date',props);
    //}
    
    
    let layout = {
	barmode: 'stack',
	plot_bgcolor: '#eeeeee',	
	title: { text: 'Neupflanzungen'},
	xaxis: { title: { text: 'Datum' }, type: 'date'  },
	yaxis: { title: { text: 'Anzahl [ ]' }},
    }

	Plotly.newPlot(id,  data, layout, options);

    layout.title= {text: 'Bestand'}
    for(let i=0;i<data.length;i++){
	data[i].cumulative= { enabled: true }
    }

    Plotly.newPlot(id+'cum', data, layout, options);
}

function wuchsHist(id, records, props=[]){

    let data = makeData(records,'circumference:groth',props);
 
    let layout = {
	barmode: 'stack',
	//paper_bgcolor: 'white',
	plot_bgcolor: '#eeeeee',
	title: { text: 'Verteilung des BHU-Wachstum'},
	xaxis: { title: { text: 'BHU-Wachstum [cm/a]' }  },
	yaxis: { title: { text: 'Anzahl [ ]' }},
    }

    Plotly.newPlot(id, data, layout, options);

    layout.title= {text: 'Kumulative Verteilung des BHU-Wachstums'}
    for(let i=0;i<data.length;i++){
	data[i].cumulative= { enabled: true }
    }

    Plotly.newPlot(id+'cum', data, layout, options);
    
}

function general(id,records){
    let natural=0;
    let sucker=0;
    let planted=0;
    let seed=0;
    let graft=0;
    let unknown=0;
    for(const record of records){
	let propagation= record.propagation
	switch(propagation){
	case 'natural':
	    natural++;
	    break;
	case 'sucker':
	    sucker++;
	    break;
	case 'planted':
	    planted++
	    break;
	case 'seed':
	    seed++;
	    break;
	case 'graft':
	    graft++;
	    break;
	default:
	    unknown++;
	    break;
	}
    }

    let anz= natural + sucker + planted + seed + graft + unknown;
    
    let data = [{
	values: [natural, sucker, planted, seed, graft, unknown],
	labels: ['natural', 'sucker', 'planted','seed', 'graft', 'unknown'],
	marker: { colors :  [ 'green','yellow','blue','red','orange','black' ] },
	title: { text: 'Verteilung aller Speierlinge der Datenbank nach Vermehrungstyp', size: '30'},
      type: 'pie'
    }];

    var layout = {
	//height: 400,
	//width: 500,
	plot_bgcolor: '#eeeeee',
	titel: { text: 'Verteilung aller Bäume der Datenbank nach Vermehrungstyp' },
    };

    Plotly.newPlot(id, data, layout,options );
}

	
var archive = {
  "2023-07-08": {
    "trees": 1229,
    "pics": 2766
  },
  "2023-07-09": {
    "trees": 1229,
    "pics": 2766
  },
  "2023-07-14": {
    "trees": 1229,
    "pics": 2766
  },
  "2023-07-19": {
    "trees": 1229,
    "pics": 2772
  },
  "2023-07-20": {
    "trees": 1230,
    "pics": 2771
  },
  "2023-07-30": {
    "trees": 1235,
    "pics": 2773
  },
  "2023-08-09": {
    "trees": 1238,
    "pics": 2789
  },
  "2023-09-05": {
    "trees": 1246,
    "pics": 2829
  },
  "2023-10-16": {
    "trees": 1269,
    "pics": 2970
  },
  "2023-12-20": {
    "trees": 1351,
    "pics": 3178
  },
  "2024-01-25": {
    "trees": 1420,
    "pics": 3310
  },
  "2024-03-08": {
    "trees": 1452,
    "pics": 3517
  },
  "2024-04-04": {
    "trees": 1491,
    "pics": 3635
  },
  "2024-06-08": {
    "trees": 1639,
    "pics": 4380
  },
  "2025-01-02": {
    "trees": 2022,
    "pics": 4717
  },
  "2025-01-22": {
    "trees": 2052,
    "pics": 4823
  }
}
    
