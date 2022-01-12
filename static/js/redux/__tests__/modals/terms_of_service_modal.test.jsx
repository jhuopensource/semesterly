/*
Copyright (C) 2017 Semester.ly Technologies, LLC

Semester.ly is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Semester.ly is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { renderWithRedux } from '../../test-utils';
import {
  tosModalFixture,
  userInfoFixture,
} from '../../__fixtures__/terms_of_service_modal.fixture';
import { handleAgreement } from '../../actions/user_actions';
import * as ActionTypes from '../../constants/actionTypes';
import TermsOfServiceModalContainer from '../../ui/containers/terms_of_service_modal_container';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('TOS Modal', () => {
  it('shows when isVisible is true', () => {
    const initialState = {
      termsOfServiceModal: tosModalFixture,
      userInfo: userInfoFixture,
    };

    const { container } = renderWithRedux(<TermsOfServiceModalContainer />, {
      preloadedState: initialState,
    });
    expect(container).toHaveTextContent('Our Terms of Service and Privacy Policy have been updated');
  });

  it('shows welcome message for new users', () => {
    const newUser = userInfoFixture;
    newUser.data.timeAcceptedTos = null;
    const initialState = {
      termsOfServiceModal: tosModalFixture,
      userInfo: userInfoFixture,
    };
    const { container } = renderWithRedux(<TermsOfServiceModalContainer />, {
      preloadedState: initialState,
    });
    expect(container).toHaveTextContent('Welcome to Semester.ly');
  });

  it('is hidden when isVisible is false', () => {
    const initialState = {
      termsOfServiceModal: { ...tosModalFixture, isVisible: false },
      userInfo: userInfoFixture,
    };
    const { container } = renderWithRedux(<TermsOfServiceModalContainer />, {
      preloadedState: initialState,
    });
    expect(container).toBeEmptyDOMElement();
  });
});

describe('HandleAgreement correctly triggers tosMODAL', () => {
  it('if unaccepted', () => {
    const store = mockStore({
      termsOfServiceModal: tosModalFixture,
      userInfo: userInfoFixture,
    });

    const currentUser = {
      timeAcceptedTos: null,
      isLoggedIn: true,
    };

    store.dispatch(handleAgreement(currentUser, Date.now()));
    const expectedActions = store.getActions();
    expect(expectedActions[0]).toEqual({ type: ActionTypes.TRIGGER_TOS_MODAL });
  });

  it('if accepted but outdated', () => {
    const store = mockStore({
      termsOfServiceModal: tosModalFixture,
      userInfo: userInfoFixture,
    });

    const currentUser = {
      timeAcceptedTos: 0,
      isLoggedIn: true,
    };

    store.dispatch(handleAgreement(currentUser, Date.parse(1)));
    const expectedActions = store.getActions();
    expect(expectedActions[0]).toEqual({ type: ActionTypes.TRIGGER_TOS_MODAL });
  });

  it('empty if logged in and accepted', () => {
    const store = mockStore({
      termsOfServiceModal: tosModalFixture,
      userInfo: userInfoFixture,
    });

    const currentUser = {
      timeAcceptedTos: 2,
      isLoggedIn: true,
    };

    store.dispatch(handleAgreement(currentUser, Date.parse(1)));
    const expectedActions = store.getActions();
    expect(expectedActions).toEqual([]);
  });
});
