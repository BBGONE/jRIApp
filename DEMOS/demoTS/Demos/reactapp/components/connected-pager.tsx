import { connect } from 'react-redux';
import { IPagerModel } from "./int";
import Pager from './pager';

export interface Action<T> {
    type: string;
    value: T;
}

export const enum ActionTypes {
    CHANGE_TOTAL = "CHANGE_TOTAL",
    CHANGE_CURRENT = "CHANGE_CURRENT",
    CHANGE_VISIBLE_PAGES = "CHANGE_VISIBLE_PAGES"
}

const mapStateToProps = (storeData: IPagerModel) => {
    return storeData;
}

const mapDispatchToProps = (dispatch: (action: Action<any>) => void) => {
    return {
        onPageChanged: function (newPage: number) {
            dispatch({ type: ActionTypes.CHANGE_CURRENT, value: newPage });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pager);

