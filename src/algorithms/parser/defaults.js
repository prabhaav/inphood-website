module.exports = {};

var reOptional = module.exports.reOptional = /^(\(?optional|\(\W*optional\W*\)$)/i;

var unitsOfMeasure = module.exports.unitsOfMeasure = {
  tablespoon: ['T', 'Tbs', 'tbs', 'tbs.', 'Tbs.', 'tb', 'tbsp.', 'Tbsp.', 'Tbsp', 'tbsp', 'TB', 'TBS', 'TBSP'],
  teaspoon: ['t', 'Tsp', 'tsp', 'ts', 'tsp.', 'Tsp.', 'TS', 'TSP'],
  cup: ['C', 'c'],
  pint: ['pt', 'PT', 'Pt'],
  quart: ['QT', 'Qt', 'qt'],
  pinch: [],
  little: [],
  dash: [],
  gallon: ['Gal', 'GAL', 'gal'],
  ounce: ['oz', 'Oz', 'OZ', 'oz.', 'Oz.', 'OZ.'],
  milliliter: ['ml'],
  liter: ['L', 'l'],
  inch: ['"', 'in', 'In', 'IN'],
  millimeter: ['mm'],
  centimeter: ['cm'],
  whole: [],
  half: [],
  can: [],
  gram: ['g'],
  kilogram: ['kg', 'Kg', 'Kilogram'],
  bottle: [],
  large: ['lg', 'LG', 'Lg'],
  'package': ['pkg', 'Pkg', 'PKG'],
  pound: ['lb', 'Lb', 'LB', 'lb.', 'Lb.', 'LB.'],
  bunch: ['bunch', 'Bunch'],
  piece: ['piece', 'Piece'],
  slice: ['slice', 'Slice']
};

var fluidicWords = module.exports.fluidicWords = [
  'fluid', 'fl'
];

//var reToWords = module.exports.reToWords = / *((to)( +)|(to)([0-9]+)|-( *))/i;
var reToWords = module.exports.reToWords = / *(to([ 0-9]+)|- *)/i;

var noiseWords = module.exports.noiseWords = [
  'a', 'of', 'small', 'medium', 'large', 'Small', 'Medium', 'Large'
];
