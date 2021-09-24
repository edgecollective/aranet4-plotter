

function makeNodeChartSubset(docid,data,co2_ambient,start,stop,expofit_vs_time) {

    
    var canvas = document.getElementById(docid);
    var ctx = document.getElementById(docid).getContext('2d');

            
            colors=[];
            var datasets =[];
            value_vs_time = [];
            subset_vs_time = [];

            for (var i = 0; i< data.length; i++) {
                //var params=data[i].parameters;
                var timeutc = data[i].t;
                //var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
                //var plot_value = params[plot_param];
                value_vs_time.push({"x":timeutc,"y":data[i].y});
                if ((i>=start) && (i<stop)) {
                    subset_vs_time.push({"x":timeutc,"y":data[i].y});
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
                        labelString: "co2"
                    }]
                    },
                    zone: "America/NewYork"
                    }
                    });

            

}


function makeFit(docid,data,co2_ambient,start,end,main_docid) {
    
    
    var ctx = document.getElementById(docid).getContext('2d');

    var main_ctx = document.getElementById("myChart").getContext('2d');

    var colorBase = ["red","blue","green","purple","yellow"];

    var y_initial;


        colors=[];

        var datasets =[];
        var main_datasets = [];
        
        subset_vs_time = [];
        tofit_vs_time = [];
        fit_vs_time = [];
        tofit_data = [];

        //co2_ambient = 420;
        console.log(data);

        y_initial = data[start]['y'];
        console.log('y_initial');
        console.log(y_initial);

        t_initial_hours = data[start]['t'].toSeconds()/3600;
        console.log("out:");
        
        console.log(y_initial);
        console.log(t_initial_hours);

        var tf_hours = 0;

        var ti_hours = 0;
        
        for (var i = start; i< end; i++) {
            //var params=data[i].parameters;
            var timeutc = data[i].t;
            //var localtime = luxon.DateTime.fromISO(timeutc).toLocal().toString();
            var t_current_hours = timeutc.toSeconds()/3600;
            var t_delta_hours = t_current_hours-t_initial_hours;
            tf_hours = t_delta_hours;
            
            //var plot_value = params[plot_param];

            if (i==start) {
                ti_hours=t_delta_hours;
            }
            subset_vs_time.push({"x":timeutc,"y":data[i].y});
            
            
            var tofit_value = Math.log((data[i].y-co2_ambient)/(y_initial-co2_ambient));

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
        
        var chartcolor = "blue";
        var tofit_set = {
            type: 'scatter',
            data:tofit_vs_time,
            label:"ln[(co2-co2_ambient)/co2[t=0]-co2_ambient)]",
            borderColor: chartcolor,
            fill:true,
            
        }
        datasets.push(tofit_set);


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

                expfit_vs_time.push({"x":localtime,"y":exp_fit});
            }
          
        makeNodeChartSubset('exponential',data,co2_ambient,start,end,expfit_vs_time);

}

function makeNodeChart(docid,co2_vs_time,co2_ambient) {

    
    var canvas = document.getElementById(docid);
    var ctx = document.getElementById(docid).getContext('2d');
            
            colors=[];
            var datasets =[];
            


            var chartcolor = "blue";
            var value_set = {
                type: 'scatter',
                data:co2_vs_time,
                label:"CO2 PPM",
                borderColor: chartcolor,
                fill:true,
        
            }
            datasets.push(value_set);

            var chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                    datasets: datasets
                    },
                    options: {
                
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
                        labelString: "co2"
                    }]
                    },
                    zone: "America/NewYork"
                    }
                    });


            var xShift = 315;
            xShift=0;
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
             selectionRect.startX = evt.clientX - rect.left- xShift;
             selectionRect.startY = chart.chartArea.top;
             drag = true;
             // save points[0]._index for filtering
           });
           canvas.addEventListener('pointermove', evt => {

             const rect = canvas.getBoundingClientRect();
             console.log("rect_other.left=",rect.left);
             console.log("chartArea.bottom=",chart.chartArea.bottom);

             if (drag) {
                 console.log("dragging!");
               const rect = canvas.getBoundingClientRect();
               selectionRect.w = (evt.clientX - rect.left - xShift) - selectionRect.startX;
               selectionContext.globalAlpha = 0.5;
               selectionContext.clearRect(0, 0, canvas.width, canvas.height);
               selectionContext.fillRect(selectionRect.startX,
                 selectionRect.startY,
                 selectionRect.w,
                 chart.chartArea.bottom - chart.chartArea.top);
             } else {
                console.log("just movin!");
                const rect = canvas.getBoundingClientRect();
               selectionContext.clearRect(0, 0, canvas.width, canvas.height);
               var x = evt.clientX - rect.left-xShift; // crazy add
               console.log("evtx=",evt.clientX);
               console.log("chart bottom=",chart.chartArea.bottom);
               if (x > (chart.chartArea.left-xShift)) {
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
             //console.log(doc_id);
             makeFit('myFit',co2_vs_time,co2_ambient,startIndex,points[0]._index,docid);
             
          
           });

           

}
