// A dictionary of variables to use in expression.
var variables = {x: 5, y: 10};

// Arithmetic operators.
print('x + y', ee.Number.expression('x + y', variables));
print('x - y', ee.Number.expression('x - y', variables));
print('x * y', ee.Number.expression('x * y', variables));
print('x / y', ee.Number.expression('x / y', variables));
print('x ** y', ee.Number.expression('x ** y', variables));
print('x % y', ee.Number.expression('x % y', variables));

// Constants in the expression.
print('100 * (x + y)', ee.Number.expression('100 * (x + y)', variables));

// JavaScript Math constants.
print('Math.PI', ee.Number.expression('Math.PI', null));
print('Math.E', ee.Number.expression('Math.E', null));

// Load a Landsat 8 image.
var image = ee.Image('LANDSAT/LC08/C01/T1_TOA/LC08_125063_20180524');

// Compute the EVI using an expression.
var evi = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
      'NIR': image.select('B5'),
      'RED': image.select('B4'),
      'BLUE': image.select('B2')
});

Map.centerObject(image, 9);
Map.addLayer(evi, {min: -1, max: 1, palette: ['FF0000', '00FF00']});
