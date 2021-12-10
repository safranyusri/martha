// --------------------- Step 1. Delineate aoi and Step 2. Masking
// Step 1. Create filters

// Center the map on aoi.
var bound = aoi.bounds();
Map.centerObject(bound, 12);

//Construct start and end dates:
var start = ee.Date('2017-01-01');
var finish = ee.Date('2018-12-31');

// Step 2. Load landsat 8 image collection 

// Load Landsat 8 surface reflectance data
var l8sr = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
            .filterBounds(aoi)
            .filterDate(start, finish);
            
// Step 3. Create a cloud free mosaic
function maskL8sr(image) {
  var cloudShadowBitMask = ee.Number(2).pow(3).int();
  var cloudsBitMask = ee.Number(2).pow(5).int();
  var qa = image.select('pixel_qa');
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask).divide(10000);
}
var composite = l8sr.map(maskL8sr)
                    .reduce(ee.Reducer.median());
var visParams = {bands: ['B4_median', 'B3_median', 'B2_median'], min: 0, max: 0.2};
//Map.addLayer(composite, visParams, 'Landsat 8 Composite');

// Step 4. Masking before analysis
// Masking for pixel above 50 m
var srtm = ee.Image('USGS/SRTMGL1_003');
var elevation = srtm.select('elevation');
var masksrtm = composite.lt(50);
var maskedsrtm = composite.updateMask(masksrtm);
// Water masking
var hansenImage = ee.Image('UMD/hansen/global_forest_change_2015');
var datamask = hansenImage.select('datamask');
var maskland = datamask.eq(1);
var maskedcomposite = maskedsrtm.updateMask(maskland);
//Map.addLayer(maskedcomposite, visParams, 'composite');
var lcomposite = maskedcomposite.clip(aoi);

// Step 5. Compute the MVI using an expression.
var mvi = lcomposite.expression(
    '(NIR - GREEN)/(SWIR - GREEN)', {
      'NIR': lcomposite.select('B5_median'),
      'GREEN': lcomposite.select('B3_median'),
      'SWIR': lcomposite.select('B6_median')
}).rename('mvi');

// Display MVI
//Map.addLayer(mvi, {}, 'mvi');

// Step 6. Thresholding. 
// Tweak these values accordingly

// Lower threshold
var lower = 4;
// Upper threshold
var upper = 20;

var mviina = mvi.lt(upper).add(mvi.gt(lower));

//Map.addLayer(mviina, {}, 'mviina');

var mask = mviina.eq(2);
var maskedmvi = mviina.updateMask(mask).rename('mangrove');

// Display the final product
//Map.addLayer(maskedmvi, {}, 'maskedmvi');

// Step 7. Export to drive
Export.image.toDrive({
  image: maskedmvi,
  description: 'maskedmvi',
  maxPixels: 1e11,
  scale: 30,
  region: aoi
});

// Step 8. Calculate area
var areaImage = maskedmvi.multiply(ee.Image.pixelArea());

// Sum the values of mangrove.
var stats = areaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e9
});
//print('pixels representing mangrove: ', stats.get('mangrove'), 'square meters');
// -----------------------------

// Step 3. Input data
// Generating a feature Collection of random points
// If you have your own shapefiles, use asset instead
var points = ee.FeatureCollection.randomPoints({
  region: aoi, 
  points: 100
  
});
print(points);
// Step 4. Explore dataset
var composite_ndvi = lcomposite.normalizedDifference(['B5_median','B4_median']);
// Palette for NDVI
var palette = [
  'FFFFFF', 'fff144', 'ceff09', '314aff'];

Map.addLayer(composite_ndvi, {min: 0, max: 1, palette: palette}, 'Composite NDVI', false);

// stack mvi and ndvi layer
var data_stack = mvi.addBands(composite_ndvi);

// Sample The Pixel Values as Feature Collection
var sampled = data_stack.sampleRegions({
  collection: points, // change if you have your own geometry
  scale: 30,
});

print(sampled)

// Step 5. Investigate correlation

// Make a band correlation chart.
// plot sampled features as a scatter chart
var chart = ui.Chart.feature.byFeature(sampled, 'mvi', ['nd'])
  .setChartType('ScatterChart')
  .setOptions({ 
    pointSize: 2, 
    pointColor: 'red', 
    width: 300, 
    height: 300, 
    titleX: 'mvi', 
    titleY: 'ndvi', 
    trendlines: {0: {showR2: true, visibleInLegend: true}}
  });
   
print(chart);

// Step 6. Input the formula

// Compute the new ndvi using an expression.
var new_ndvi = mvi.expression(
    '(0.027 * mvi)+0.77', {
      'mvi': mvi.select('mvi')
});

Map.addLayer(new_ndvi, {min: 0, max: 1, palette: palette}, 'New NDVI', false);

// Step 9. Export output
// to asset
Export.image.toAsset({
  image: new_ndvi,
  description: 'new_ndvi',
  maxPixels: 1e11,
  scale: 30,
  region: aoi
 });


// to google drive
 Export.image.toDrive({
  image: new_ndvi,
  description: 'new_ndvi',
  maxPixels: 1e11,
  scale: 30,
  region: aoi
});
