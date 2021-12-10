// Get Landsat 8 raw
var L8 = ee.ImageCollection("LANDSAT/LC08/C01/T1");
Map.setCenter(106.8420, -6.206, 8);
//Filter by date
var filteredraw = L8.filterDate('2020-01-01', '2020-12-31');
// create cloud free mosaic composite
var composite = ee.Algorithms.Landsat.simpleComposite({
  collection: filteredraw,
  asFloat: true
});
// display with band combination
Map.addLayer(filteredraw, {min: 6000, max :60000, bands:['B4', 'B3', 'B2']}, 'RGB raw');
Map.addLayer(composite, {bands: ['B6', 'B5', 'B4'], max: [0.3, 0.4, 0.3]}, 'composite');
