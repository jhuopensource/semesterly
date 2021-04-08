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

import { connect } from 'react-redux';
import InviteAdvisorsModal from '../../invite_advisors';
import { toggleInviteAdvisorsModal } from '../../../actions/modal_actions';
import { toggleConflicts } from '../../../actions/timetable_actions';

const mapStateToProps = state => ({
    // userInfo: state.userInfo.data,
    isVisible: state.inviteAdvisorsModal.isVisible,
    // withConflicts: state.preferences.try_with_conflicts,
});

const InviteAdvisorsModalContainer = connect(
    mapStateToProps,
    {
        toggleInviteAdvisorsModal,
        toggleConflicts,
        applyPreferences: toggleInviteAdvisorsModal,
    },
)(InviteAdvisorsModal);

export default InviteAdvisorsModalContainer;
