// Get 1 image
var image = ee.Image('LANDSAT/LC08/C01/T1_TOA/LC08_125063_20180524');
// Display the image
Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], max: 0.3, gamma: 1.2}, 'Image');
Map.centerObject(image);
// calculate NDVI
var ndvi = image.normalizedDifference(['B5','B4']);
// Palette for NDVI
var palette = [
  'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
  '74A901', '66A000', '529400', '3E8601', '207401', '056201',
  '004C00', '023B01', '012E01', '011D01', '011301'];
// display the NDVI image
Map.addLayer(ndvi, {min: 0, max: 1, palette: palette}, 'Landsat NDVI', false);
// Use cloud free mosaic composite
// get image collection
var collection = ee.ImageCollection('LANDSAT/LC08/C01/T1').filterDate('2017-01-01', '2017-12-21');
// create cloud free mosaic composite
var composite = ee.Algorithms.Landsat.simpleComposite(collection);
// calculate ndvi
var composite_ndvi = composite.normalizedDifference(['B5','B4']);
// display composite and ndvi composite
Map.addLayer(composite, {bands: ['B4', 'B3', 'B2'], max: 128}, 'Composite', false);
Map.addLayer(composite_ndvi, {min: 0, max: 1, palette: palette}, 'Composite NDVI', false);
