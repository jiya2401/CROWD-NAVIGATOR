const map = L.map('map').setView([0, 0], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

const CROWD_STORAGE_KEY = 'crowdReports';
let crowdReports = JSON.parse(localStorage.getItem(CROWD_STORAGE_KEY) || '[]');
let reportLayers = [];

function saveReports() {
  localStorage.setItem(CROWD_STORAGE_KEY, JSON.stringify(crowdReports));
}

function getCrowdColor(level) {
  if (level === 'low') return 'green';
  if (level === 'medium') return 'orange';
  if (level === 'high') return 'red';
  return 'gray';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function clearReportLayers() {
  reportLayers.forEach(layer => map.removeLayer(layer));
  reportLayers = [];
}

function renderCrowdReports() {
  clearReportLayers();
  const now = Date.now();
  crowdReports = crowdReports.filter(report => now - report.time <= 30 * 60 * 1000);
  saveReports();
  crowdReports.forEach(report => {
    const color = getCrowdColor(report.level);
    const circle = L.circle([report.lat, report.lon], {
      color: color,
      fillColor: color,
      fillOpacity: 0.5,
      radius: 30
    }).addTo(map);
    circle.bindPopup('Crowd: <b>' + capitalize(report.level) + '</b>');
    reportLayers.push(circle);
  });
}

function locateUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
      map.setView([lat, lon], 16);
      renderCrowdReports();
    }, function() {
      alert("Geolocation access denied.");
    });
  } else {
    alert("Geolocation not supported.");
  }
}

function reportCrowd(level) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      const report = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        level: level,
        time: Date.now()
      };
      crowdReports.push(report);
      saveReports();
      renderCrowdReports();
    }, function() {
      alert("Could not access location.");
    });
  }
}

locateUser();
