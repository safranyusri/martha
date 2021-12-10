// Step 1. Data preparation
// Construct start and end dates:
var start = ee.Date('2017-01-01');
var finish = ee.Date('2017-12-31');

// Center the map on indonesia.
var bound = aoi.bounds();
Map.centerObject(bound, 4);
// Load hycom Water Temperature and Salinity
var hycom_sts = ee.ImageCollection('HYCOM/GLBu0_08/sea_temp_salinity')
            .filterBounds(aoi)
            .filterDate(start, finish);

// Select sea surface temperature and salinity
var hycom_sst = hycom_sts.select('sst_0');
var hycom_sal = hycom_sts.select('salinity_0');

// Step 2. Calculate mean, min, max
// Create mean of salinity in ppt
var hycom_salm = hycom_sal.reduce('mean');
var hycom_salme = hycom_salm.expression(
    '(20+(sal/1000))*1.004715', {
      'sal': hycom_salm.select('salinity_0_mean')
});
var hycom_salmean = hycom_salme.select('constant')
  .rename('sal')
  .float()
  .clip(aoi);
var hycom_salmean_scale = hycom_salmean.projection().nominalScale();
// print('Projection, crs, and crs_transform:', hycom_sstmean.projection());
// print('Scale in meters:', hycom_sstmean_scale);

// Create min of salinity
var hycom_salmi = hycom_sal.reduce('min');
var hycom_salmin = hycom_salmi.expression(
    '(20+(sal/1000))*1.004715', {
      'sal': hycom_salmi.select('salinity_0_min')
});
var hycom_salminc = hycom_salmin.select('constant')
  .rename('sal')
  .float()
  .clip(aoi);
var hycom_salmin_scale = hycom_salminc.projection().nominalScale();

// Create max of salinity
var hycom_salma = hycom_sal.reduce('max');
var hycom_salmax = hycom_salma.expression(
    '(20+(sal/1000))*1.004715', {
      'sal': hycom_salma.select('salinity_0_max')
});
var hycom_salmaxc = hycom_salmax.select('constant')
  .rename('sal')
  .float()
  .clip(aoi);
var hycom_salmax_scale = hycom_salmaxc.projection().nominalScale();

// Step. 3. Create gap fill for kriging interpolation
var gapfill_hsalmean = hycom_salmean.clip(gap_filling);
var gapfill_hsalmin = hycom_salminc.clip(gap_filling);
var gapfill_hsalmax = hycom_salmaxc.clip(gap_filling);

// Step 4. Sample the image at 1e8 random locations.
// Sample mean
var hsalmean_samples = gapfill_hsalmean.addBands(ee.Image.pixelLonLat())
  .sample({region: aoi, numPixels: 1e8, scale: hycom_salmean_scale.divide(10)})
  .map(function(sample) {
    var lat = sample.get('latitude');
    var lon = sample.get('longitude');
    var sal = sample.get('sal');
    return ee.Feature(ee.Geometry.Point([lon, lat]), {sal: sal});
  });
// Sample min
var hsalmin_samples = gapfill_hsalmin.addBands(ee.Image.pixelLonLat())
  .sample({region: aoi, numPixels: 1e8, scale: hycom_salmin_scale.divide(10)})
  .map(function(sample) {
    var lat = sample.get('latitude');
    var lon = sample.get('longitude');
    var sal = sample.get('sal');
    return ee.Feature(ee.Geometry.Point([lon, lat]), {sal: sal});
  });
// Sample max
var hsalmax_samples = gapfill_hsalmax.addBands(ee.Image.pixelLonLat())
  .sample({region: aoi, numPixels: 1e8, scale: hycom_salmax_scale.divide(10)})
  .map(function(sample) {
    var lat = sample.get('latitude');
    var lon = sample.get('longitude');
    var sal = sample.get('sal');
    return ee.Feature(ee.Geometry.Point([lon, lat]), {sal: sal});
  });  
  
// Step 5. Interpolate from the sampled points.

// interpolate mean
var hsalinterpolated_mean = hsalmean_samples.kriging({
  propertyName: 'sal',
  shape: 'gaussian',
  range: 100 * 100,
  sill: 1.0,
  nugget: 0.1,
  maxDistance: 100 * 200,
  reducer: 'mean'
});
var hsalinterpolated_me = hsalinterpolated_mean.clip(aoi);
var hsalinterpolated_mean = hsalinterpolated_me.clip(gap_filling).float();

var mosaic_hsal_mean = ee.ImageCollection.fromImages([hycom_salmean, hsalinterpolated_mean]).mosaic();

// interpolate min
var hsalinterpolated_min = hsalmin_samples.kriging({
  propertyName: 'sal',
  shape: 'gaussian',
  range: 100 * 100,
  sill: 1.0,
  nugget: 0.1,
  maxDistance: 100 * 200,
  reducer: 'mean'
});
var hsalinterpolated_mi = hsalinterpolated_min.clip(aoi);
var hsalinterpolated_min = hsalinterpolated_mi.clip(gap_filling).float();

var mosaic_hsal_min = ee.ImageCollection.fromImages([hycom_salminc, hsalinterpolated_min]).mosaic();

// interpolate max
var hsalinterpolated_max = hsalmax_samples.kriging({
  propertyName: 'sal',
  shape: 'gaussian',
  range: 100 * 100,
  sill: 1.0,
  nugget: 0.1,
  maxDistance: 100 * 200,
  reducer: 'mean'
});
var hsalinterpolated_ma = hsalinterpolated_max.clip(aoi);
var hsalinterpolated_max = hsalinterpolated_ma.clip(gap_filling).float();

var mosaic_hsal_max = ee.ImageCollection.fromImages([hycom_salmaxc, hsalinterpolated_max]).mosaic();

// Step 6. Create visualisation
var colors = ['00007F', '0000FF', '0074FF',
              '0DFFEA', '8CFF41', 'FFDD00',
              'FF3700', 'C30000', '790000'];
var vis = {min:28, max:35, palette: colors};

// Display Original sal
Map.addLayer(hycom_salmean, vis, 'Hycom Salinity Mean');
Map.addLayer(hycom_salminc, vis, 'Hycom Salinity Min');
Map.addLayer(hycom_salmaxc, vis, 'Hycom Salinity Max');
// Display Interpolated sal
Map.addLayer(hsalinterpolated_mean, vis, 'Hycom Salinity Interpolated Mean');
Map.addLayer(hsalinterpolated_min, vis, 'Hycom Salinity Interpolated Min');
Map.addLayer(hsalinterpolated_max, vis, 'Hycom Salinity Interpolated Max');
// Display Mosaic sal
Map.addLayer(mosaic_hsal_mean, vis, 'Hycom Salinity Mosaic Mean');
Map.addLayer(mosaic_hsal_min, vis, 'Hycom Salinity Mosaic Min');
Map.addLayer(mosaic_hsal_max, vis, 'Hycom Salinity Mosaic Max');
// Display sample
//Map.addLayer(mean_samples, {}, 'Samples', false);
 
// Step 7. Export images
// Export mean
Export.image.toDrive({
  image: hycom_salmean,
  description: 'hycom_salmeanid00-17ori',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: hsalinterpolated_mean,
  description: 'hycom_salmeanid00-17gapfill',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: mosaic_hsal_mean,
  description: 'hycom_salmeanid00-17gapfilled',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
    
// Export min
Export.image.toDrive({
  image: hycom_salminc,
  description: 'hycom_salminid00-17ori',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: hsalinterpolated_min,
  description: 'hycom_salminid00-17gapfill',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: mosaic_hsal_min,
  description: 'hycom_salminid00-17gapfilled',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
// Export max
Export.image.toDrive({
  image: hycom_salmaxc,
  description: 'hycom_salmaxid00-17ori',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: hsalinterpolated_max,
  description: 'hycom_salmaxid00-17gapfill',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
Export.image.toDrive({
  image: mosaic_hsal_max,
  description: 'hycom_salmaxid00-17gapfilled',
  maxPixels: 1e11,
  scale: 500,
  region: bound,
  folder: 'enviro500'
});
