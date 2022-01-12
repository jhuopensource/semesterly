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
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRedux } from '../../test-utils';
import { userInfoFixture } from '../../__fixtures__/user_acquisition_modal.fixture';
import UserAcquisitionModal from '../../ui/modals/user_acquisition_modal';


describe('User Aquisition Modal', () => {
  it('shows when isVisible is true', () => {
    const initialState = {
      userAcquisitionModal: { isVisible: true },
      userInfo: userInfoFixture,
    };

    const { container } = renderWithRedux(<UserAcquisitionModal />, {
      preloadedState: initialState,
    });
    expect(container).toHaveTextContent('Login/Signup');
  });

  it('is hidden when isVisible is false', () => {
    const initialState = {
      userAcquisitionModal: { isVisible: false },
      userInfo: userInfoFixture,
    };
    const { container } = renderWithRedux(<UserAcquisitionModal />, {
      preloadedState: initialState,
    });
    expect(container).not.toHaveTextContent('Login/Signup');
  });
});
