/**
 * Function to mask clouds based on the pixel_qa band of Landsat 8 SR data.
 * @param {ee.Image} image input Landsat 8 SR image
 * @return {ee.Image} cloudmasked Landsat 8 image
 */
function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');
  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}
var dataset = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                  .filterDate('2020-01-01', '2020-12-31')
                  .map(maskL8sr);
var visParams = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};
var composite = dataset.median()
Map.setCenter(106.28107, -5.81314, 14);
Map.addLayer(composite, visParams);
// Land masking

// get Hansen et al
var hansenImage = ee.Image('UMD/hansen/global_forest_change_2015');

// Select the land/water mask.
var datamask = hansenImage.select('datamask');

// create binary mask
var maskland = datamask.eq(2);
var watermask= datamask.eq(1);

// Land Masking
var maskedComposite = composite.updateMask(maskland);
// Water Masking
var landComposite = composite.updateMask(watermask);
// Display masked composite
Map.addLayer(maskedComposite, visParams, 'Landsat 8 Water Composite');
Map.addLayer(landComposite, visParams, 'Landsat 8 Land Composite');
