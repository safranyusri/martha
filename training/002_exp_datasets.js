// Exploring Datasets
// Get SRTM
var srtm = ee.Image('USGS/SRTMGL1_003');

// Zoom to Puncak Jaya
Map.setCenter(137.930, -4.444, 9);

//Display on map
Map.addLayer(srtm);

// Select elevation band
var elevation = srtm.select('elevation');

// Display on map with ranges and layer name
Map.addLayer(elevation,{min: 0, max: 4000},'elevation');
