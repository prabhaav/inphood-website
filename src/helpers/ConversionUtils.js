const Convert = require('convert-units')


const UnitTranslationMap = {
  Tbs: ['T', 'Tbs', 'tbs', 'tbsp.', 'Tbsp.', 'Tbsp', 'tbsp', 'TB', 'TBS', 'TBSP', 'tablespoon'],
  tsp: ['t', 'Tsp', 'tsp', 'tsp.', 'Tsp.', 'TS', 'TSP'],
  cup: ['C', 'c'],
  pnt: ['pt', 'PT', 'Pt'],
  qt: ['QT', 'Qt', 'qt'],
  gal: ['Gal', 'GAL', 'gal'],
  'fl-oz': ['oz', 'Oz', 'OZ', 'oz.', 'Oz.', 'OZ.'],
  ml: ['ml'],
  l: ['L', 'l'],
  lb: ['lb', 'Lb', 'LB', 'lb.', 'Lb.', 'LB.'],
  g: ['g', 'gram'],
  kg: ['kg', 'Kg', 'kilogram', 'Kilogram']
}


// Converts the provided unit, aUnit, to the abbreviation/unit-name used in
// this SW if possible. Otherwise return the given unit (i.e. custom things
// like 'pat' of butter are not in our default supported units, but we still
// handle some conversions to them.)
//
export function mapToSupportedUnits(aUnit) {
  for (let supportedUnit in UnitTranslationMap) {
    if ((aUnit === supportedUnit)
        || (UnitTranslationMap[supportedUnit].includes(aUnit))) {
      return supportedUnit
    }
  }

  // const errorStr = "Unsupported unit: " + aUnit
  // throw new Error(errorStr)

  return aUnit
}


function isVolumeUnit(aUnit) {
  if (Convert().possibilities().includes(aUnit)) {
    return (Convert().describe(aUnit)['measure'] === 'volume')
  }

  // If it's not a supported unit, return false
  return false
}


// This function returns a value in the provided unit, newUnit, converted from the
// provided currentValue and currentUnit. If a simple mass->mass or volume->volume,
// conversion cannot be performed, then FDA data in ingredientModel is used to perform
// a cross domain conversion if possible. Throws otherwise.
//
export function getValueInUnits(currentValue, currentUnit, newUnit, ingredientModel) {
  let currentUnitType = 'other'
  if (Convert().possibilities().includes(currentUnit)) {
    currentUnitType = Convert().describe(currentUnit)['measure']
  }

  let newUnitType = 'other'
  if (Convert().possibilities().includes(newUnit)) {
    newUnitType = Convert().describe(newUnit)['measure']
  }

  // TODO: consider a second call here to do custom mappings (i.e. 1 pat butter
  //       to 1/2 tablespoon)
  const fdaMeasureUnit = mapToSupportedUnits(ingredientModel.getMeasureUnit())
  const fdaMeasureQuantity = ingredientModel.getMeasureQuantity()
  const fdaMeasureInGrams = ingredientModel.getMeasureWeightGrams()

  let newValue = 0
  // 2. Perform the required conversion:
  //
  //   a) from unit type 'mass' to 'mass' or unit type 'volume' to 'volume':
  if ((newUnitType === currentUnitType) && (newUnitType !== 'other')) {
    newValue = Convert(currentValue).from(currentUnit).to(newUnit)
  }
  //   b) from unit type 'mass' to 'volume':
  else if ((currentUnitType === 'mass') && (newUnitType === 'volume')) {
    // - see if the FDA 'measure' is a volume unit
    if (! isVolumeUnit(fdaMeasureUnit)) {
      const errorStr = "Unable to convert " + currentUnit + "(mass) to " + newUnit
                       + "(volume) for ingredient: '" + ingredientModel.getKey()
                       + "'. Unsupported FDA volume unit: " + fdaMeasureUnit
      throw new Error(errorStr)

      // TODO: MVP3 / MVP2 alternate conversion (i.e. butter 'pat' -> 1/2 Tbsp)
    }

    // - if so, get the current unit into grams
    // - use the FDA 'measure' data to convert 'grams' to 'measures'
    // - convert the measure to the new unit
    let gramValue = Convert(currentValue).from(currentUnit).to('g')
    let fdaMeasureVolumeValue = gramValue * fdaMeasureQuantity / fdaMeasureInGrams
    newValue = Convert(fdaMeasureVolumeValue).from(fdaMeasureUnit).to(newUnit)
  }
  //   c) from unit type 'volume' to 'mass':
  else if ((currentUnitType === 'volume') && (newUnitType === 'mass')) {
    // - see if the FDA 'measure' is a volume unit
    if (! isVolumeUnit(fdaMeasureUnit)) {
      const errorStr = "Unable to convert " + currentUnit + "(volume) to " + newUnit
                       + "(mass) for ingredient: '" + ingredientModel.getKey()
                       + "'. Unsupported FDA volume unit: " + fdaMeasureUnit
      throw new Error(errorStr)

      // TODO: MVP3 / MVP2 alternate conversion (i.e. butter 'pat' -> 1/2 Tbsp)
    }

    // - if so, get the current unit into the fda measure units
    // - use the fda 'measure' data to convert 'measures' to 'grams'
    // convert 'grams' to the new mass unit
    let fdaMeasureValue = Convert(currentValue).from(currentUnit).to(fdaMeasureUnit)
    let gramValue = fdaMeasureValue * fdaMeasureInGrams / fdaMeasureQuantity
    newValue = Convert(gramValue).from('g').to(newUnit)
  }
  //   d) from unit type 'other' (unsupported volume) to 'mass':
  else if ((currentUnitType === 'other') && (newUnitType === 'mass')) {
    // - presumably currentUnit (other) is an FDA unit, check:
    if (! currentUnit === fdaMeasureUnit) {
      const errorStr = "Unable to convert " + currentUnit + "(???) to " + newUnit
                       + "(mass) for ingredient: '" + ingredientModel.getKey()
                       + "'. Unsupported unit: " + currentUnit
      throw new Error(errorStr)

      // TODO: MVP2 error for some measures (this should probably never happen)
    }

    // - Convert the FDA unit to grams using the fda 'measure' data
    // - Convert 'grams' to the new mass unit
    let gramValue = currentValue * fdaMeasureInGrams / fdaMeasureQuantity
    newValue = Convert(gramValue).from('g').to(newUnit)
  }
  //   e) from unit type 'mass' to 'other' (unsupported volume):
  else if ((currentUnitType === 'mass') && (newUnitType === 'other')) {
    // - presumably newUnitType (other) is an FDA unit, check:
    if (! newUnitType === fdaMeasureUnit) {
      const errorStr = "Unable to convert " + currentUnit + "(mass) to " + newUnit
                       + "(???) for ingredient: '" + ingredientModel.getKey()
                       + "'. Unsupported unit: " + newUnit
      throw new Error(errorStr)

      // TODO: MVP2 error for some measures (this should probably never happen)
    }

    // - Conver the current unit to grams
    // - Use the fda 'measure' data to convert grams to newUnitType
    let gramValue = Convert(currentValue).from(currentUnit).to('g')
    newValue = gramValue * fdaMeasureQuantity / fdaMeasureInGrams
  }
  //   f) error:
  else {
    const errorStr = "Unable to convert " + currentUnit + "(" + currentUnitType
                     + ") to " + newUnit + "(" + newUnitType + ") for ingredient: '"
                     + ingredientModel.getKey() + "'."
    throw new Error(errorStr)

    newValue = 0
  }

  console.log('Converted ' + currentValue + currentUnit + " to " + newValue + newUnit + " ---------");

  return newValue
}


// Given ingredientModel and ingredientControlModel instances, this returns the
// value of the ingredientControlModel in the provided newUnit units, if possible.
// Throws otherwise.
//
export function getIngredientValueInUnits(newUnit, ingredientModel, ingredientControlModel) {
  // 1. Determine the type of measure for the current and proposed units:
  //
  const currentValue = ingredientControlModel.getSliderValue()
  const currentUnit = ingredientControlModel.getDropdownUnitValue()

  return getValueInUnits(currentValue, currentUnit, newUnit, ingredientModel)
}
