// Get Landsat 8 image collection
var L8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");

// Zoom to Jakarta
Map.setCenter(106.8420, -6.206, 8);

//Filter by date
var filtered = L8.filterDate('2017-01-01', '2017-12-31');

//Display layer
Map.addLayer(filtered);

// Band combination
Map.addLayer(filtered, {min: 0, max :0.3, bands:['B4', 'B3', 'B2']}, 'RGB');
