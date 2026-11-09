const axiosInstance = axios.create({
  baseURL: window.location.origin,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiGetSiteVisitsByState = async () => {
  try {
    const res = await axiosInstance.get('/site-visits/us');
    return res.data;
  } catch (error) {
    console.error('Error fetching API:', error);
  }
};

const apiGetSiteVisitsByCountry = async () => {
  try {
    const res = await axiosInstance.get('/site-visits/world');
    return res.data;
  } catch (error) {
    console.error('Error fetching API:', error);
  }
};

const extractColumnValues = (rows, key) => {
  return rows.map(row => row[key]);
}

// Generates a map from the US state view count data
const generateUsVisitorMap = (rows, totalVisitors) => {
  const locations = extractColumnValues(rows, 'stateAbbr');
  const stateNames = extractColumnValues(rows, 'stateName');
  const viewCounts = extractColumnValues(rows, 'visitorCount');
  const maxVisitorCount = Math.max(...extractColumnValues(rows, 'visitorCount'));
  const colorscale = [
    [0, 'rgb(205,205,205)'],
    [0.000000000001, 'rgb(153,199,221)'],
    [0.010437370217, 'rgb(124,232,255)'],
    [0.027181074078, 'rgb(85,208,255)'],
    [0.065551925154, 'rgb(85,208,255)'],
    [0.148695586299, 'rgb(0,172,223)'],
    [0.301194211912, 'rgb(0,128,191)'],
    [0.548816618912, 'rgb(0,115,171)'],
    [0.823530377566, 'rgb(0,103,153)'],
    [1, 'rgb(0,82,122)']
  ];

  const trace = [{
    type: 'choropleth',
    locationmode: 'USA-states',
    locations: locations,
    text: stateNames,
    z: viewCounts,
    zmin: 0,
    zmax: maxVisitorCount,
    colorscale: colorscale,
    colorbar: {
      title: 'Number of Visitors',
      thickness: 15,
      x: 0.85, 
      len: 1
    },
    marker: {
      line: {
        color: 'rgb(255,255,255)',
        width: 1
      }
    },
    hovertemplate: '<b>%{text}</b><br>Visitors: %{z}<extra></extra>'
  }];
  const layout = {
    annotations: [
      {
        text: `Total Visitors in the US: ${totalVisitors}`,
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: 1.2,
        showarrow: false,
        font: {
          size: 16
        }
      }
    ],
    geo: {
      resolution: 50,
      scope: 'usa',
      showlakes: false,
      lakecolor: 'rgb(255,255,255)'
    }
  };
  const config = {
    responsive: true
  };

  Plotly.newPlot('usVisitorMap', trace, layout, config, { showLink: false }, { displayModeBar: false });
}

// Generates a map from the country view count data
const generateWorldVisitorMap = (rows, totalVisitors) => {
  const locations = extractColumnValues(rows, 'countryCode');
  const countryNames = extractColumnValues(rows, 'countryName');
  const viewCounts = extractColumnValues(rows, 'visitorCount');
  const maxVisitorCount = Math.max(...extractColumnValues(rows, 'visitorCount'));
  const colorscale = [
    [0, 'rgb(205,205,205)'],
    [0.000000000001, 'rgb(153,199,221)'],
    [0.010437370217, 'rgb(124,232,255)'],
    [0.027181074078, 'rgb(85,208,255)'],
    [0.065551925154, 'rgb(85,208,255)'],
    [0.148695586299, 'rgb(0,172,223)'],
    [0.301194211912, 'rgb(0,128,191)'],
    [0.548816618912, 'rgb(0,115,171)'],
    [0.823530377566, 'rgb(0,103,153)'],
    [1, 'rgb(0,82,122)']
  ];

  const trace = [{
    type: 'choropleth',
    locationmode: 'ISO-3',
    locations: locations,
    text: countryNames,
    z: viewCounts,
    zmin: 1,
    zmax: maxVisitorCount,
    colorscale: colorscale,
    colorbar: {
      title: 'Number of Visitors',
      thickness: 15,
      x: 0.85, 
      len: 1
    },
    marker: {
      line: {
        color: 'rgb(255,255,255)',
        width: 1
      }
    },
    hovertemplate: '<b>%{text}</b><br>Visitors: %{z}<extra></extra>'
  }];
  const layout = {
    annotations: [
      {
        text: `Total Visitors Worldwide: ${totalVisitors}`,
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: 1.2,
        showarrow: false,
        font: {
          size: 16
        }
      }
    ],
    geo: {
      resolution: 50,
      showframe: false,
      showcoastlines: false,
      projection: {
        type: 'robinson'
      }
    }
  };
  const config = {
    responsive: true
  };

  Plotly.newPlot('worldVisitorMap', trace, layout, config, { showLink: false }, { displayModeBar: false });
};

const populateViewCountsAndMaps = async () => {
  try {
    // Counters for total US and worldwide site visits
    let usViewCount = 0;
    let globalViewCount = 0;

    // Call the API and retrieve site visits by state
    const stateRows = await apiGetSiteVisitsByState();

    // Sum together states' view counts for the US view count
    for (i in stateRows) {
      usViewCount += parseInt(stateRows[i].visitorCount);
    }

    // Generate the map
    generateUsVisitorMap(stateRows, usViewCount);

    // Call the API and retrieve site visits by country
    const countryRows = await apiGetSiteVisitsByCountry();

    // Update the view count value for the US
    const us = countryRows.find((row) => row.countryCode === 'USA');
    if (us) us.visitorCount = usViewCount;

    // Sum together countries' view counts for the global view count
    for (j in countryRows) {
      globalViewCount += parseInt(countryRows[j].visitorCount);
    }

    // Replace country names before populating the map
    const countryNameReplacements = [
      ['AX', 'Aland Islands'], // Remove accented letter to prevent map error
      // ['BQ', 'Caribbean Netherlands'], // Use common name
      ['MF', 'Saint Martin (French Side)'], // Expand to prevent map error
      ['CD', 'Democratic Republic of the Congo'], // Disambiguate to prevent map error
      ['CG', 'Republic of the Congo'], // Disambiguate
      ['CW', 'Curacao'], // Remove accented letter to prevent map error
      ['BN', 'Brunei'], // Use common name
      ['CI', 'Ivory Coast'], // Use common name
      ['CZ', 'Czechia'], // Use current name
      ['KP', 'North Korea'], // Use common name
      ['IR', 'Iran'], // Use common name
      ['LA', 'Laos'], // Use common name
      ['MK', 'North Macedonia'], // Use current name
      ['KR', 'South Korea'], // Use common name
      ['MD', 'Moldova'], // Use common name
      ['RU', 'Russia'], // Use common name
      ['PS', 'Palestine'], // Use common name
      ['SZ', 'Swaziland'], // Use current name
      ['SY', 'Syria'], // Use common name
      ['TW', 'Taiwan'], // Use common name
      ['GB', 'United Kingdom'], // Use common name
      ['TZ', 'Tanzania'], // Use common name
      ['US', 'United States'], // Use common name
      ['VE', 'Venezuela'], // Use common name
      ['VN', 'Vietnam'], // Use common name
      ['VG', 'British Virgin Islands'], // Expand to prevent map error
      ['VI', 'United States Virgin Islands'] // Use common name
    ];
    
    for (const p in countryNameReplacements) {
      const c = countryRows.find(row => row.countryCode === countryNameReplacements[p][0]);
      if (c) c.countryName = countryNameReplacements[p][1];
    }

    // Generate the map
    generateWorldVisitorMap(countryRows, globalViewCount);
  } catch (error) {
    console.error('Error populating maps:', error);
  }
}

populateViewCountsAndMaps();
