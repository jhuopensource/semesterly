import {initialState} from "./user_info_reducer";
import * as ActionTypes from "../constants/actionTypes";

const homeInfo = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.INIT_STATE:
            return Object.assign({}, state, { data: action.data.currentHome });
        default:
            return state;
    }
};

export default homeInfo;