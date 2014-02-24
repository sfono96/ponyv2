


////////////////////////////////////////////
///////////////// datasets /////////////////
////////////////////////////////////////////

// proficient students by grade
var dashboardProficientByGrade = [{
        name: '4',
        color: "#698B22",
        data: [30, 25, 49, 70, 24,25,10]
    }, {
        name: '3',
        color: "#9ACD32",
        data: [20, 27, 23, 12, 15,25,45]
    }, {
        name: '2',
        color: "#4F94CD",
        data: [35, 45, 14, 12, 35,25,12]
    }, {
        name: '1',
        color: "#36648B",
        data: [29, 10, 24, 10, 25,25,35]
    }];

// below proficient students by grade
var dashboardBelowProficientByGrade = [{
        name: '4',
        color: "#698B22",
        data: [15, 12, 25, 25, 15,25,10]
    }, {
        name: '3',
        color: "#9ACD32",
        data: [20, 27, 23, 12, 15,25,15]
    }, {
        name: '2',
        color: "#4F94CD",
        data: [35, 45, 14, 12, 35,25,12]
    }, {
        name: '1',
        color: "#36648B",
        data: [29, 10, 24, 10, 25,25,45]
    }]

// Proficient students by last 4 weeks
var dashboardProficientByWeek = [{
        name: '4',
        color: "#698B22",
        data: [15, 12, 25, 25, 15,25]
    }, {
        name: '3',
        color: "#9ACD32",
        data: [20, 27, 23, 12, 15,25]
    }, {
        name: '2',
        color: "#4F94CD",
        data: [35, 45, 14, 12, 35,25]
    }, {
        name: '1',
        color: "#36648B",
        data: [29, 10, 24, 10, 25,25]
    }]

// Below proficient students by last 4 weeks
var dashboardBelowProficientByWeek = [{
        name: '4',
        color: "#698B22",
        data: [15, 12, 25, 25, 15,25]
    }, {
        name: '3',
        color: "#9ACD32",
        data: [20, 27, 23, 12, 15,25]
    }, {
        name: '2',
        color: "#4F94CD",
        data: [35, 45, 14, 12, 35,25]
    }, {
        name: '1',
        color: "#36648B",
        data: [29, 10, 24, 10, 25,25]
    }]


// teacher drill down

// scores by teacher
var teacherGrade = [{
        name: '4',
        color: "#698B22",
        data: [15, 12, 25, 25]
    }, {
        name: '3',
        color: "#9ACD32",
        data: [20, 27, 23, 12]
    }, {
        name: '2',
        color: "#4F94CD",
        data: [35, 45, 14, 12]
    }, {
        name: '1',
        color: "#36648B",
        data: [29, 10, 24, 10]
    }]

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

////////////////////////////////////////////
////////////////// X AXIS //////////////////
////////////////////////////////////////////

var grades = ['K','1','2','3','4','5','6']
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
    chart: {
        type: 'column',
        renderTo: 'containerHC1'
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
            text: 'Students By Grade By Score'
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: 'gray'
            },
            formatter:function(){return this.total;}
        },
        labels: false
    },

    tooltip: {
        enabled: false,
        formatter: function() {
            return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        }
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
                    click: function(){proficient = new Highcharts.Chart(optionsProfByWeek);}
                }
            }
        }
    },
    series: dashboardProficientByGrade
};

// Proficient By Week Options
var optionsProfByWeek = {
    chart: {
        type: 'column',
        renderTo: 'containerHC1'
    },
    title: {
        text: 'Grade Level: 6',
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
        enabled: false,
        formatter: function() {
            return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        }
    },
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                color: 'white'

            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    //click: function(){alert ('Category: '+ this.category +', value: '+ this.y);}
                    click: function(){proficient = new Highcharts.Chart(optionsProfByGrade);}
                }
            }
        }
    },
    series: dashboardProficientByWeek
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
            text: 'Students By Grade By Score'
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
        enabled: false,
        formatter: function() {
            return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        }
    },
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                color: 'white',
            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    //click: function(){alert ('Category: '+ this.category +', value: '+ this.y);}
                    click: function(){belowProficient = new Highcharts.Chart(optionsBelowProfByWeek);}
                }
            }
        }
    },
    series: dashboardBelowProficientByGrade
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
        enabled: false,
        formatter: function() {
            return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        }
    },
    plotOptions: {
        column: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                color: 'white'
            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    //click: function(){alert ('Category: '+ this.category +', value: '+ this.y);}
                    click: function(){belowProficient = new Highcharts.Chart(optionsBelowProfByGrade);}
                }
            }
        }
    },
    series: dashboardBelowProficientByWeek
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
        categories: teachers
    },
    yAxis: {
        min: 0,
        gridLineWidth: 0,

        title: {
            text: 'Students By Teacher By Score',
            x: -20 //center
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
        enabled: false,
        formatter: function() {
            return '<b>'+ this.series.name +': '+ this.y +'<br/>';
        }
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: true,
                color: 'white',
            }
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{
                    click: function(){alert ('Category: '+ this.category +', value: '+ this.y);}
                    //click: function(){teacher = new Highcharts.Chart(optionsProfByWeek);}
                }
            }
        }
    },
    series: teacherGrade
};

var optionsTeacherGrowth = {
    chart: {
        type: 'line',
        renderTo: 'containerHC3',
        style:{fontFamily:'Arial'}
    },
    title: {
        text: 'Fractions - February 2014',
        x: -20 //center
    },
    xAxis: {
        categories: ['Attempt 1', 'Attempt 2', 'Attempt 3']
    },
    yAxis: {
        min: 0,
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
    plotOptions:{series:{lineWidth:5,marker:{radius:8,fillColor:'#FFFFFF',lineWidth:6,lineColor:null,symbol:'circle'}}},
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    },
    series: teacherGrowth
};
// chart.renderToDiv, xAxis.categories,yAxis.title.text,plotOptions.series.point.events.click








    











































