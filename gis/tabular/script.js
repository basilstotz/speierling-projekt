

function initColumns(countryList){
    let headerfilterParams = { values: countryList }
    let columns = [
	{title:"Land", field:"addr:country", sorter:"string",headerFilter:'list', headerFilterParams: {  values: countryList}  },
	{title:"Kanton", field:"addr:state", sorter:"string",headerFilter:"input" },
	{title:"Gemeinde", field:"addr:town", sorter:"string", headerFilter:"input", topCalc:"count" },
	{title:"Gebiet", field:"speierlingproject:gebiet", sorter:"string", headerFilter:"input" },
	{title:"Datum", field:"start_date", sorter:"number"  },
	{title:"Umfang", field:"circumference", sorter:"number" },
	    {title:"Höhe", field:"height", sorter:"number" },
	//{title:"Vermehrungstyp", field:"propagation", sorter:"string", headerFilter: "list", headerFilterParams: { values: [ "", "natural","sucker","planted","graft","seed","cutting"]  } }
	{title:"Typ", field:"propagation", sorter:"string", headerFilter:false }
    ];
    return columns;
}



//initialize table
function init(data,columns){
    var table = new Tabulator("#example-table", {
	//renderVerticalBuffer:3000,
	//maxHeight:"100%",
	progressiveRender:true,
	layout:"fitDataTable",

	//pagination:"local",
	//paginationSize:6,
	//paginationSizeSelector:[3, 6, 8, 10],
	//movableColumns:true,
	//paginationCounter:"rows",

	
	//progressiveRenderSize:100, //sets the number of rows to render per block (default = 20)
	//progressiveRenderMargin:350, //distance in px before end of scroll before progressive render is triggered (default = 200)

	data: data, //assign data to table
	columns: columns
	//autoColumns:true, //create columns from data field names
    });
    
    table.on("tableBuilding", () => { build(true) } );
    table.on("tableBuilt", () => { build(false)} );
    table.on("renderStarted", () => { render(true) } );
    table.on("renderComplete", () => { start(false)} );
    table.on("dataLoading", () => { load(true) });
    table.on("dataLoaded", () => { load(false) });
    table.on("dataFiltering", () => { filter(true) });
    table.on("dataFiltered", () => { filter(false) });
    table.on("dataSorting", () => { sort(true) });
    table.on("dataSorted", () => { sort(false) });
    table.on("dataProcessing", () => { process(true) });
    table.on("dataProcessed", () => { process(false) });
    
    //table.on("cellDblClick", function(e, cell){
        //e - the click event object
        //cell - cell component
	//console.log(JSON.stringify(cell,null,2));
    //});
    
    //table.setHeaderFilterValue("addr:country", 'Schweiz/Suisse/Svizzera/Svizra');
}

function message(name,message=''){
    let el=document.getElementById(name);
    if(message!=''){
	el.innerHTML=message
    }else{
	el.innerHTML=""
    }
}
    

function build(active){
    let el=document.getElementById("build");
    if(active){
	el.innerHTML="building ..."
    }else{
	el.innerHTML=""
    }
}
function start(active){
    let el=document.getElementById("start");
    if(active){
	el.innerHTML="starting ..."
    }else{
	el.innerHTML=""
    }
}
function load(active){
    let el=document.getElementById("load");
    if(active){
	el.innerHTML="loadinging ..."
    }else{
	el.innerHTML=""
    }
}
function process(active){
    let el=document.getElementById("process");
    if(active){
	el.innerHTML="processing ..."
    }else{
	el.innerHTML=""
    }
}
function render(active){
    let el=document.getElementById("render");
    if(active){
	el.innerHTML="rendering ..."
    }else{
	el.innerHTML=""
    }
}
function filter(active){
    let el=document.getElementById("filter");
    if(active){
	el.innerHTML="filtering ..."
	let uhu=4
    }else{
	el.innerHTML=""
    }
}
function sort(active){
    let el=document.getElementById("sort");
    if(active){
	el.innerHTML="sorting ..."
    }else{
	el.innerHTML=""
    }
}


function reduce(feature){

    let allow=[
	"addr:state",
	"addr:full",
	"addr:country",
	"speierlingproject:gebiet",
	"meta:id",
        "start_date",
        "circumference",
        "height",
        "propagation"
    ];


    let out={};

    feature.properties.tags["meta:id"]=feature.properties.id;
    
    first=true;
    if(feature.properties.tags){
        for (var [key, value] of Object.entries(feature.properties.tags)) {
            if(allow.includes(key)){
                //if(!((key=='addr:full')||(key=='speierlingproject:line'||deny.includes(key)))){
                if(key=='addr:full'){
		    
		    key="addr:town";
		    value=value.split(",")[0];
		    first=false;
		    //if(key=='addr:town'&&value=='Wien')feature.properties.tags['addr:state']='Wien'
                }
		
		out[key]=value;
            }
        }
        delete feature.properties.tags;
    }
    return out
}



function processGeojson(geoIn){

    let treedata=[];
    //document.getElementById("message").innerHTML="Berechnung startet ...";

    let countryList = [ 'Schweiz/Suisse/Svizzera/Svizra', '', 'Deutschland', 'Österreich','Slovensko'];
    geoIn.features.forEach(
        (feature) => {
	    if(! countryList.includes(feature.properties.tags['addr:country']))
		countryList.push(feature.properties.tags['addr:country']);
	    treedata.push(reduce(feature));
	});
    
    

    let keylist = {};
    
    treedata.forEach(
        (feature) => {
 	    for (const [key, value] of Object.entries(feature)) {
		keylist[key]=true;
	    }
	}
    )
	
    treedata.forEach(
        (feature) => {
 	    for (const [key, value] of Object.entries(keylist)) {
		if(!feature[key]){
		    feature[key]=null;
		}
	    }
	}
    )
	
    start(true)

    //document.getElementById("message").innerHTML="Tabular startet ...";
    let columns = initColumns(countryList);
    init(treedata,columns);
    //process.stdout.write(JSON.stringify(treedata,null,2));
}


fetch("sorbusdomestica.geojson")
    .then((response) => response.json())
    .then((data) => { processGeojson(data) })



/*
//create Tabulator on DOM element with id "example-table"
var table = new Tabulator("#example-table", {
 	height:205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
 	data:tabledata, //assign data to table
 	layout:"fitColumns", //fit columns to width of table (optional)
 	columns:[ //Define Table Columns
	 	{title:"Name", field:"name", width:150},
	 	{title:"Age", field:"age", hozAlign:"left", formatter:"progress"},
	 	{title:"Favourite Color", field:"col"},
	 	{title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
 	],
});


//trigger an alert message when the row is clicked
table.on("rowClick", function(e, row){ 
	alert("Row " + row.getData().id + " Clicked!!!!");
});
*/



