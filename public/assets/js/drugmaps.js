//Copy of map.js , for Internal Dashboard
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

//Main Code
//'Codeine', 'EDDP', 'Hydrocodone', 'Methadone', 'Morphine', 'Norfentanyl', 'Oxycodone', 
//'Tramadol', 'Amphetamine', 'Benzoylecgonine', 'Cocaine', 'Ecgonine', 'Ecgonine methyl ester', 
//'MDMA', 'Methamphetamine', 'THC-COOH', 'THC-OH'
const drugName = ['codeine', 'eddp', 'hydrocodone', 'methadone', 'morphine', 
                  'norfentanyl', 'oxycodone', 'tramadol', 'amphetamine', 
                  'benzoylecgonine', 'cocaine', 'ecgonine', 'ecgonine_methyl_ester', 
                  'mdma', 'methamphetamine', 'thccooh', 'thcoh'];
const drugNameMap = [];

var mapdiv = [];
for (let i = 0; i < drugName.length; i++) {
  drugNameMap.push(drugName[i].concat('map'));
  mapdiv.push(document.getElementById(drugNameMap[i]));
}

var map = []
for (let i = 0; i < drugNameMap.length; i++) {
  map.push(
    new ol.Map({
      target: drugNameMap[i],
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
          minZoom: 5,
          maxZoom: 11,
        center: ol.proj.fromLonLat([-115.125,36.124]),
        zoom: 10.0,
      })
    })
  );
}

// Icon layer
var layer1 = [];
for (let i = 0; i < drugName.length; i++) {
  layer1.push(new ol.layer.Vector({source: new ol.source.Vector()}));
}


for (let i = 0; i < drugNameMap.length; i++) {
  map[i].addLayer(layer1[i]);
}


//Point setup: drugpoints is a 2D array in the sequence given by drugName. So drugpoints[0] is the first drug

// Add points
for (let dn = 0; dn < drugName.length; dn++) {
  for (let i = 0; i < drugpoints[dn].length; i++) {
    let p = drugpoints[dn][i];
    p.coord[0] += (Math.random() * (0.03 - seed) + seed);
    p.coord[1] += (Math.random()* (0.03 - seed) + seed);
    let v = " ";
    var newpoint = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat(p.coord)),
      name: p.name,
      index: i,
      variant: v,
      style: getstyle(i, dn)
    });
    // Styling from data
    newpoint.setStyle(iconStyles[newpoint.A.style + 4*(i==0)]);
    layer1[dn].getSource().addFeature(newpoint);
  }
}
function getstyle(i, dn) {
  let p = drugpoints[dn][i];
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

async function updatechart(index, map, drugindex) {
  myChart[drugindex].data.datasets = [
    {
      type: 'line',
      label: "Estimated consumption (mg/person-day) in wastewater",
      xAxisID: 'xa',
      yAxisID: 'ya',
      borderColor: 'rgb(109,163,77)',
      backgroundColor: 'rgb(109,163,77)',
      data: drugpoints[drugindex][index].wastewater.map(n => n === 0 ? null : n),
    },
  ]
  let text = drugpoints[drugindex][index].display;
  if (text === '') {text = 'No data available';}
  myChart[drugindex].options.plugins.title.text = text;
  myChart[drugindex].update();
}

//////////////////////////////////////////////////////////////////////////////////////////
//This is terrible smh but w/e just trying to prototype site fast


// Change cursor on hover over points
map[0].on('pointermove', function (e) {
  const pixel = map[0].getEventPixel(e.originalEvent);
  const hit = map[0].hasFeatureAtPixel(pixel);
  mapdiv[0].style.cursor = hit ? 'pointer' : '';
});
map[1].on('pointermove', function (e) {
  const pixel = map[1].getEventPixel(e.originalEvent);
  const hit = map[1].hasFeatureAtPixel(pixel);
  mapdiv[1].style.cursor = hit ? 'pointer' : '';
});
map[2].on('pointermove', function (e) {
  const pixel = map[2].getEventPixel(e.originalEvent);
  const hit = map[2].hasFeatureAtPixel(pixel);
  mapdiv[2].style.cursor = hit ? 'pointer' : '';
});
map[3].on('pointermove', function (e) {
  const pixel = map[3].getEventPixel(e.originalEvent);
  const hit = map[3].hasFeatureAtPixel(pixel);
  mapdiv[3].style.cursor = hit ? 'pointer' : '';
});
map[4].on('pointermove', function (e) {
  const pixel = map[4].getEventPixel(e.originalEvent);
  const hit = map[4].hasFeatureAtPixel(pixel);
  mapdiv[4].style.cursor = hit ? 'pointer' : '';
});
map[5].on('pointermove', function (e) {
  const pixel = map[5].getEventPixel(e.originalEvent);
  const hit = map[5].hasFeatureAtPixel(pixel);
  mapdiv[5].style.cursor = hit ? 'pointer' : '';
});
map[6].on('pointermove', function (e) {
  const pixel = map[6].getEventPixel(e.originalEvent);
  const hit = map[6].hasFeatureAtPixel(pixel);
  mapdiv[6].style.cursor = hit ? 'pointer' : '';
});
map[7].on('pointermove', function (e) {
  const pixel = map[7].getEventPixel(e.originalEvent);
  const hit = map[7].hasFeatureAtPixel(pixel);
  mapdiv[7].style.cursor = hit ? 'pointer' : '';
});
map[8].on('pointermove', function (e) {
  const pixel = map[8].getEventPixel(e.originalEvent);
  const hit = map[8].hasFeatureAtPixel(pixel);
  mapdiv[8].style.cursor = hit ? 'pointer' : '';
});
map[9].on('pointermove', function (e) {
  const pixel = map[9].getEventPixel(e.originalEvent);
  const hit = map[9].hasFeatureAtPixel(pixel);
  mapdiv[9].style.cursor = hit ? 'pointer' : '';
});
map[10].on('pointermove', function (e) {
  const pixel = map[10].getEventPixel(e.originalEvent);
  const hit = map[10].hasFeatureAtPixel(pixel);
  mapdiv[10].style.cursor = hit ? 'pointer' : '';
});
map[11].on('pointermove', function (e) {
  const pixel = map[11].getEventPixel(e.originalEvent);
  const hit = map[11].hasFeatureAtPixel(pixel);
  mapdiv[11].style.cursor = hit ? 'pointer' : '';
});
map[12].on('pointermove', function (e) {
  const pixel = map[12].getEventPixel(e.originalEvent);
  const hit = map[12].hasFeatureAtPixel(pixel);
  mapdiv[12].style.cursor = hit ? 'pointer' : '';
});
map[13].on('pointermove', function (e) {
  const pixel = map[13].getEventPixel(e.originalEvent);
  const hit = map[13].hasFeatureAtPixel(pixel);
  mapdiv[13].style.cursor = hit ? 'pointer' : '';
});
map[14].on('pointermove', function (e) {
  const pixel = map[14].getEventPixel(e.originalEvent);
  const hit = map[14].hasFeatureAtPixel(pixel);
  mapdiv[14].style.cursor = hit ? 'pointer' : '';
});
map[15].on('pointermove', function (e) {
  const pixel = map[15].getEventPixel(e.originalEvent);
  const hit = map[15].hasFeatureAtPixel(pixel);
  mapdiv[15].style.cursor = hit ? 'pointer' : '';
});
map[16].on('pointermove', function (e) {
  const pixel = map[16].getEventPixel(e.originalEvent);
  const hit = map[16].hasFeatureAtPixel(pixel);
  mapdiv[16].style.cursor = hit ? 'pointer' : '';
});

// clickevent for map points
map[0].on('click', function (evt) {
  const feature = map[0].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[0].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]); 
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[0], 0);
  }
});
map[1].on('click', function (evt) {
  const feature = map[1].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[1].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[1], 1);
  }
});
map[2].on('click', function (evt) {
  const feature = map[2].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[2].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[2], 2);
  }
});
map[3].on('click', function (evt) {
  const feature = map[3].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[3].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[3], 3);
  }
});
map[4].on('click', function (evt) {
  const feature = map[4].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[4].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[4], 4);
  }
});
map[5].on('click', function (evt) {
  const feature = map[5].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[5].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[5], 5);
  }
});
map[6].on('click', function (evt) {
  const feature = map[6].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[6].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[6], 6);
  }
});
map[7].on('click', function (evt) {
  const feature = map[7].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[7].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[7], 7);
  }
});
map[8].on('click', function (evt) {
  const feature = map[8].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[8].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[8], 8);
  }
});
map[9].on('click', function (evt) {
  const feature = map[9].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[9].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[9], 9);
  }
});
map[10].on('click', function (evt) {
  const feature = map[10].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[10].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[10], 10);
  }
});
map[11].on('click', function (evt) {
  const feature = map[11].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[11].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[11], 11);
  }
});
map[12].on('click', function (evt) {
  const feature = map[12].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[12].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[12], 12);
  }
});
map[13].on('click', function (evt) {
  const feature = map[13].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[13].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[13], 13);
  }
});
map[14].on('click', function (evt) {
  const feature = map[14].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[14].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[14], 14);
  }
});
map[15].on('click', function (evt) {
  const feature = map[15].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[15].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[15], 15);
  }
});
map[16].on('click', function (evt) {
  const feature = map[16].forEachFeatureAtPixel(evt.pixel, feature => {return feature;});
  if (feature) {
    layer1[16].getSource().forEachFeature(f => {f.setStyle(iconStyles[f.A.style]);})
    feature.setStyle(iconStyles[feature.A.style+4]);
    // console.log(feature.A.name);
    var index = feature.A.index;
    updatechart(index, map[16], 16);
  }
});

const config = [];
for (let dn = 0; dn < drugName.length; dn++) {
  config.push(
  {
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
              let i = drugdatelabelsv2.indexOf(t[0].label);
              return drugdatelabelsv2[i];
            },
            label:()=>{},
            /*afterBody:(t)=>{ //Don't need this repetitive info
              let i = drugdatelabelsv2.indexOf(t[0].label);
              let j = drugpoints[dn].findIndex(e => e.display == myChart[0].options.plugins.title.text);
              let viral = "--"; let cases = "--";
              if (drugpoints[dn][j].hasOwnProperty("wastewater")) viral = drugpoints[dn][j].wastewater[Math.floor(i/7)];
              if (drugpoints[dn][j].hasOwnProperty("cases")) cases = drugpoints[dn][j].cases[i];
              if (viral === null || viral < 0) viral = "--";
              else viral = Math.round(viral);
              return [
                "🟢'Estimated consumption (mg/person-day): " + viral,
              ];
            },*/
            footer:(t)=>{
              let i = drugdatelabelsv2.indexOf(t[0].label);
              let j = drugpoints[dn].findIndex(e => e.display == myChart[0].options.plugins.title.text);
              let text = "--";
            }
          }
        }
      },
      scales: {
        xa: {
          display: false,
          labels: drugdatelabelsv2.filter(function(v, i, a) {return i % 14 == 0;}) //Every 14 days
        },
        xb: {
          position: 'bottom',
          display: true,
          labels: drugdatelabelsv2,
          ticks: {
            callback: (v) => {
              return drugdatelabelsv2[v];
            }
          }
        },
        ya: {
          position: 'left',
          title: {
            display: true,
            text: 'Milligram per person per day (mg/person-day)'  // Log data live, use this line now
          }
        }
      }
    }
  });
}

//CHART CODE:
const drugNameChart = [];
const myChart = [];
for (let i = 0; i < drugName.length; i++) {
  drugNameChart.push(drugName[i].concat('chart'));
  myChart.push(new Chart(document.getElementById(drugNameChart[i]), config[i]));
}


//var originalGetElementAtEvent = myChart[0].getElementAtEvent;
myChart[0].getElementAtEvent = function () {
  return myChart[0].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[1].getElementAtEvent = function () {
  return myChart[1].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
/*
myChart[2].getElementAtEvent = function () {
  return myChart[2].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[3].getElementAtEvent = function () {
  return myChart[3].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[4].getElementAtEvent = function () {
  return myChart[4].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[5].getElementAtEvent = function () {
  return myChart[5].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[6].getElementAtEvent = function () {
  return myChart[6].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[7].getElementAtEvent = function () {
  return myChart[7].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[8].getElementAtEvent = function () {
  return myChart[8].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[9].getElementAtEvent = function () {
  return myChart[9].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[10].getElementAtEvent = function () {
  return myChart[10].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[11].getElementAtEvent = function () {
  return myChart[11].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[12].getElementAtEvent = function () {
  return myChart[12].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[13].getElementAtEvent = function () {
  return myChart[13].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[14].getElementAtEvent = function () {
  return myChart[14].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[15].getElementAtEvent = function () {
  return myChart[15].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
myChart[16].getElementAtEvent = function () {
  return myChart[16].getElementAtEvent.apply(this, arguments).filter(function (e) {
    return e._datasetIndex == 0;
  });
}
*/
//TODO all 17


for (let i = 0; i < drugNameChart.length; i++) {
  updatechart(0, map[i], i);
}

