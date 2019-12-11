import { connect } from 'react-redux';
import { IPagerState } from "../abstractions/pager";
import { propertyChanged, PropChangedAction } from "../actions/common";
import Pager from './pager';


const mapStateToProps = (storeData: IPagerState) => {
    return storeData;
}

const mapDispatchToProps = (dispatch: (action: PropChangedAction<any, IPagerState>) => void) => {
    return {
        onPageChanged: function (newPage: number) {
            dispatch(propertyChanged<number, IPagerState>("current", newPage));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pager);