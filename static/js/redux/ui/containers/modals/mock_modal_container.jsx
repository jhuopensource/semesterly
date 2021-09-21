import { connect } from 'react-redux';
import MockModal from '../../modals/mock_modal';
import { toggleMockModal } from '../../../actions/modal_actions';

const mapStateToProps = state => ({
  isVisible: state.mockModal.isVisible,
  userInfo: state.userInfo.data,
});

const UserAcquisitionModalContainer = connect(
  mapStateToProps,
  {
    toggleMockModal
  },
)(MockModal);

export default UserAcquisitionModalContainer;