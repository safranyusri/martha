// get image collection
var collection = ee.ImageCollection('LANDSAT/LC08/C01/T1').filterDate('2020-01-01', '2020-12-21');
// create cloud free mosaic composite
var composite = ee.Algorithms.Landsat.simpleComposite(collection).clip(mangrove);
// calculate ndvi
var composite_ndvi = composite.normalizedDifference(['B5','B4']);
// display composite and ndvi composite
Map.addLayer(composite, {bands: ['B4', 'B3', 'B2'], max: 128}, 'Composite', false);

// Export the image to drive.
Export.image.toDrive({
  image: composite,
  description: 'composite',
  scale: 30,
  region: mangrove,
  maxPixels: 1e9
});
// Export the image to asset.
Export.image.toAsset({
  image: composite,
  description: 'composite',
  scale: 30,
  region: mangrove,
  maxPixels: 1e9
});
// Export the FeatureCollection to a KML file.
Export.table.toDrive({
  collection: mangrove,
  description:'mangrove',
  fileFormat: 'KML'
});
// Export the FeatureCollection to aasset.
Export.table.toAsset({
  collection: mangrove,
  description:'mangrove'
});
