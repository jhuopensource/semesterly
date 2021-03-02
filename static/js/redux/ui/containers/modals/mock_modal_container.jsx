import { connect } from 'react-redux';
import MockModal from '../../modals/mock_modal';
import { toggleMockModal } from '../../../actions/modal_actions';


const mapStateToProps = state => ({
    isVisible: state.mockModal.isVisible,
});


const MockModalContainer = connect(
    mapStateToProps,
    {
        toggleMockModal,

    },
)(MockModal);

export default MockModalContainer;