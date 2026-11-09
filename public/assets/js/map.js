const mapdiv = document.getElementById('map');
const varid = document.getElementById('variants');
const d = new Date();
let seed = (d.getTime() % 10) * 0.001; // For randomizing data point placement

// Define icon styles
var iconStyles = [
  new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: '#cc2222'
      }),
      radius: 8,
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: '#22aa11'
      }),
      radius: 8,
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: '#ffcc00'
      }),
      radius: 8,
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: 'white'
      }),
      radius: 8,
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: '#cc2222'
      }),
      radius: 12,
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: '#22aa11'
      }),
      radius: 12,
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: '#ffcc00'
      }),
      radius: 12,
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: 'white'
      }),
      radius: 12,
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  })
]

// Set up map
var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
      minZoom: 5,
      maxZoom: 11,
    center: ol.proj.fromLonLat([-117.015, 37.442]),
    zoom: 5.95,
  })
});

// Icon layer
var layer1 = new ol.layer.Vector({
    source: new ol.source.Vector(),
});
map.addLayer(layer1);

// Filter function to only show certain points (public vs internal locations)
function filterPoints(point) {
  // Does not print if it is for internal map
  return !point.hasOwnProperty('isinternal') && point.wastewater.length > 0; 
} 

// Filter points before adding to the map
let fpoints = points.filter(filterPoints); //For excluding internal
//let fpoints = points //For All Points including internal

// Add points
for (let i = 0; i < fpoints.length; i++) {
  let p = fpoints[i];
  p.coord[0] += (Math.random() * (0.03 - seed) + seed);
  p.coord[1] += (Math.random()* (0.03 - seed) + seed);
  let v = " ";
  if (p.hasOwnProperty('variants')) {
    v = p.variants[p.variants.length-1];
  }
  var newpoint = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat(p.coord)),
    name: p.name,
    index: i,
    variant: v,
    style: getstyle(i)
  });
  // Styling from data
  newpoint.setStyle(iconStyles[newpoint.A.style + 4*(i==0)]);
  layer1.getSource().addFeature(newpoint);
}

function getstyle(i) {
  let p = fpoints[i];
  if (p.hasOwnProperty("wastewater")) {
    let d = p.wastewater.filter(n => n !== null && n !== 0);
    if (d[d.length-1] > d[d.length-2]) { // Data increasing
      return 0;
    } else if (d[d.length-1] < d[d.length-2]) { // Data decreasing
      return 1;
    } else { // Data stable
      return 2;
    }
  } else {
    return 3;
  }
}

async function updatechart(index) {
  updatevariants(index);
  myChart.data.datasets = [
    {
      type: 'line',
      label: "Viral Count in Wastewater",
      xAxisID: 'xa',
      yAxisID: 'ya',
      borderColor: 'rgb(109,163,77)',
      backgroundColor: 'rgb(109,163,77)',
      data: fpoints[index].wastewater.map(n => n === 0 ? null : n),
    },
  ]
  let text = fpoints[index].display;
  if (text === '') {text = 'No data available';}
  myChart.options.plugins.title.text = text;
  myChart.update();
}

async function updatechartArchive(index) {
  myChartArchive.data.datasets = [
    {
      type: 'line',
      label: "Viral Count in Wastewater",
      xAxisID: 'xa',
      yAxisID: 'ya',
      borderColor: 'rgb(109,163,77)',
      backgroundColor: 'rgb(109,163,77)',
      data: pointsArchive[index].wastewater.map(n => n === 0 ? null : n),
    },
    {
      type: 'bar',
      label:'Cases',
      xAxisID: 'xb',
      yAxisID: 'yb',
      backgroundColor: 'rgb(200,200,200)',
      data: pointsArchive[index].cases?.map(n => ((n === null || n === 0)) ? "--" : n)
    }
  ]
  let text = pointsArchive[index].display;
  if (text === '') {text = 'No data available';}
  myChartArchive.options.plugins.title.text = text;
  myChartArchive.update();
}

// clickevent for map points
map.on('click', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1.getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index);
    updatechartArchive(index);
  }
});
// Change cursor on hover over points
map.on('pointermove', function (e) {
  const pixel = map.getEventPixel(e.originalEvent);
  const hit = map.hasFeatureAtPixel(pixel);
  mapdiv.style.cursor = hit ? 'pointer' : '';
});

const config = {
  data: {
    datasets:[]
  },
  options: {
    spanGaps: true,
    plugins: {
      title: {
        display: true,
        text: 'Select a location on the map'
      },
      tooltip: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
        callbacks: {
          title:(t)=>{
            let i = labels.indexOf(t[0].label);
            return labels[i];
          },
          label:()=>{},
          afterBody:(t)=>{
            let i = labels.indexOf(t[0].label);
            let j = fpoints.findIndex(e => e.display == myChart.options.plugins.title.text);
            let viral = "--"; let cases = "--";
            if (fpoints[j].hasOwnProperty("wastewater")) viral = fpoints[j].wastewater[Math.floor(i/7)];
            if (fpoints[j].hasOwnProperty("cases")) cases = fpoints[j].cases[i];
            if (viral === null || viral < 0) viral = "--";
            else viral = Math.round(viral);
            return [
              "🟢Viral count: " + viral,
            ];
          },
          footer:(t)=>{
            let i = labels.indexOf(t[0].label);
            let j = fpoints.findIndex(e => e.display == myChart.options.plugins.title.text);
            let text = "--";
            if (fpoints[j].hasOwnProperty("variants")) {
              if (fpoints[j].variants[Math.floor(i/7)]) {
                if (fpoints[j].variants[Math.floor(i/7)]) text = fpoints[j].variants[Math.floor(i/7)];
              }
            }
            return [
              "Variants present during the week:",
              text
            ];
          }
        }
      }
    },
    scales: {
      xa: {
        display: false,
        labels: labels.filter(function(v, i, a) {return i % 7 == 0;})
      },
      xb: {
        position: 'bottom',
        display: true,
        labels: labels,
        ticks: {
          callback: (v) => {
            return labels[v];
          }
        }
      },
      ya: {
        position: 'left',
        title: {
          display: true,
          text: 'Viral counts in wastewater (log 10 gene copies/milliliter)'  // Log data live, use this line now
        }
      },
      yb: {
        position: 'right',
        title: {
          display: true,
          text: 'Case count per 100,000'
        }
      }
    }
  }
};
const myChart = new Chart(document.getElementById('chart1'), config);
var originalGetElementAtEvent = myChart.getElementAtEvent;
myChart.getElementAtEvent = function () {
  return originalGetElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}

const configArchive = {
  data: {
    datasets:[]
  },
  options: {
    spanGaps: true,
    plugins: {
      title: {
        display: true,
        text: 'Select a location on the map'
      },
      tooltip: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
        callbacks: {
          title:(t)=>{
            let i = labelsArchive.indexOf(t[0].label);
            return labelsArchive[i];
          },
          label:()=>{},
          afterBody:(t)=>{
            let i = labelsArchive.indexOf(t[0].label);
            let j = pointsArchive.findIndex(e => e.display == myChartArchive.options.plugins.title.text);
            let viral = "--"; let cases = "--";
            if (pointsArchive[j].hasOwnProperty("wastewater")) viral = pointsArchive[j].wastewater[Math.floor(i/7)];
            if (pointsArchive[j].hasOwnProperty("cases")) cases = pointsArchive[j].cases[i];
            if (viral === null || viral < 0) viral = "--";
            else viral = Math.round(viral);
            if (cases === null || cases < 0) cases = "--";
            return [
              "🟢Viral count: " + viral,
              "⚪Cases: " + cases
            ];
          },
          footer:(t)=>{
            let i = labelsArchive.indexOf(t[0].label);
            let j = pointsArchive.findIndex(e => e.display == myChartArchive.options.plugins.title.text);
            let text = "--";
            if (pointsArchive[j].hasOwnProperty("variants")) {
              if (pointsArchive[j].variants[Math.floor(i/7)]) {
                if (pointsArchive[j].variants[Math.floor(i/7)]) text = pointsArchive[j].variants[Math.floor(i/7)];
              }
            }
            return [
              "Variants present during the week:",
              text
            ];
          }
        }
      }
    },
    scales: {
      xa: {
        display: false,
        labels: labelsArchive.filter(function(v, i, a) {return i % 7 == 0;})
      },
      xb: {
        position: 'bottom',
        display: true,
        labels: labelsArchive,
        ticks:{
          callback:(v)=>{
            return labelsArchive[v];
          }
        }
      },
      ya: {
        position: 'left',
        title: {
          display: true,
          text: 'Viral counts in wastewater (gene copies/milliliter)'
        }
      },
      yb: {
        position: 'right',
        title: {
          display: true,
          text: 'Case count per 100,000'
        }
      }
    }
  }
};
const myChartArchive = new Chart(document.getElementById('chartArchive'), configArchive);
var originalGetElementAtEvent = myChartArchive.getElementAtEvent;
myChartArchive.getElementAtEvent = function () {
  return originalGetElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}

async function updatevariants(index) {
  switch(fpoints[index].name) {
    case "CC":
      varid.setAttribute("width", "1000");
      varid.setAttribute("height", "618");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=560683380&amp;format=interactive");
      break;
    case "CLV":
      varid.setAttribute("width", "940");
      varid.setAttribute("height", "582");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=140065551&format=interactive");
      break;
    case "CH1":
      varid.setAttribute("width", "884");
      varid.setAttribute("height", "547");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=1941403858&format=interactive");
      break;
    case "CH2":
      varid.setAttribute("width", "873");
      varid.setAttribute("height", "540");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=630815701&format=interactive");
      break;
    case "CH3":
      varid.setAttribute("width", "884");
      varid.setAttribute("height", "546");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=595774235&format=interactive");
      break;
    case "NLV":
      varid.setAttribute("width", "836");
      varid.setAttribute("height", "517");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=1746436205&amp;format=interactive");
      break;
    case "BC":
      varid.setAttribute("width", "974");
      varid.setAttribute("height", "602");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=1768505114&format=interactive");
      break;
    // case "BEA":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    // case "PR1":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    // case "PR2":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    // case "PR3":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    case "BD":
      varid.setAttribute("width", "876");
      varid.setAttribute("height", "541");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=1107258497&format=interactive");
      break;
    case "IS":
      varid.setAttribute("width", "911");
      varid.setAttribute("height", "563");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=2007863131&format=interactive");
      break;
    case "LAU":
      varid.setAttribute("width", "900");
      varid.setAttribute("height", "556");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=691866641&format=interactive");
      break;
    case "MV":
      varid.setAttribute("width", "1017");
      varid.setAttribute("height", "628");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=1505524298&format=interactive");
      break;
    case "SL":
      varid.setAttribute("width", "1089");
      varid.setAttribute("height", "673");
      varid.setAttribute("src", "https://docs.google.com/spreadsheets/d/e/2PACX-1vQn4eNFlzkIObeMgY1pftzvvPwiVZjpT-DlrEtun4Hx94q_2sVCq5eVlc2XrpHiCpRosv21c9SNcu0G/pubchart?oid=559246915&format=interactive");
      break;
    // case "TMWRF":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    // case "CAR":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    // case "LLC":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    // case "PH":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    // case "PV":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    // case "JOE":
    //   varid.setAttribute("width", "");
    //   varid.setAttribute("height", "");
    //   varid.setAttribute("src", "");
    //   break;
    default:
      console.log("No variant data available.");
      varid.setAttribute("width", "0");
      varid.setAttribute("height", "0");
      varid.setAttribute("src", "");
  }
}

updatechart(0);
updatechartArchive(0);
updatevariants(0);
