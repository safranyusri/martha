// This function gets NDVI from Landsat 8 imagery.
var getNDVI = function(image) {
  return image.normalizedDifference(['B5', 'B4']);
};
// Load two image collections, 6 years apart
var collection1 = ee.ImageCollection('LANDSAT/LC08/C01/T1').filterDate('2014-01-01', '2014-12-21');
var collection2 = ee.ImageCollection('LANDSAT/LC08/C01/T1').filterDate('2020-01-01', '2020-12-21');
// Create two composites and clip using geometry
var image1 = ee.Algorithms.Landsat.simpleComposite(collection1).clip(aoi);
var image2 = ee.Algorithms.Landsat.simpleComposite(collection2).clip(aoi);
// Compute NDVI from the scenes.
var ndvi1 = getNDVI(image1);
var ndvi2 = getNDVI(image2);
// Compute the difference in NDVI with operators
var ndviDifference = ndvi2.subtract(ndvi1);
// Display images
Map.addLayer(image1, {bands: ['B4', 'B3', 'B2'], max: 128}, 'Composite1', false);
Map.addLayer(image2, {bands: ['B4', 'B3', 'B2'], max: 128}, 'Composite2', false);
Map.addLayer(ndviDifference, {}, 'NDVI Difference');
// center map on aoi
Map.centerObject(aoi);
