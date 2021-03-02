
import * as ActionTypes from '../constants/actionTypes';

const mockModal = (state = { isVisible: false }, action) => {
    switch (action.type) {
        case ActionTypes.TOGGLE_MOCK_MODAL:
            return { isVisible: !state.isVisible };
        default:
            return state;
    }
};

export default mockModal;
