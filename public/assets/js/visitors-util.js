const btnChart = document.getElementById('btnChart');
const stateChart = document.getElementById('usVisitorMap');
const worldChart = document.getElementById('worldVisitorMap');

// Swap between US and world maps
btnChart.addEventListener('click', () => {
  if (stateChart.style.display === '') {
    stateChart.style.display = 'none';
    btnChart.innerText = 'See US Visitors';
    worldChart.style.display = ''; 
    window.dispatchEvent(new Event('resize'));
  } else {
    worldChart.style.display = 'none';
    btnChart.innerText = 'See Global Visitors';
    stateChart.style.display = '';
  }
});
