// This function gets NDVI from Landsat 8 imagery.
var getNDVI = function(image) {
  return image.normalizedDifference(['B5', 'B4']);
};

// This function gets NDVI from Landsat 8 imagery.
var addNDVI = function(image) {
  return image.addBands(image.normalizedDifference(['B5', 'B4']).rename('NDVI'));
};

// Load the Landsat 8 raw data, filter by location and date.
var collection = ee.ImageCollection('LANDSAT/LC08/C01/T1')
  .filterBounds(aoi)
  .filterDate('2020-01-01', '2021-01-01');

// Map the function over the collection.
var ndviCollection = collection.map(addNDVI);

// Display images
Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], max: 128}, 'Composite1', false);

Map.addLayer(ndviCollection, {bands: ['B4', 'B3', 'B2'], max: 128}, 'Composite1 + NDVI', false);

// center map on aoi
Map.centerObject(aoi);
