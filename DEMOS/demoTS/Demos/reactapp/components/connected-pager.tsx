import { connect } from 'react-redux';
import { IPagerModel } from "../abstractions/pager";
import { propertyChanged, Action } from "../actions/pager-actions";
import Pager from './pager';


const mapStateToProps = (storeData: IPagerModel) => {
    return storeData;
}

const mapDispatchToProps = (dispatch: (action: Action<any>) => void) => {
    return {
        onPageChanged: function (newPage: number) {
            dispatch(propertyChanged("current", newPage));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pager);