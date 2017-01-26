import {
  AN_CLEAR_DATA,
  ADD_CAPTION,
  AN_SELECTED_PHOTO,
  SELECTED_PHOTO,
  IG_UPDATED_CAPTION,
  RESULT_URL,
  SEND_SERIALIZED_DATA,
  STORE_PARSED_DATA,
  CLEAR_FIREBASE_DATA,
  INITIALIZE_FIREBASE_DATA,
  INGREDIENT_FIREBASE_DATA,
  LAZY_LOAD_FIREBASE,
  LAZY_FETCH_FIREBASE,
  RESET_LAZY_LOAD_STATUS,
  CLEAN_REDUCERS
} from '../constants/ActionTypes'

const initialState = {
  link: '',
  picture: '',
  caption: '',
  updatedCaption: '',
  username: '',
  anonymous: false,
  resultUrl: '',
  key: '',
  composite: '',
  full: '',
  index: 0,
  rawData: '',
  parsedData: [],
  matchData: {},
  recipeFlag: false,
  lazyLoadOperation: {
    status: '',
    tag: undefined,
    value: undefined
  }
}
export default function nutrition(state = initialState, action) {
  switch (action.type) {
    case CLEAN_REDUCERS:
    case AN_CLEAR_DATA:
      return {
        ...initialState
      }
    case ADD_CAPTION:
      return {
        ...state,
        caption: action.caption
      }
    case AN_SELECTED_PHOTO:
      return {
        ...state,
        anonymous: true,
        picture: action.photo,
        link: '',
        username: 'anonymous',
      }
    case SELECTED_PHOTO:
      return {
        ...state,
        index: action.index,
        link: action.photo.link,
        picture: action.photo.picture,
        caption: action.photo.caption.text,
        username: action.photo.user.username
      }
    case IG_UPDATED_CAPTION:
      return {
        ...state,
        updatedCaption: action.caption
      }
    case RESULT_URL:
      return {
        ...state,
        resultUrl: action.url,
        key: action.key,
        anonymous: action.anonymous,
      }
    case SEND_SERIALIZED_DATA:
      return {
        ...state,
        composite: action.composite,
        full: action.full
      }
    case STORE_PARSED_DATA:
      return {
        ...state,
        parsedData: action.parsedData,
        rawData: action.rawData,
        recipeFlag: action.recipeFlag
      }
    //
    // FIREBASE DATA:
    // Data structure:
    //
    //  matchData: {
    //    searchTerm1: [
    //      [description1, ndbNo1, dataObj1],
    //      [description2, ndbNo2, dataObj2],
    //      ...
    //      ...
    //    ],
    //    searchTerm2: [
    //      [descriptionM, ndbNoM, dataObjM],
    //      [descriptionN, ndbNoN, dataObjN],
    //      ...
    //    ],
    //    ...
    //  }
    case CLEAR_FIREBASE_DATA:
      {
        let localMatchData = {}

        return {
          ...state,
          matchData: localMatchData
        }
      }
    //
    case INITIALIZE_FIREBASE_DATA:
      {
        // Initializes our dictionary of match data with ordered arrays of tuples
        // containing the description, ndbNo and undefined:
        // Clear the match data to prevent populating it twice on 'back' button actions etc.
        let localMatchData = state.matchData
        if (action.foodName in localMatchData) {
          return
        }

        localMatchData[action.foodName] = []

        for (let obj of action.json.data) {
          let dataEntry = [obj._source.Description, obj._id, undefined]
          localMatchData[action.foodName].push(dataEntry)
        }

        return {
          ...state,
          matchData: localMatchData
        }
      }
    case LAZY_FETCH_FIREBASE:
      {
        let lazyLoadOperation = {
          status: 'inProgress',
          tag: action.ingredient,
          value: action.foodName
        }

        return {
          ...state,
          lazyLoadOperation: lazyLoadOperation
        }
      }
    case LAZY_LOAD_FIREBASE:
      {
        let {matchData} = state
        const dataObjOffset = 2
        matchData[action.ingredient][action.index][dataObjOffset] = action.data

        let {lazyLoadOperation} = state
        lazyLoadOperation.status = 'done'

        return {
          ...state,
          matchData,
          lazyLoadOperation: lazyLoadOperation
        }
      }
    case RESET_LAZY_LOAD_STATUS:
      {
        return {
          ...state,
          lazyLoadOperation: {
            status: 'idle',
            tag: undefined,
            value: undefined
          }
        }
      }
    case INGREDIENT_FIREBASE_DATA:
      {
        // console.log('nutritionReducer: INGREDIENT_FIREBASE_DATA --------------');
        // console.log(action.foodName);
        // console.log(action.json);

        // Performs an ordered insertion of the data returned by firebase for the
        // key (ndbNo) returned from elastic search:
        const descriptionOffset = 0
        const dataObjOffset = 2

        let localMatchData = state.matchData
        if (action.foodName in localMatchData) {
          let foodNameArr = localMatchData[action.foodName]

          for (let tupleIdx = 0; tupleIdx < foodNameArr.length; tupleIdx++) {
            if (action.ingredient === foodNameArr[tupleIdx][descriptionOffset]) {
              foodNameArr[tupleIdx][dataObjOffset] = action.data
              break
            }
          }
        } else {
          console.log('nutritionReducer - error in INGREDIENT_FIREBASE_DATA');
          console.log(action.foodName);
          console.log(localMatchData.length);
        }

        return {
          ...state,
          matchData: localMatchData
        }
      }
    default:
      return state
  }
}
