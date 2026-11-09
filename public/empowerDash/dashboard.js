var weekVText = document.getElementById("weekViews");
var weekArrow = document.getElementById("weekArrow");
var weekArrows = document.getElementById("weekArrows");
var arrowText = document.getElementById("wArrow-text");
var state = document.getElementById("state1");
var stateCard = document.getElementById("StateCard");
var countryCard = document.getElementById("CountryCard");
var ctx = document.getElementById('myChart');
const chartTitleElement = document.getElementById('chartTitle');
const startDateInput = document.getElementById('start');
const endDateInput = document.getElementById('end');
var checkRange = document.getElementById('checkRange');

// Line chart for displaying unique visitors
let myChart;

const axiosInstance = axios.create({
  baseURL: window.location.origin,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiGetSiteVisitSummary = async () => {
  try {
    const res = await axiosInstance.get('/site-visits/summary');
    const currentWeekData = res.data.currentWeekData;
    const previousWeekData = res.data.previousWeekData;
    const monthData = res.data.monthData;
    const currentWeekVisits = currentWeekData.length;
    const previousWeekVisits = previousWeekData.length;

    return { currentWeekData, previousWeekData, monthData, currentWeekVisits, previousWeekVisits }
  } catch (error) {
    console.error('Error fetching API:', error);
  }
};

const apiGetSiteVisitsByDateRange = async (startDate, endDate) => {
  try {
    const res = await axiosInstance.get('/site-visits/range', {
      params: {
        startDate: startDate,
        endDate: endDate
      }
    });
    const visitsInDateRange = res.data;

    return visitsInDateRange;
  } catch (error) {
    console.error('Error fetching API:', error);
  }
};

const populateCard = (objectArray, currentWeekVisits) => {
  let innerHTML = ''; 

  for (var i = 0; i < 7; i++) {
    if (objectArray[i] === undefined) break;

    const objectName = '' + objectArray[i][0];
    const visitChangePercent = ((objectArray[i][1] / currentWeekVisits) * 100).toFixed(1);

    innerHTML +=
      '<ul class="box-container">' +
      '<li class= "box-item">' +
      '<div class="card__descriptionText">' +
      '<ul class="box-container">' +
      '<h1>' + objectName + '<h1>' + 
      '<h2>' + visitChangePercent + '% </h2>' +
      '</ul>' +
      '<div class="progress1">' +
      '<div class="progress-bar1" id="state1" style="width: ' + visitChangePercent + '%"></div>' +
      '</div>' +
      '</div>' +
      '</li>' +
      '</ul>'
  }

  return innerHTML;
}

async function outputText(checkRange) {
  // Fetch site visit data from the server
  const visitStats = await apiGetSiteVisitSummary();

  // Set view text
  weekVText.innerHTML = "<h3>" + visitStats.currentWeekVisits + "</h3>";
  viewPercent = (((visitStats.currentWeekVisits - visitStats.previousWeekVisits) / visitStats.previousWeekVisits) * 100).toFixed(2);
  arrowText.innerHTML = `${viewPercent}% from last week`;

  // Arrow green or Not 
  if (viewPercent > 0) {
    weekArrow.style.borderBottom = "8px solid rgb(6, 189, 67)";
    arrowText.style.color = "rgb(6, 189, 67)";
  } else {
    weekArrow.style.borderTop = "8px solid rgb(204, 36, 36)";
    arrowText.style.color = "rgb(204, 36, 36)";
  }

  // Calculate visit counts for top countries and states
  let stateVisitCounts = new Map();
  let countryVisitCounts = new Map();

  // Iterate through current week's visit data to populate maps
  for (var i = 0; i < visitStats.currentWeekData.length; i++) {
    const visit = visitStats.currentWeekData[i];
    const regionName = visit.regionName;
    const countryName = visit.countryName;

    // Map state visit counts
    if (stateVisitCounts.has(regionName)) {
      stateVisitCounts.set(regionName, stateVisitCounts.get(regionName) + 1);
    } else if (countryName === 'United States of America') {
      stateVisitCounts.set(regionName, 1);
    }

    // Map country visit counts
    if (countryVisitCounts.has(countryName)) {
      countryVisitCounts.set(countryName, countryVisitCounts.get(countryName) + 1);
    } else {
      countryVisitCounts.set(countryName, 1);
    }
  }

  // Sort state and country visit counts in descending order
  const sortedStateVisitCounts = new Map([...stateVisitCounts.entries()].sort((a, b) => b[1] - a[1]));
  const sortedCountryVisitCounts = new Map([...countryVisitCounts.entries()].sort((a, b) => b[1] - a[1]));

  // Extract the top 7 states and countries based on visit counts
  const topSevenStates = Array.from(sortedStateVisitCounts.entries()).slice(0, 7);
  const topSevenCountries = Array.from(sortedCountryVisitCounts.entries()).slice(0, 7);

  // Populate state and country cards
  stateCard.innerHTML = populateCard(topSevenStates, visitStats.currentWeekVisits);
  countryCard.innerHTML = populateCard(topSevenCountries, visitStats.currentWeekVisits);
};

async function outputChart(labels, data) {
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '# of Views',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 3
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        },
      }
    }
  });
}

const generateUniqueVisitsGraph = async () => {
  try {
    // Fetch site visit data from the server
    const visitData = await apiGetSiteVisitsByDateRange(startDateInput.value, endDateInput.value);
    console.log(visitData)

    if (myChart) await myChart.destroy();

    const chartLabels = [];
    let currentDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    // Increment dates to match inclusive range
    currentDate.setDate(currentDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);

    while (currentDate <= endDate) {
      chartLabels.push(`${currentDate.getMonth() + 1}/${currentDate.getDate()}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Initialize array with zeros
    const visitDataArr = new Array(chartLabels.length).fill(0);

    // Populate data
    for (const visit of visitData) {
      const visitDate = new Date(visit.firstVisitDate);
      const startDate = new Date(startDateInput.value);
      const diffTime = Math.abs(visitDate - startDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      visitDataArr[diffDays] += 1;
    }

    await outputChart(chartLabels, visitDataArr);
  } catch (error) {
    console.error('Error fetching API:', error);
  }
}

checkRange.addEventListener('click', async () => {
  generateUniqueVisitsGraph();
});

outputText();
