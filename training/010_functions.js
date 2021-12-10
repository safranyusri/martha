//Javascript function illustration for normalized difference (a-b)/(a+b)
//2 examples of linnear programming
var nd1 = (120 - 20)/(120 + 20);
print('nd1 = ',nd1);
var nd2 = (50 - 10)/(50 + 10);
print('nd2 = ',nd2);

//Simplify by function
function normalizedDifference(a, b) {
  return ((a - b) / (a + b));
    }

// same example with function
var nd3 = normalizedDifference(120, 20);
print('nd3 = ',nd3);
var nd4 = normalizedDifference(50, 10);
print('nd4 = ',nd4);
