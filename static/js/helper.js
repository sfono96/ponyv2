
// score growth by teacher
var teacherGrowth = [{
    name: 'Teacher A',
    data: [1.2,2.2,2.4]
},{
    name: 'Teacher B',
    data: [1.5,3.2,3.6] 
},{
    name: 'Teacher C',
    data: [2.2,3.1,3.3] 
}]

Highcharts.setOptions({
    chart: {
        style: {
            fontFamily: 'Arial'
        }
    }
});

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

////////////////////////////////////////////
////////////////// X AXIS //////////////////
////////////////////////////////////////////

var grades = ['K','1','2','3','4','5','6']
var grades2 = ['1','2','3','4','5','6']
var gradesText = ['1 - First Grade','2 - Second Grade','3 - Third Grade','4 - Fourth Grade','5 - Fifth Grade','6 - Sixth Grade']
var gradesTextShort = ['First Grade','Second Grade','Third Grade','Fourth Grade','Fifth Grade','Sixth Grade']
var pgradesText = ['4 - Fourth Grade','5 - Fifth Grade','6 - Sixth Grade']
var weeks = ['1/3','1/10','1/17','1/24','1/31','2/7']
var teachers = ['Teacher A','Teacher B','Teacher C','Teacher D']

////////////////////////////////////////////
////////////////// CHARTS //////////////////
////////////////////////////////////////////

var proficient, belowProficient, teacher;

////////////////////////////////////////////
///////////////// OPTIONS //////////////////
////////////////////////////////////////////

var optionsProfByGrade, optionsProfByWeek, optionsBelowProfByGrade, optionsBelowProfByWeek;
var optionsTeacherGrade, optionsTeacherGrowth;

// Proficient By Grade Options
var optionsProfByGrade = {
    chart: {type: 'column',renderTo: 'containerHC1'},
    title: {text: ''},
    xAxis: {
        categories: []
    },
    yAxis: {min: 0,gridLineWidth: 0,
        title: {text: 'Student Scores'},
        stackLabels: {enabled: true,
            style: {fontWeight: 'bold',color: 'gray'},
            //formatter:function(){return this.total;}
        },
        labels: true
    },
    tooltip: {pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',shared: true},
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                color: 'white',
                formatter: function(){return Math.round(this.percentage,2)+'%';}
            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    click: //function(){alert ('Category: '+ this.x +', value: '+ this.y);}
                    //click: function(){proficient = new Highcharts.Chart(optionsProfByWeek);}
                    function(){
                        // this function will change the options
                        optionsProfByWeek.title.text = this.category; // New Title for grade
                        url = '/api/dash1/all/'+gradesText[this.x] // return back to this format '1 - First Grade'
                        optionsProfByWeek.series = JSON.parse(httpGet(url))[0] // Get the new data from the api (pass the url)
                        optionsProfByWeek.xAxis.categories = JSON.parse(httpGet(url))[1]
                        new Highcharts.Chart(optionsProfByWeek)
                        $('#rowbutton').slideToggle("350");
                    }
                }
            }
        }
    },
    series: []
};

// Proficient By Week Options
var optionsProfByWeek = {
    chart: {
        type: 'column',
        renderTo: 'containerHC1'
    },
    title: {
        text: '',
        align: 'left'
    },
    xAxis: {
        categories: weeks
    },
    yAxis: {
        min: 0,
        gridLineWidth: 0,

        title: {
            text: 'Students By Week By Score'
        },
        stackLabels: {
            enabled: false,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        },
        labels: false
    },
    tooltip: {
        //enabled: false,
        // formatter: function() {
        //     return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        // },
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        shared: true
    },
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                color: 'white',
                formatter: function(){return Math.round(this.percentage,2)+'%';}

            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    //click: function(){alert ('Category: '+ this.category +', value: '+ this.y);}
                    //click: function(){new Highcharts.Chart(optionsProfByGrade);}
                    click: function(){
                        var grade = gradesText[gradesTextShort.indexOf(optionsProfByWeek.title.text)]
                        var assessment = this.category
                        url = '/teacher/'+grade+'/'+assessment
                        window.location.href = url
                    }
                }
            }
        }
    },
    series: []
};

// Proficient By Grade Options
var optionsBelowProfByGrade = {
    chart: {
        type: 'column',
        renderTo: 'containerHC2'
    },
    title: {
        text: ''
    },
    xAxis: {
        categories: grades
    },
    yAxis: {
        min: 0,
        gridLineWidth: 0,

        title: {
            text: 'Student Scores'
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        },
        labels: false
    },
    tooltip: {
        // enabled: false,
        // formatter: function() {
        //     return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        // },
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        shared: true
    },
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                color: 'white',
                formatter: function(){return Math.round(this.percentage,2)+'%';}
            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    //click: function(){alert ('Category: '+ this.category +', value: '+ this.y);}
                    click: function(){
                        // this function will change the options
                        optionsBelowProfByWeek.title.text = this.category; // New Title for grade
                        url = '/api/dash1/belowProf/'+pgradesText[this.x] // return back to this format '1 - First Grade'
                        optionsBelowProfByWeek.series = JSON.parse(httpGet(url))[0] // Get the new data from the api (pass the url)
                        optionsBelowProfByWeek.xAxis.categories = JSON.parse(httpGet(url))[1]
                        new Highcharts.Chart(optionsBelowProfByWeek) 
                    }
                }
            }
        }
    },
    series: []
};

// Below Proficient By Week Options
var optionsBelowProfByWeek = {
    chart: {
        type: 'column',
        renderTo: 'containerHC2'
    },
    title: {
        text: 'Grade Level: 3',
        align: 'left'
    },
    xAxis: {
        categories: weeks
    },
    yAxis: {
        min: 0,
        gridLineWidth: 0,

        title: {
            text: 'Students By Week By Score'
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        },
        labels: false
    },
    tooltip: {
        // enabled: false,
        // formatter: function() {
        //     return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        // },
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        shared: true
    },
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                color: 'white',
                formatter: function(){return Math.round(this.percentage,2)+'%';}

            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    //click: function(){alert ('Category: '+ this.category +', value: '+ this.y);}
                    click: function(){new Highcharts.Chart(optionsBelowProfByGrade);}
                }
            }
        }
    },
    series: []
};


////////////////////////////////////////////////////// TEACHER DRILL DOWN //////////////////////////////////////////////////////

// Teacher Grade
var optionsTeacherGrade = {
    chart: {
        type: 'column',
        renderTo: 'containerHC3',
        style:{fontFamily:'Roboto'}
    },
    title: {
        text: 'Fractions - February 2014'
    },
    xAxis: {
        categories: teachers,
        labels:{enabled: false},
    },
    yAxis: {
        min: 0,
        gridLineWidth: 0,

        title: {
            text: 'Students By Teacher By Score',
            x: 0 //center
        },
        stackLabels: {
            enabled: false,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        },
        labels: true
    },
    tooltip: {
        // enabled: false,
        // formatter: function() {
        //     return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        // },
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        shared: false
    },
    legend:{enabled:false},
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                color: 'white',
                formatter: function(){return Math.round(this.percentage,2)+'%';}
            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    //click: function(){alert ('Category: '+ this.category +', value: '+ this.series.name);}
                    click: function(){ oTable.fnMultiFilter({"teacher":this.category,"hs":this.series.name}); }
                    //click: function(){teacher = new Highcharts.Chart(optionsProfByWeek);}
                }
            }
        }
    },
    series: []
};

var optionsTeacherGrowth = {
    chart: {
        type: 'line',
        renderTo: 'containerHC3',
    },
    title: {
        text: ''
    },
    xAxis: {
        categories: ['Attempt 1', 'Attempt 2', 'Attempt 3']
    },
    yAxis: {
        // min: ,
        // max: 4,
        gridLineWidth: .25,
        title: {
            text: 'Growth By Teacher'
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    },
    plotOptions:{series:{lineWidth:5,marker:{radius:6,fillColor:'#FFFFFF',lineWidth:4,lineColor:null,symbol:'circle'}}},
    legend: {
        enabled: false,
        // layout: 'vertical',
        // align: 'right',
        // verticalAlign: 'middle',
        // borderWidth: 0
    },
    series: teacherGrowth
};
// chart.renderToDiv, xAxis.categories,yAxis.title.text,plotOptions.series.point.events.click

///////////////////////////// STUDENT DRILL DOWN CHARTS ////////////////////////////////////////////////

var optionsStudentCurrent = {
    chart: {
        // plotBackgroundColor: null,
        // plotBorderWidth: null,
        // plotShadow: false,
        margin: [0, 0, 0, 0],
        spacingTop: 0,
        spacingBottom: 0,
        spacingLeft: 0,
        spacingRight: 0,
        renderTo: 'containerHC4'
    },
    title: {
        text: ''
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    plotOptions: {
        pie: {
            size: '100%',
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        }
    },
    legend:{enabled:true,layout:'vertical',align:'right',verticalAlign:"middle"},
    series: [{  
        type: 'pie',
        name: 'Score Distribution',
        data: [
            ['4',45.0],
            ['3',26.8],
            ['2',8.5],
            ['1',6.2],
        ]
    }]
}

var optionsStudentHistorical = {
    chart: {
        type: 'line',
        renderTo: 'containerHC5',
    },
    title: {
        text: 'Historical: CRT Math'
    },
    xAxis: {
        categories: ['2011', '2012', '2013','2014'],
        // plotLines: [{
        //     color: 'orange',
        //     width: 4,
        //     value: 2.5,
        //     dashStyle:'Dash'
        // }]
    },
    yAxis: {
        // min: ,
        // max: 4,
        gridLineWidth: .25,
        title: {
            text: 'Growth By Teacher'
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    },
    plotOptions:{series:{lineWidth:5,marker:{radius:6,fillColor:'#FFFFFF',lineWidth:4,lineColor:null,symbol:'circle'}}},
    legend: {
        enabled: true,
        // layout: 'vertical',
        // align: 'right',
        // verticalAlign: 'middle',
        // borderWidth: 0
    },
    series: [{
        name: 'Student',
        data:[randomIntFromInterval(160,180),randomIntFromInterval(160,182),randomIntFromInterval(165,185)]
    },{
        name: 'School Avg',
        data:[164.2,167.3,174.3],
        dashStyle:'Dot'
    },{
        name: 'State Avg',
        data:[167.2,171.3,179.3],
        dashStyle:'Dot'
    }]
};

function httpGet(theUrl)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

// post_to_url('/contact/', {name: 'Johnny Bravo'});


































