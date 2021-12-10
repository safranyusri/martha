// Step 1. Prepare the dataset

var dataset = ee.Image('NOAA/NGDC/ETOPO1');
var bedrock = dataset.select('bedrock');

// Center the map on aoi.
var bound = aoi.bounds();
Map.centerObject(bound, 4);
// Display image
Map.addLayer(bedrock, {},'bedrock');

// Step 2. Land masking

// get Hansen et al
var hansenImage = ee.Image('UMD/hansen/global_forest_change_2015');

// Select the land/water mask.
var datamask = hansenImage.select('datamask');
// create binary mask
var maskland = datamask.eq(2);
// Land Masking
var maskedbedrock = bedrock.updateMask(maskland);

// Display masked image
Map.addLayer(maskedbedrock, {},'maskedbedrock');

// Step 3. Prepare the bathymetry layer

var bathymetry = maskedbedrock.clip(aoi);
// Display the bathymetry
Map.addLayer(bathymetry, {min: -30, max: 0}, 'bathymetry');

// step 4. Benthic terrain modelling

// Apply slope algorithm to bathymetry.
var slope = ee.Terrain.slope(bathymetry);

// Get the aspect (in degrees).
var aspect = ee.Terrain.aspect(bathymetry);

// Convert to radians, compute the sin of the aspect.
var terrain = aspect.divide(180).multiply(Math.PI).sin();

// Calculate curvature
var curvature = ee.Terrain.slope(slope);

// Calculate hillshade
var hillshade = ee.Terrain.hillshade(bathymetry);

// Classify based on cardinal orientation (s,sw,w,nw,ne,e,se,s)
var cardinal = aspect.gt(22.5).add(aspect.gt(67.5)).add(aspect.gt(112.5))
  .add(aspect.gt(157.5)).add(aspect.gt(202.5)).add(aspect.gt(247.5)).add(aspect.gt(292.5)).add(aspect.gt(337.5))

var remap = cardinal.remap([0,1,2,3,4,5,6,7,8],[0,1,2,3,4,5,6,7,0])

var cardinalColors = ['ff1212','ff8014','ffe210','17de0a','0affe8','0c2aff','fb0aff']
Map.addLayer(slope,{min:0,max:5},'slope')


// Display all
Map.addLayer(slope, {}, 'slope');
Map.addLayer(aspect, {}, 'aspect');
Map.addLayer(terrain, {}, 'terrain');
Map.addLayer(curvature, {}, 'curvature');
Map.addLayer(hillshade, {}, 'hillshade');
Map.addLayer(remap,{palette:cardinalColors},'cardinal')

// Step 5. Export data
Export.image.toDrive({
  image: bathymetry,
  description: 'bathymetry500',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: slope,
  description: 'slope500',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: aspect,
  description: 'aspect500',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: terrain,
  description: 'terrain500',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: curvature,
  description: 'curvature500',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: hillshade,
  description: 'hillshade500',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});

// Step 6. Histogram visualization
var collection = ee.List([bathymetry,slope,aspect,remap]);
var size = collection.length().getInfo();
for (var i = 0; i < size; i++) {
  var image = ee.Image(collection.get(i));
  var histogram = ui.Chart.image.histogram({
    image: image,
    region: aoi,
    scale: 1000,
    maxPixels: 1e13
  });
  print(histogram);
}

// Step 7. Descriptive statistics

var mean = bathymetry.reduceRegion({reducer: ee.Reducer.mean(), scale: 1000, geometry: aoi, maxPixels: 1e13});
print('mean',mean);
var min = bathymetry.reduceRegion({reducer: ee.Reducer.min(), scale: 1000, geometry: aoi, maxPixels: 1e13});
print('min',min);
var max = bathymetry.reduceRegion({reducer: ee.Reducer.max(), scale: 1000, geometry: aoi, maxPixels: 1e13});
print('max',max);
