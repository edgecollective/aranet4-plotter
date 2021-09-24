
function setActiveIcon(marker) {
    marker.setIcon(divIconActive);
  };

  
function makeImageMap(docid,map_url,feeds,colors)
{
    //console.log(feeds);
    console.log("map colors:",colors);


    var map = L.map(docid, {
        minZoom: 1,
        maxZoom: 4,
        center: [0, 0],
        zoom: 3,
        crs: L.CRS.Simple
      });

      var w = 725,
      h = 481;
      var url = map_url;

      //var url = "/images/a2floor.png";

      var southWest = map.unproject([0, h], map.getMaxZoom()-1);
          var northEast = map.unproject([w, 0], map.getMaxZoom()-1);
          var bounds = new L.LatLngBounds(southWest, northEast);
      
          // add the image overlay, 
          // so that it covers the entire map
          L.imageOverlay(url, bounds).addTo(map);
      
          // tell leaflet that the map is exactly as big as the image
          map.setMaxBounds(bounds);
      
       console.log('got here');

       var locationLayer = new L.FeatureGroup();
       var markerTemp = L.marker();
     
       //var markerData = [];
       for(var i = 0; i < feeds.length; i++) {
           var feed_shortkey = feeds[i].feed_pubkey.substring(0,4);
           var x = feeds[i].coords.x;
           var y = feeds[i].coords.y;
           var coords = feeds[i].coords;
           var shortkey = feeds[i].name;
           console.log(shortkey);

           var htmlString = "<div style='background-color:white;' class='marker-pin'></div><i class='material-icons' style='color:"+colors[i]+"'><b>\""+shortkey.toString()+"\"</b></i>";
           //markerData.push({"feed_shortkey":feed_shortkey,"coords":[x,y]});

           var icon = L.divIcon({
            className: 'custom-div-icon',
            html: htmlString,
            iconSize: [10, 42],
            iconAnchor: [15, 42]
            });

            console.log(x,y);

            var marker = L.marker([x,y], {
                //icon: divIcon,
                icon: icon,
                id: i
              });

            marker.addTo(map);
           
        }   

}
    
    
    function makeChart(docid,bdata,param_key)
{
    //console.log(param_key);

    
    var ctx = document.getElementById(docid).getContext('2d');

    //resize canvas

    var param_vs_time = [];
            for(var i = 0; i < bdata.length; i++) {
            var thisco2 = bdata[i].parameters[param_key];
            var timeutc = bdata[i].timestamp;
            var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
            param_vs_time.push({"t":localtime,"y":thisco2})
            }
    
    console.log(param_vs_time);

    var chart = new Chart(ctx, {
        type: 'line',
        data: {
        datasets: [{
        label: param_key,
        lineTension: 0,
        bezierCurve: false,
        fill: true,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: param_vs_time
        }]
        },
        // Configuration options go here
        options: {
        scales: {
        xAxes: [{
        type: 'time',
        distribution: 'linear',
        ticks: {
        major: {
        enabled: true, // <-- This is the key line
        fontStyle: 'bold', //You can also style these values differently
        fontSize: 14, //You can also style these values differently
        },
        },
        }],
        },
        zone: "America/NewYork"
        }
        });
}


function makeNodeChartSubset(docid,feed_pubkey,plot_param,limit,node_id,co2_ambient,start,stop,expofit_vs_time) {

    const dataurl = '/data/'+feed_pubkey+'/json/'+node_id+'?limit='+limit;

    //const dataurl = '/data/'+feed_pubkey+'/json/'+node_id;
    var canvas = document.getElementById(docid);
    var ctx = document.getElementById(docid).getContext('2d');

    //ctx.canvas.width  = window.innerWidth;
    //ctx.canvas.height = window.innerHeight;
    //ctx.canvas.width  = window.innerWidth;
    //ctx.canvas.height = window.innerHeight;

    fetch(dataurl)
        .then(response => response.json())
        .then(bdata => {

            var data = bdata.data;

            colors=[];
            var datasets =[];
            value_vs_time = [];
            subset_vs_time = [];

            for (var i = 0; i< data.length; i++) {
                var params=data[i].parameters;
                var timeutc = data[i].timestamp;
                var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
                var plot_value = params[plot_param];
                value_vs_time.push({"x":localtime,"y":plot_value});
                if ((i>=start) && (i<stop)) {
                    subset_vs_time.push({"x":localtime,"y":plot_value});
                }
            }

            console.log(value_vs_time);

            

            

            var chartcolor = "green";
            var value_set = {
                type: 'scatter',
                data:value_vs_time,
                label:"CO2 PPM",
                //"label":feed_shortname,
                borderColor: chartcolor,
                fill:true,
                //"spanGaps":false,
                //"showLine":false,
                //lineTension:0
            }
            datasets.push(value_set);

            var chartcolor = "red";
            var subset_set = {
                type: 'scatter',
                data:subset_vs_time,
                label:"Event",
                //"label":feed_shortname,
                borderColor: chartcolor,
                fill:true,
                pointBackgroundColor: "red", // wite point fill
                pointBorderWidth: 1 // point border width
                //"spanGaps":false,
                //"showLine":false,
                //lineTension:0
            }
            datasets.push(subset_set);

            var chartcolor = "purple";
            var exp_set = {
                type: 'line',
                data:expofit_vs_time,
                label:"Fit",
                //"label":feed_shortname,
                borderColor: chartcolor,
                fill:true,
                pointRadius: 0
                //"spanGaps":false,
                //"showLine":false,
                //lineTension:0
            }
            datasets.push(exp_set);

            var chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                    datasets: datasets
                    },
                    // Configuration options go here
                    options: {
                        /*title: {
                            display: true,
                            text: param_key
                        },*/
                        tooltips: {
                            mode: 'single',
                            callbacks: {
                                afterBody: (data) => {
                                    if(data && data[0])
                                    selectedPoint = data[0];
                                    return [''];
                                }
                            }
                        },
                        legend: {
                            labels: {
                                fontStyle: 'bold', //You can also style these values differently
                            }
                        },
                    scales: {
                    xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    ticks: {
                    major: {
                    enabled: true, // <-- This is the key line
                    fontStyle: 'bold', //You can also style these values differently
                    fontSize: 14, //You can also style these values differently
                    },
                    },
                    }],
                    yAxes: [{
                        display:true,
                        labelString: plot_param
                    }]
                    },
                    zone: "America/NewYork"
                    }
                    });

            });

}


function makeNodeChart(docid,feed_pubkey,plot_param,limit,node_id,co2_ambient) {

    //const dataurl = '/data/'+feed_pubkey+'/json/'+node_id;
    const dataurl = '/data/'+feed_pubkey+'/json/'+node_id+'?limit='+limit;
    
    //const dataurl = '/data/'+feed_pubkey+'/json?limit='+limit;
    
    var canvas = document.getElementById(docid);
    var ctx = document.getElementById(docid).getContext('2d');

    fetch(dataurl)
        .then(response => response.json())
        .then(bdata => {

            var data = bdata.data;


            colors=[];
            var datasets =[];
            value_vs_time = [];

            for (var i = 0; i< data.length; i++) {
                var params=data[i].parameters;
                var timeutc = data[i].timestamp;
                var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
                var plot_value = params[plot_param];
                value_vs_time.push({"x":localtime,"y":plot_value});
            }

            console.log(value_vs_time);

            var chartcolor = "green";
            var value_set = {
                type: 'scatter',
                data:value_vs_time,
                label:"CO2 PPM",
                //"label":feed_shortname,
                borderColor: chartcolor,
                fill:true,
                //"spanGaps":false,
                //"showLine":false,
                //lineTension:0
            }
            datasets.push(value_set);

            var chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                    datasets: datasets
                    },
                    // Configuration options go here
                    options: {
                        /*title: {
                            display: true,
                            text: param_key
                        },*/
                        tooltips: {
                            mode: 'single',
                            callbacks: {
                                afterBody: (data) => {
                                    if(data && data[0])
                                    selectedPoint = data[0];
                                    return [''];
                                }
                            }
                        },
                        legend: {
                            labels: {
                                fontStyle: 'bold', //You can also style these values differently
                            }
                        },
                    scales: {
                    xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    ticks: {
                    major: {
                    enabled: true, // <-- This is the key line
                    fontStyle: 'bold', //You can also style these values differently
                    fontSize: 14, //You can also style these values differently
                    },
                    },
                    }],
                    yAxes: [{
                        display:true,
                        labelString: plot_param
                    }]
                    },
                    zone: "America/NewYork"
                    }
                    });


           //var canvas = document.getElementById('myChart');
           var overlay = document.getElementById('overlay');
           var startIndex = 0;
           overlay.width = canvas.width;
           overlay.height = canvas.height;
           var selectionContext = overlay.getContext('2d');
           var selectionRect = {
             w: 0,
             startX: 0,
             startY: 0
           };
           var drag = false;
           canvas.addEventListener('pointerdown', evt => {
             const points = chart.getElementsAtEventForMode(evt, 'index', {
               intersect: false
             });
             startIndex = points[0]._index;
             const rect = canvas.getBoundingClientRect();
            
             selectionRect.startX = evt.clientX - rect.left;
             selectionRect.startY = chart.chartArea.top;
             drag = true;
             // save points[0]._index for filtering
           });
           canvas.addEventListener('pointermove', evt => {
             
		   const rect = canvas.getBoundingClientRect();
             if (drag) {
               const rect = canvas.getBoundingClientRect();
               selectionRect.w = (evt.clientX - rect.left) - selectionRect.startX;
               selectionContext.globalAlpha = 0.5;
               selectionContext.clearRect(0, 0, canvas.width, canvas.height);
               selectionContext.fillRect(selectionRect.startX,
                 selectionRect.startY,
                 selectionRect.w,
                 chart.chartArea.bottom - chart.chartArea.top);
             } else {
               selectionContext.clearRect(0, 0, canvas.width, canvas.height);
               var x = evt.clientX - rect.left;
		     console.log("evt.clientX=",evt.clientX);

               if (x > chart.chartArea.left) {
                 selectionContext.fillRect(x,
                   chart.chartArea.top,
                   1,
                   chart.chartArea.bottom - chart.chartArea.top);
               }
             }
           });
           canvas.addEventListener('pointerup', evt => {
           
             const points = chart.getElementsAtEventForMode(evt, 'index', {
               intersect: false
             });
             drag = false;
             console.log("start:",startIndex);
             console.log("end:",points[0]._index);
             makeFit('myFit',feed_pubkey,plot_param,limit,node_id,co2_ambient,startIndex,points[0]._index,docid);
             //console.log('implement filter between ' + options.data.labels[startIndex] + ' and ' + options.data.labels[points[0]._index]);  
           });

            });


}

function makeFit(docid,feed_pubkey,plot_param,limit,node_id,co2_ambient,start,end,main_docid) {
    
    //var this_baseline = document.getElementById("baseline").innerHTML;
    //var this_baseline = document.getElementById("new_baseline").value;
    
    //co2_ambient = parseInt(this_baseline);

    //console.log("this_baseline:",this_baseline);

    console.log("stuff:",docid,feed_pubkey,plot_param,limit,node_id);

    console.log("co2_ambient:",co2_ambient);

    const dataurl = '/data/'+feed_pubkey+'/json/'+node_id+'?limit='+limit;

    //const dataurl = '/data/'+feed_pubkey+'/json/'+node_id;
    
    var ctx = document.getElementById(docid).getContext('2d');

    var main_ctx = document.getElementById(main_docid).getContext('2d');

    var colorBase = ["red","blue","green","purple","yellow"];

    var y_initial;

    fetch(dataurl)
        .then(response => response.json())
        .then(bdata => {

            var data = bdata.data;

            /*
            if (limit > data.length) {
                limit = data.length;
            }
            */
            
            //console.log(unique_nodes);

            colors=[];

            var datasets =[];
            var main_datasets = [];
            
            subset_vs_time = [];
            tofit_vs_time = [];
            fit_vs_time = [];
            tofit_data = [];

            //co2_ambient = 420;

            y_initial = data[start].parameters[plot_param];
            t_initial_hours = luxon.DateTime.fromISO(data[start].timestamp).toLocal().toSeconds()/3600;

            var tf_hours = 0;

            var ti_hours = 0;
            
            for (var i = start; i< end; i++) {
                var params=data[i].parameters;
                var timeutc = data[i].timestamp;
                var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
                var t_current_hours = luxon.DateTime.fromISO(timeutc).toLocal().toSeconds()/3600;
                var t_delta_hours = t_current_hours-t_initial_hours;
                tf_hours = t_delta_hours;
                
                var plot_value = params[plot_param];

                if (i==start) {
                    ti_hours=t_delta_hours;
                }
                subset_vs_time.push({"x":localtime,"y":plot_value});
                
                
                var tofit_value = Math.log((plot_value-co2_ambient)/(y_initial-co2_ambient));

                tofit_vs_time.push({"x":t_delta_hours,"y":tofit_value});

                tofit_data.push([t_delta_hours,tofit_value])
                //var fit_value = tofit_value*1.1;


                //fit_vs_time.push({"x":i,"y":fit_value});

            }

            const result = regression.linear(tofit_data,{ precision: 4 });
            console.log("result:",result.equation);
            var slope = result.equation[0];
            var intercept = result.equation[1];
            var r2 = result.r2;

            var r2String = r2.toFixed(2).toString();

            var ACHString = (-1*slope.toFixed(2)).toString();

            var slopeString = (slope.toFixed(2)).toString();
            var interceptString = (intercept.toFixed(2)).toString();

            
            document.getElementById('fitval').innerHTML = "<b>ACH</b>: "+ACHString;


            document.getElementById('linear').innerHTML = "<b>slope</b>: "+slopeString+"; <b>intercept</b>: "+interceptString+"; <b>R2</b>:"+r2String;
            
            //console.log(value_vs_time);

            /*
            var chartcolor = "blue";
            console.log(chartcolor);
            var dataset = {
                "data":value_vs_time,
                "label":"Node_"+node_id,
                //"label":feed_shortname,
                "borderColor": chartcolor,
                "fill":true,
                //"spanGaps":false,
                //"showLine":false,
                "lineTension":0
            }
            datasets.push(dataset);
            */
            
            //plot on original dataset
            
            var chartcolor = "blue";
            var tofit_set = {
                type: 'scatter',
                data:tofit_vs_time,
                label:"ln[(co2-co2_ambient)/co2[t=0]-co2_ambient)]",
                //"label":feed_shortname,
                borderColor: chartcolor,
                fill:true,
                //"spanGaps":false,
                //"showLine":false,
                //lineTension:0
            }
            datasets.push(tofit_set);

            //f1 = [0,intercept];

            //t_final = tofit_data[limit -1][0]; 

            fit_vs_time.push({"x":ti_hours,"y":intercept});
            fit_vs_time.push({"x":tf_hours,"y":slope*tf_hours+intercept});

            console.log(fit_vs_time);

            var chartcolor = "red";
            var fit_set = {
                "type": "line",
                "data":fit_vs_time,
                "label":"linear fit",
                //"label":feed_shortname,
                "borderColor": chartcolor,
                "fill":false,
                //"spanGaps":false,
                //"showLine":false,
                "lineTension":0,
                
            }
            datasets.push(fit_set);

            
            var chart = new Chart(ctx, {
                type: 'scatter',
                data: {
                datasets: datasets
                },
                options: {
                    scales: {
                        xAxes: [{
                            display:true,
                            labelString: "hours"
                        }]
                    }
                }
                });
            
            
                // add the exponential fit

                expfit_vs_time=[];

                for (var i=0;i<subset_vs_time.length;i++) {
                   
                    var current_time_hours = tofit_vs_time[i].x;
                    var localtime = subset_vs_time[i].x;
                    var exp_arg = slope*current_time_hours;
                    var amplitude = y_initial-co2_ambient;
                    var exp_fit = amplitude*Math.exp(exp_arg)+co2_ambient+amplitude*intercept;
                    //var exp_fit = amplitude*Math.exp(exp_arg)+co2_ambient;

                    expfit_vs_time.push({"x":localtime,"y":exp_fit});
                }
                /*
                for (var i = start; i< end; i++) {
                    var params=data[i].parameters;
                    var timeutc = data[i].timestamp;
                    var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
                    
                    var exp_fit = y_initial*np.exp(exp_arg)+co2_outside+amplitude*intercept

                    value_vs_time.push({"x":localtime,"y":plot_value});
                    var plot_value = params[plot_param];
    
                    if (i==start) {
                        ti_hours=t_delta_hours;
                    }
                    subset_vs_time.push({"x":localtime,"y":plot_value});
                    
                    
                    var tofit_value = Math.log((plot_value-co2_ambient)/(y_initial-co2_ambient));
    
                    tofit_vs_time.push({"x":t_delta_hours,"y":tofit_value});
    
                    tofit_data.push([t_delta_hours,tofit_value])
                    //var fit_value = tofit_value*1.1;
    
    
                    //fit_vs_time.push({"x":i,"y":fit_value});
    
                }
                */


            makeNodeChartSubset('exponential',feed_pubkey,plot_param,limit,node_id,co2_ambient,start,end,expfit_vs_time);


            
        
            //chart.options.scales.yAxes[ 0 ].scaleLabel.labelString = "New Label";

            //console.log(bdata);
        });

}


function makeDefaultOverlay(docid,feed_pubkey,plot_param,limit) {
    console.log(docid,feed_pubkey,plot_param,limit);

    //const dataurl = '/data/'+feed_pubkey+'/json/';
    const dataurl = '/data/'+feed_pubkey+'/json?limit='+limit;
    var ctx = document.getElementById(docid).getContext('2d');

    var colorBase = ["red","blue","green","purple","yellow","red","blue","green","purple"];

    
    fetch(dataurl)
        .then(response => response.json())
        .then(bdata => {

            var data = bdata.data;

            
        node_list=[];
        
            
            //for (var i = 0; i< limit; i++) {
            for (var i = 0; i<data.length;i++) {
            
                var params=data[i].parameters;
                //console.log(params);
                node_list.push({"node_id":params.node_id});

            }

            //console.log(node_list);
            //const unique_nodes = [...new Set(bdata.map(item => item.node_id))]; 
            let unique_nodes_all = [...new Set(node_list.map(item => item.node_id))].sort();
            var unique_nodes = unique_nodes_all.filter(function (el) {
                return el != null;
              });
            
            console.log("uniques:",unique_nodes);

            colors=[];

            unique_nodes.forEach(function (value, i) {
                colors.push(colorBase[i%unique_nodes.length]);
                console.log('%d: %s', i, value);
            });

            colors=["red","blue","green","purple","yellow","red","blue","green","purple"];

            console.log("all colors:",colors);

            var datasets =[];
            
            
            unique_nodes.forEach(node=>
                {
                    
                    if (node>=0) { //don't do the gateway node
                        //console.log(node);
                        //console.log(plot_param);
                    value_vs_time = [];
                    for (var i = 0; i< data.length; i++) {
                        console.log("i=",i);

                        var params=data[i].parameters;
                        //console.log("params:",params);

                        if (params.node_id==node) {
                            var timeutc = data[i].timestamp;
                            var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
                            var plot_value = params[plot_param];
                            //console.log(plot_value);
                            value_vs_time.push({"t":localtime,"y":plot_value});
                        }
                    }
                    //console.log(value_vs_time);
                    console.log("node#:");
                    console.log(node);
                    var chartcolor = colors[node];
                    console.log("color! -- ");
                    console.log(chartcolor);
                    var dataset = {
                        "data":value_vs_time,
                        "label":"Node_"+node,
                        //"label":feed_shortname,
                        "borderColor": chartcolor,
                        "fill":true,
                        //"spanGaps":false,
                        //"showLine":false,
                        "lineTension":0
                    }
                    datasets.push(dataset);
                }
                });

                //console.log(datasets);

                yAxesOptions={
                    display:true,
                    labelString: plot_param,
                }

                if (plot_param=="co2_ppm") {
                    console.log("oh yeah");
                    yAxesOptions={
                        display:true,
                        labelString: plot_param,
                        ticks: {
                            suggestedMin: 400,
                            suggestedMax: 2000
                        }
                    }
                }

                var chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                    datasets: datasets
                    },
                    // Configuration options go here
                    options: {
                        /*title: {
                            display: true,
                            text: param_key
                        },*/
                        animation: {
                            duration: 0
                        },
                        legend: {
                            labels: {
                                fontStyle: 'bold', //You can also style these values differently
                            }
                        },
                    scales: {
                    xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    ticks: {
                    major: {
                    enabled: true, // <-- This is the key line
                    fontStyle: 'bold', //You can also style these values differently
                    fontSize: 14, //You can also style these values differently
                    },
                    },
                    }],
                    yAxes: [yAxesOptions]
                    },
                    zone: "America/NewYork"
                    }
                    });

            //console.log(bdata);
        });

}




function makeChartOverlay(docid,bayoudata,param_key,colors)
{
    console.log("chart colors:",colors);

    //console.log(param_key);
    console.log(bayoudata.length);
    console.log(bayoudata);


    var bdata=bayoudata[0];

    var ctx = document.getElementById(docid).getContext('2d');

    //resize canvas
    var datasets =[];
    //var colors = ['red','green','blue','purple','yellow'];
    var feedcount=0;

    bayoudata.forEach(feed =>
    {
        //var feed = element.data;
        var feed_pubkey = feed.feedjson.feed_pubkey;
        var feed_nickname = feed.feed_nickname;
        var feed_data = feed.feedjson.data;

        console.log("feed_pubkey:", feed_pubkey);
        console.log("feed_nickname:",feed_nickname);

        var param_vs_time = [];
        for(var i = 0; i < feed_data.length; i++) {
            var thisco2 = feed_data[i].parameters[param_key];
            var timeutc = feed_data[i].timestamp;
            var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
            param_vs_time.push({"t":localtime,"y":thisco2});
        }
        
        var feed_shortname = "\""+feed_pubkey.substr(0,3)+"\"";
        var chartcolor = colors[feedcount];
        console.log(chartcolor);
        var dataset = {
            "data":param_vs_time,
            "label":feed_nickname,
            //"label":feed_shortname,
            "borderColor": chartcolor,
            "fill":true,
            //"spanGaps":false,
            //"showLine":false,
            "lineTension":0
        }
        datasets.push(
            dataset
        );
        feedcount++;
    });    

    var chart = new Chart(ctx, {
        type: 'line',
        data: {
        datasets: datasets
        },
        // Configuration options go here
        options: {
            /*title: {
                display: true,
                text: param_key
            },*/
            legend: {
                labels: {
                    fontStyle: 'bold', //You can also style these values differently
                }
            },
        scales: {
        xAxes: [{
        type: 'time',
        distribution: 'linear',
        ticks: {
        major: {
        enabled: true, // <-- This is the key line
        fontStyle: 'bold', //You can also style these values differently
        fontSize: 14, //You can also style these values differently
        },
        },
        }],
        yAxes: [{
            display:true,
            labelString: plot_param
        }]
        },
        zone: "America/NewYork"
        }
        });
}


function makeNetwork(bayoudata,colors) {

    var w = 1000;
    var h = 600;
    var linkDistance=200;

    var colors = d3.scale.category10();

    
    var bayou_nodes =[];
    var bayou_edges = [];
    
    var hopped_to =[];
    var node_list =[];

    bayoudata.forEach(feed =>
    {
        var feed_pubkey = feed.feedjson.feed_pubkey;
        var feed_nickname = feed.feed_nickname;
        var feed_data = feed.feedjson.data;

        var next_hop=feed_data[feed_data.length-1].parameters.next_hop;
        var node_id=feed_data[feed_data.length-1].parameters.node_id;
        var next_rssi=feed_data[feed_data.length-1].parameters.next_rssi;

        bayou_nodes.push({name:node_id+": "+feed_nickname,node_id:node_id,nickname:feed_nickname});
        
        //console.log(feed_data[feed_data.length-1].parameters)
        console.log("next_hop actual:",feed_data[feed_data.length-1].parameters.next_hop)
        console.log("next_hop:",parseInt(next_hop));

        console.log("node_id actual:",feed_data[feed_data.length-1].parameters.node_id)
        console.log("node_id:",parseInt(node_id));

        if(parseInt(next_hop)>0) {
            bayou_edges.push({source:parseInt(node_id)-1, target:parseInt(next_hop)-1,rssi:parseInt(next_rssi)});
            hopped_to.push(parseInt(next_hop));
            node_list.push(parseInt(node_id));
        }
        

    });
    
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    var hopped_to_unique = hopped_to.filter(onlyUnique);

    /*
    hopped_to_unique.sort(function(a, b) {
        return parseInt(a) - parseInt(b);
    });

    hopped_to_unique.sort();
    */

    console.log("hopped_to_unique:",hopped_to_unique);
    hopped_to_unique.forEach(dest =>
        {
            //console.log("n:",node);
            if (node_list.includes(dest)==false) {
                console.log("repeater:",dest);
                bayou_nodes.push({name:dest+": (repeater)",node_id:dest,nickname:"ghost"});
            }
        })

    bayou_nodes.sort(function(a, b) {
            return parseInt(a.node_id) - parseInt(b.node_id);
    });
    
    //bayou_nodes.sort();

    console.log("bayou_nodes:",bayou_nodes);
    console.log("bayou_edges:",bayou_edges);
    console.log("hopped_to:",hopped_to);
    console.log("node_list:",node_list);

    var dataset = {

    nodes:bayou_nodes,
    edges: bayou_edges
    };

 
    var svg = d3.select("body").append("svg").attr({"width":w,"height":h});

    var force = d3.layout.force()
        .nodes(dataset.nodes)
        .links(dataset.edges)
        .size([w,h])
        .linkDistance([linkDistance])
        .charge([-500])
        .theta(0.1)
        .gravity(0.05)
        .start();

 

    var edges = svg.selectAll("line")
      .data(dataset.edges)
      .enter()
      .append("line")
      .attr("id",function(d,i) {return 'edge'+i})
      .attr('marker-end','url(#arrowhead)')
      .style("stroke","#ccc")
      .style("pointer-events", "none");
    
    var nodes = svg.selectAll("circle")
      .data(dataset.nodes)
      .enter()
      .append("circle")
      .attr({"r":15})
      .style("fill",function(d,i){return colors(i);})
      .call(force.drag)


    var nodelabels = svg.selectAll(".nodelabel") 
       .data(dataset.nodes)
       .enter()
       .append("text")
       .attr({"x":function(d){return d.x;},
              "y":function(d){return d.y;},
              "class":"nodelabel",
              "stroke":"black"})
       .text(function(d){return d.name;});

    var edgepaths = svg.selectAll(".edgepath")
        .data(dataset.edges)
        .enter()
        .append('path')
        .attr({'d': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
               'class':'edgepath',
               'fill-opacity':0,
               'stroke-opacity':0,
               'fill':'blue',
               'stroke':'red',
               'id':function(d,i) {return 'edgepath'+i}})
        .style("pointer-events", "none");

    var edgelabels = svg.selectAll(".edgelabel")
        .data(dataset.edges)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attr({'class':'edgelabel',
               'id':function(d,i){return 'edgelabel'+i},
               'dx':80,
               'dy':0,
               'font-size':13,
               'stroke':'red',
               'fill':'#aaa'});

    edgelabels.append('textPath')
        .data(dataset.edges)
        .attr('xlink:href',function(d,i) {return '#edgepath'+i})
        .style("pointer-events", "none")
        //.text(function(d,i){return 'label '+i});
        .text(function(d){return d.rssi;});

    svg.append('defs').append('marker')
        .attr({'id':'arrowhead',
               'viewBox':'-0 -5 10 10',
               'refX':25,
               'refY':0,
               //'markerUnits':'strokeWidth',
               'orient':'auto',
               'markerWidth':10,
               'markerHeight':10,
               'xoverflow':'visible'})
        .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#ccc')
            .attr('stroke','#ccc');
     

    force.on("tick", function(){

        edges.attr({"x1": function(d){return d.source.x;},
                    "y1": function(d){return d.source.y;},
                    "x2": function(d){return d.target.x;},
                    "y2": function(d){return d.target.y;}
        });

        nodes.attr({"cx":function(d){return d.x;},
                    "cy":function(d){return d.y;}
        });

        nodelabels.attr("x", function(d) { return d.x; }) 
                  .attr("y", function(d) { return d.y; });

        edgepaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                                           //console.log(d)
                                           return path});       

        edgelabels.attr('transform',function(d,i){
            if (d.target.x<d.source.x){
                bbox = this.getBBox();
                rx = bbox.x+bbox.width/2;
                ry = bbox.y+bbox.height/2;
                return 'rotate(180 '+rx+' '+ry+')';
                }
            else {
                return 'rotate(0)';
                }
        });
    });

}
