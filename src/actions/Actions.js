import {
  UPLOAD_PHOTO,
  SELECTED_PHOTO,
  CLEAR_DATA,
  GET_LABEL_ID,
  POST_LABEL_ID,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  LAZY_FETCH_FIREBASE,
  MODEL_RESET,
  NM_ADD_INGREDIENT,
  NM_REM_INGREDIENT,
  NM_SET_SERVINGS,
  NM_SCALE_INGREDIENT,
  IM_ADD_CONTROL_MODEL,
  IM_UPDATE_MODEL,
  IM_REM_INGREDIENT_TAG,
  SC_STORE_MODEL,
  SELECTED_TAGS,
  DELETED_TAGS,
  UNUSED_TAGS,
  REPLACED_TAGS,
  INIT_EMAIL_FLOW,
  GET_EMAIL_DATA,
  COMPLETE_DROPDOWN_CHANGE,
  ADD_SEARCH_SELECTION,
  SEND_USER_GENERATED_DATA,
  INIT_SUPER_SEARCH,
  CLOSE_SEARCH_MODAL,
  GET_MORE_DATA,
  SET_PARSED_DATA,
  SET_LABEL_TYPE
} from '../constants/ActionTypes'

export function uploadPhoto() {
  return {
    type: UPLOAD_PHOTO,
  }
}

export function selectedPhoto(photo) {
  return {
    type: SELECTED_PHOTO,
    photo
  }
}

export function clearData() {
  return {
    type: CLEAR_DATA,
  }
}

export function getLabelId(userId, labelId) {
  return {
    type: GET_LABEL_ID,
    userId,
    labelId
  }
}

export function postLabelId(labelId, comment) {
  return {
    type: POST_LABEL_ID,
    labelId,
    comment
  }
}

export function sendSerializedData(composite, full) {
  return {
    type: SEND_SERIALIZED_DATA,
    composite,
    full
  }
}

export function setParsedData(parsedData) {
  return {
    type: SET_PARSED_DATA,
    parsedData
  }
}

export function storeParsedData(parsedData, missingData, rawData, title, dietary, allergen) {
  return {
    type: STORE_PARSED_DATA,
    parsedData,
    missingData,
    rawData,
    title,
    dietary,
    allergen
  }
}

export function lazyFetchFirebase(foodName, ingredient, key, index) {
  return {
    type: LAZY_FETCH_FIREBASE,
    foodName,
    ingredient,
    key,
    index
  }
}

export function modelReset() {
  return {
    type: MODEL_RESET
  }
}

export function nutritionModelAddIng(tag, ingredientModel, quantity, unit, append) {
  return {
    type: NM_ADD_INGREDIENT,
    tag,
    ingredientModel,
    quantity,
    unit,
    append
  }
}

export function nutritionModelRemIng(tag) {
  return {
    type: NM_REM_INGREDIENT,
    tag
  }
}

export function nutritionModelSetServings(servingsControlModel) {
  return {
    type: NM_SET_SERVINGS,
    servingsControlModel
  }
}

export function nutritionModelScaleIng(tag, value, units) {
  return {
    type: NM_SCALE_INGREDIENT,
    tag,
    value,
    units
  }
}

export function ingredientAddModel(tag, ingredientControlModel) {
  return {
    type: IM_ADD_CONTROL_MODEL,
    tag,
    ingredientControlModel
  }
}

export function updateIngredientControlModel(tag, ingredientControlModel) {
  return {
    type: IM_UPDATE_MODEL,
    tag,
    ingredientControlModel
  }
}

export function ingredientModelRemTag(tag) {
  return {
    type: IM_REM_INGREDIENT_TAG,
    tag
  }
}

export function setServingsControllerModel(servingsControlModel) {
  return {
    type: SC_STORE_MODEL,
    servingsControlModel
  }
}

export function selectedTags(tags) {
  return {
    type: SELECTED_TAGS,
    tags
  }
}

export function deletedTags(tags) {
  return {
    type: DELETED_TAGS,
    tags
  }
}

export function unusedTags(tags) {
  return {
    type: UNUSED_TAGS,
    tags
  }
}

export function replacedTags(tags) {
  return {
    type: REPLACED_TAGS,
    tags
  }
}

export function initEmailFlow() {
  return {
    type: INIT_EMAIL_FLOW
  }
}

export function getEmailData(data) {
  return {
    type: GET_EMAIL_DATA,
    data
  }
}

export function completeMatchDropdownChange(tag, value) {
  return {
    type: COMPLETE_DROPDOWN_CHANGE,
    tag,
    value
  }
}

export function sendUserGeneratedData(data, labelId, userId) {
  return {
    type: SEND_USER_GENERATED_DATA,
    data,
    labelId,
    userId
  }
}

export function addSearchSelection(searchResult, index) {
  return {
    type: ADD_SEARCH_SELECTION,
    searchResult,
    index
  }
}

export function closeSearchModal() {
  return {
    type: CLOSE_SEARCH_MODAL
  }
}

export function getMoreData(foodName) {
  return {
    type: GET_MORE_DATA,
    foodName
  }
}

export function setLabelType(labelType) {
  return {
    type: SET_LABEL_TYPE,
    labelType
  }
}