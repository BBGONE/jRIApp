import * as React from "react";
import { IProps, IReactView } from "./int";



export class Temperature extends React.Component<IProps<IReactView>> {
    private _model: IReactView;
    private _spacerStyle: any;
    private _spanStyle: any;

    constructor(props) {
        super(props);
        this._model = this.props.model;
        this._model.objEvents.onProp("value", (s, a) => {
            this.forceUpdate();
        }, "tempreact");

        this._spacerStyle = {
            display: 'inline-block',
            marginLeft: '15px',
            marginRight: '5px'
        };
        this._spanStyle = {
            color: 'blue'
        };
    }
    componentWillUnmount(): void {
        this._model.objEvents.offNS("tempreact");
        this._model = null;
    }
    render() {
        const model = this.model;
        return (
        <fieldset>
                <legend>This a React component</legend>
                <input value={model.value} onChange={(e) => model.value = e.target.value} />
                <span style={this._spacerStyle}>You entered: </span>
                <span style={this._spanStyle}>{model.value}</span>
        </fieldset>
        );
    }
    get model(): IReactView {
        return this._model;
    }
}