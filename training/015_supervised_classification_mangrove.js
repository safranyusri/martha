// Step 1: Delineate area of interest (draw or asset)

// Step 2: Prepare image for analysis
function maskL8sr(image) {
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  var qa = image.select('pixel_qa');
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
var composite = dataset.median().clip(aoi);

Map.centerObject(aoi, 12);
Map.addLayer(composite, visParams, 'composite');

// Step 3. Select and Stack Bands for Analysis

var hansenImage = ee.Image('UMD/hansen/global_forest_change_2015');
var datamask = hansenImage.select('datamask');
var maskwater = datamask.eq(1);
var maskedComposite = composite.updateMask(maskwater);
//Map.addLayer(maskedComposite, visParams, 'Landsat 8 Land Composite');
// Select bands for classification
var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7'];
var classProperty = 'habitat';

// Step 4. Collect Training Data
// Merge training data
var newfc = mangrove_training.merge(bare_training).merge(other_training);


// Step 5. Instantiate classifiers
// Sample training data
var training = maskedComposite.select(bands).sampleRegions({
  collection: newfc,
  properties: [classProperty],
  scale: 30  
});

// random uniforms to the training dataset.
var withRandom = training.randomColumn('random');

// We want to reserve some of the data for testing, to avoid overfitting the model.
var split = 0.7;  // Roughly 70% training, 30% testing.
var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// Step 6. Train classifier
var rfclassifier = ee.Classifier.smileRandomForest(10).train({
  features: trainingPartition,
  classProperty: classProperty,
  inputProperties: bands
});


// Step 7. Classify image
var classifiedrf = maskedComposite.select(bands).classify(rfclassifier);

// pallette for classification
var palette = [
  'ffc82d', // bare substrate (0)
  '06ca2c', // mangrove (1)
  '53fff3' //  other vegetation (2)
];
// Display output
Map.addLayer(classifiedrf, {min: 0, max: 2, palette: palette}, 'Mangrove habitat');

// Step 8. Estimate training accurracy

// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = rfclassifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());


// Classify the test FeatureCollection.
var test = testingPartition.classify(rfclassifier);

// Print the error matrix.
var errorMatrix = test.errorMatrix(classProperty, 'classification');
print('Error Matrix', errorMatrix);
print('Test overall accuracy: ', errorMatrix.accuracy());
print('Producers Accuracy:', errorMatrix.producersAccuracy());
print('Consumers Accuracy:', errorMatrix.consumersAccuracy());
print('Kappa Test:', errorMatrix.kappa());

// Step 9. Export output
// to asset
Export.image.toAsset({
  image: classifiedrf,
  description: 'Benthichabitatrf',
  maxPixels: 1e11,
  scale: 30,
  region: aoi
 });


// to google drive
 Export.image.toDrive({
  image: classifiedrf,
  description: 'Benthichabitatrf',
  maxPixels: 1e11,
  scale: 30,
  region: aoi
});
