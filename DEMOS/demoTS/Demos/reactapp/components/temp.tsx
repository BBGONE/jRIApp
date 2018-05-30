import * as React from "react";
import { ITempProps, ITempModel } from "./int";

export class Temperature extends React.Component<ITempProps<ITempModel>> {
    constructor(props) {
        super(props);
    }
    componentWillUnmount(): void {
    }
    render() {
        const model = this.props.model, styles = this.props.styles, actions = this.props.actions;
        return (
            <fieldset>
                <legend>{model.title ? model.title : 'This is a React component'}</legend>
                <input value={model.value} onChange={(e) => actions.tempChanged(e.target.value) } />
                <span style={styles.spacer}>You entered: </span>
                <span style={styles.span}>{model.value}</span>
        </fieldset>
        );
    }
}