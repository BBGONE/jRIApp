import * as React from "react";
import Pager from './pager';
import { IPagerProps, IPagerModel, IPagerState } from "./int";

export class PagerApp extends React.Component<IPagerProps<IPagerModel>> {
    constructor(props) {
        super(props);
    }
    render() {
        const model = this.props.model, actions = this.props.actions;
        return (
            <Pager
                total={model.total}
                current={model.current}
                visiblePages={model.visiblePage}
                titles={{ first: '<|', last: '|>' }}
                onPageChanged={(newPage) => actions.pageChanged(newPage)}
            />
        ); 
    }
}