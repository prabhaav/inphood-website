import {
  SELECTED_TAGS,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  IM_UPDATE_MODEL,
  IM_ADD_CONTROL_MODEL,
  UNUSED_TAGS,
  NM_SET_SERVINGS,
  SUPER_SEARCH_RESULTS,
  ADD_SEARCH_SELECTION,
  FDA_SEARCH_RESULTS_FLAG,
  CLOSE_SEARCH_MODAL,
  PARSE_SEARCH_DATA,
  SET_PARSED_DATA,
  INITIALIZE_RECIPE_FLOW,
  INITIALIZE_SEARCH_FLOW,
  SEARCH_TIMED_OUT,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  UPDATE_MATCH_RESULTS_MODEL
} from '../constants/ActionTypes'

import ReactGA from 'react-ga'
import * as db from './firebaseCommands'
import { call, fork, put, select, take, takeEvery, race } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {IngredientModel} from '../components/models/IngredientModel'
import {IngredientControlModel} from '../components/models/IngredientControlModel'
import {MatchResultsModel} from '../components/models/MatchResultsModel'
import {mapToSupportedUnitsStrict,
        rationalToFloat,
        getPossibleUnits} from '../helpers/ConversionUtils'

function* getDataForSearchSelection(searchIngredient, selectedTags) {
  const {searchResult, index} = yield take(ADD_SEARCH_SELECTION)
  const description = searchResult.getDescription()
  let stdRefObj = searchResult.getStandardRefDataObj()
  let brandedObj = searchResult.getBrandedDataObj()
  let ingredientModel = new IngredientModel()
  if ((brandedObj !== undefined) && (stdRefObj === undefined)) {
    // Handle brandedObj (but only if the stdRefObj isn't defined because we
    // prefer the stdRefObj):
    ingredientModel.initializeFromBrandedFdaObj(description,
                                                searchIngredient,
                                                brandedObj)
  } else {
    if (stdRefObj === undefined) {
      const path = 'global/nutritionInfo/' + searchResult.getNdbNo()
      const flag = (yield call(db.getPath, path)).exists()
      if (flag) {
        stdRefObj = (yield call(db.getPath, path)).val()
      } else {
        return
      }
    }
    ingredientModel.initializeSingle(description, searchIngredient, stdRefObj)
  }
  let measureQuantity = ingredientModel.getMeasureQuantity()
  let measureUnit = ingredientModel.getMeasureUnit()
  let errorStr = ''
  try {
    yield put ({type: NM_ADD_INGREDIENT,
                tag: searchIngredient,
                ingredientModel,
                quantity: measureQuantity,
                unit: measureUnit,
                append: false})
  }
  catch(err) {
    errorStr = err
  }
  if (errorStr === '') {
    let ingredientControlModel = new IngredientControlModel(
      measureQuantity,
      getPossibleUnits(measureUnit),
      measureUnit,
      [description],
      description)
    let {parsedData} = yield select(state => state.nutritionReducer)
    for (let i = 0; i < parsedData.length; i++) {
      if (searchIngredient === parsedData[i].name) {
        parsedData[i].name = description
        parsedData[i].unit = measureUnit
        parsedData[i].amount = measureQuantity
        break
      }
    }
    let _source = {Description: description}
    let _id = searchResult.getNdbNo()
    let data = [{_stdRefObj: stdRefObj, _brandedObj: brandedObj, _source, _id }]
    // matchResultsModel._searches[searchIngredient] = data
    // yield put ({type: INGREDIENT_FIREBASE_DATA, foodName: searchIngredient, ingredient: searchIngredient, data})
    yield put ({type: SET_PARSED_DATA, parsedData})
    yield put ({type: IM_UPDATE_MODEL, tag: searchIngredient, ingredientControlModel})
    yield put ({type: UPDATE_MATCH_RESULTS_MODEL, searchIngredient, index})
    let {matchResultsModel} = yield select(state => state.tagModelReducer)
    // console.log('\n\n\nPBJERROR = SEARCH TERMS REPLACED (1): ', matchResultsModel.getSearches())
    ReactGA.event({
      category: 'Nutrition Mixer',
      action: 'Search results added to label',
      nonInteraction: false,
      label: searchIngredient
    });
  }
}

function* changesFromSearch() {
  console.log('changesFromSearch --------------------------------------------');
  const {firebaseSearch, fdaSearch, ingredient} = yield select(state => state.searchReducer)
  if (firebaseSearch && fdaSearch) {
    const {selectedTags, unusedTags, matchResultsModel} = yield select(state => state.tagModelReducer)
    if (matchResultsModel.getSearchResultsLength(ingredient) === 0) {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'No search results returned',
        nonInteraction: false,
        label: ingredient
      });
      if (unusedTags.indexOf(ingredient) === -1) {
        unusedTags.push(ingredient)
        yield put ({type: UNUSED_TAGS, tags: unusedTags})
      }
        // console.log('\n\n\nPBJERROR = SEARCH RESULTS BEING RESET: ')
      yield put ({type: SUPER_SEARCH_RESULTS,
                  matchResultsModel: new MatchResultsModel(),
                  ingredient})
      return
    } 
    else {
      // console.log('\n\n\nPBJERROR = SEARCH RESULTS BEING REPLACED: ', matchResultsModel)
      yield put ({type: SUPER_SEARCH_RESULTS,
                  matchResultsModel: matchResultsModel,
                  ingredient})
      yield race({
        response: call (getDataForSearchSelection, ingredient, selectedTags),
        cancel: take([CLOSE_SEARCH_MODAL, SEARCH_TIMED_OUT])
      })
    }
  }
}

//TODO: make this work gracefully
function* changesFromSearchController() {
  console.log('changesFromSearchController--------------------------------------------');
  const {response, timeout} = yield race({
    response: call (changesFromSearch),
    timeout: call(delay, 1000),
    // cancel: take()
  })
  if (timeout) {
    put({type: SEARCH_TIMED_OUT})
  }
}

function* changesFromRecipe() {
  console.log('changesFromRecipe ---------------------------------------------');
  const {newData, missingData} = yield select(state => state.nutritionReducer)
  const {matchResultsModel} = yield select(state => state.tagModelReducer)
  // console.log('\n\n\nPBJERROR = SEARCH TERMS LOOPING: ', matchResultsModel.getSearches())
  for (let searchTerm in matchResultsModel.getSearches()) {
    if (matchResultsModel.getSearchResultsLength(searchTerm) === 0) {
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Missing data for ingredient',
        nonInteraction: false,
        label: searchTerm
      });
      continue
      // console.log('\n\n\nPBJERROR = SEARCH TERM NOT FOUND: ', searchTerm)
    }
    const searchResult = matchResultsModel.getSearchResultByIndex(searchTerm)
    if ((searchResult.getStandardRefDataObj() === undefined) &&
        (searchResult.getBrandedDataObj() === undefined)) {
      return
      // console.log('\n\n\nPBJERROR = SEARCH TERM UNDEFINED: ', searchTerm)
    }
  }
  let selectedTags = []
  for (let searchTerm in matchResultsModel.getSearches()) {
    if (matchResultsModel.getSearchResultsLength(searchTerm) === 0) {
      if (missingData.indexOf(searchTerm) === -1) {
        missingData.push(searchTerm)
        ReactGA.event({
          category: 'Nutrition Mixer',
          action: 'Missing data for ingredient',
          nonInteraction: false,
          label: searchTerm
        });
      }
      // console.log('\n\n\nPBJERROR = SEARCH TERM HAS NO RESULTS: ', searchTerm)
      continue
    }
    const searchResult = matchResultsModel.getSearchResultByIndex(searchTerm)
    const description = searchResult.getDescription()

    let ingredientModel = new IngredientModel()
    // Prefer the standard ref obj if it exists
    const stdRefObj = searchResult.getStandardRefDataObj()
    const brandedObj = searchResult.getBrandedDataObj()
    if (stdRefObj) {
      ingredientModel.initializeSingle(description, searchTerm, stdRefObj)
    } 
    else { // brandedObj
      ingredientModel.initializeFromBrandedFdaObj(description, searchTerm, brandedObj)
    }
    let measureQuantity = ingredientModel.getMeasureQuantity()
    let measureUnit = ingredientModel.getMeasureUnit()
    let tryQuantity = measureQuantity
    let tryUnit = measureUnit
    let parseQuantity = undefined
    let parseUnit = undefined
    for (let i = 0; i < newData.length; i++) {
      const parseObj = newData[i]
      const foodName = parseObj['name']
      if (foodName === searchTerm) {
        // Sometimes the parseObj returns things like 'toTaste=true' and no
        // amount or unit fields. TODO: we should probably exclude those tags/
        // ingredients from the label in MVP3 or put them in their own bucket.
        if ('amount' in parseObj) {
          if ((parseObj['amount'].hasOwnProperty('min')) &&
               parseObj['amount'].hasOwnProperty('max')) {
            const parseMinQuantity = rationalToFloat(parseObj['amount'].min)
            const parseMaxQuantity = rationalToFloat(parseObj['amount'].max)
            parseQuantity = (parseMinQuantity + parseMaxQuantity) / 2.0
          } else {
            parseQuantity = rationalToFloat(parseObj['amount'])
          }
        }
        if ('unit' in parseObj) {
          parseUnit = mapToSupportedUnitsStrict(parseObj['unit'])
        }
        if ((parseQuantity !== undefined) && (parseQuantity !== "") && (!isNaN(parseQuantity))) {
          //console.log(tag + ', setting measureQuantity to parseQuantity: ' + parseQuantity);
          tryQuantity = parseQuantity
        }
        if ((parseUnit !== undefined) && (parseUnit !== "")) {
          //console.log(tag + ', setting measureUnit to parseUnit: ' + parseUnit);
          tryUnit = parseUnit
        }
        break
      }
    }
    // Delete the ingredient if it's already in the model because we're going to
    // add it again below.
    //console.log('   Testing for ingredient in nutritionModel');
    const {nutritionModel} = yield select(state => state.nutritionModelReducer)
    const nmTags = nutritionModel.getTags()
    for (let nmI = 0; nmI < nmTags.length; nmI++) {
      //console.log("  " + nmTags[nmI]);
    }
    if (nutritionModel.getIngredientModel(searchTerm) !== null) {
      //console.log('   Deleting ingredient ' + searchTerm + ' from NutritionModel');
      yield put.resolve({type: NM_REM_INGREDIENT, tag: searchTerm})
    }
    let addIngredientErrorStr = ''
    try {
      //console.log('changesFromRecipe: addIngredient call #1 ', searchTerm);
      yield put.resolve({type: NM_ADD_INGREDIENT,
                         tag: searchTerm,
                         ingredientModel,
                         quantity: tryQuantity,
                         unit: tryUnit,
                         append: false})
    }
    catch(err) {
      //console.log('changesFromRecipe: addIngredient call #1 threw!');
      addIngredientErrorStr = err
      ReactGA.event({
        category: 'Nutrition Mixer',
        action: 'Error adding ingredient',
        nonInteraction: false,
        label: searchTerm
      });
    }
    finally {
      // We failed to add the ingredient with the specified quantity/unit, so try
      // using the FDA values (not try/catch--if this fails we have a serious internal
      // error--i.e. this should always work.)
      if (addIngredientErrorStr !== '') {
        const originalAddIngredientErrorStr = addIngredientErrorStr
        addIngredientErrorStr = ''
        tryQuantity = measureQuantity
        tryUnit = measureUnit
        try {
          //console.log('changesFromRecipe: addIngredient call #2 ', searchTerm);
          yield put.resolve({type: NM_ADD_INGREDIENT,
                             tag: searchTerm,
                             ingredientModel,
                             quantity: tryQuantity,
                             unit: tryUnit,
                             append: false})
        } catch(err2) {
          //console.log('changesFromRecipe: addIngredient call #2 threw!');
          addIngredientErrorStr = err2 + '\n' + originalAddIngredientErrorStr
          //console.log('Second attempt to add ingrdient to model failed: ' + addIngredientErrorStr);
        }
      }
    }
    // console.log('Adding ingredient control model ---------------------------');
    // console.log('   addIngredientErrorStr: ', addIngredientErrorStr);
    // console.log('   searchTerm: ', searchTerm);
    if (addIngredientErrorStr === '') {
      let ingredientControlModel = new IngredientControlModel(
        tryQuantity,
        getPossibleUnits(tryUnit),
        tryUnit,
        matchResultsModel.getSearchResultDescriptions(searchTerm),
        description)
      // console.log('   calling IM_ADD_CONTROL_MODEL', ingredientControlModel);
      yield put ({type: IM_ADD_CONTROL_MODEL, tag: searchTerm, ingredientControlModel})
      selectedTags.push(searchTerm)
    } else {
      console.log('changesFromRecipe: unable to addIngredient');
    }
  }
  ReactGA.event({
    category: 'Nutrition Mixer',
    action: 'User recipe parsed',
    nonInteraction: false,
  });
  const {servingsControlModel} = yield select(state => state.servingsControlsReducer)
  yield put ({type: NM_SET_SERVINGS, servingsControlModel})
  yield put ({type: SELECTED_TAGS, tags: selectedTags})
  yield put ({type: UNUSED_TAGS, tags: missingData})
}

export default function* root() {
  yield fork(takeEvery, INITIALIZE_RECIPE_FLOW, changesFromRecipe)
  yield fork(takeEvery, INITIALIZE_SEARCH_FLOW, changesFromSearch)
}