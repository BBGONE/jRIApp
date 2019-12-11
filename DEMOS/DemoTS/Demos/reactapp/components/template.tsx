import * as React from 'react';
import { ITemplate } from "jriapp/int";
import { createTemplate } from "jriapp/template";
import { createWeakMap } from "jriapp_shared/utils/weakmap";

const weakmap = createWeakMap();

export interface ITemplateProps {
    templateId: string;
    dataContext: object | null | undefined;
    style?: object;
    className?: string;
    onClick?: (dataContext: object | null | undefined) => void;
}

function _updateTemplate(el: HTMLElement, props: ITemplateProps) {
    if (!!el) {
        const template = _getTemplate(el);
        if (!!template) {
            // template checks for changed values itself (no need to check here before assignement)
            template.templateID = props.templateId;
            template.dataContext = props.dataContext;
        }
    }
}

function _disposeTemplate(el: HTMLElement) {
    if (!!el) {
        const template = weakmap.get(el) as ITemplate;
        if (!!template) {
            template.dispose();
            weakmap.delete(el);
        }
    }
}

function _getTemplate(el: HTMLElement): ITemplate {
    if (!!el) {
        let template = weakmap.get(el) as ITemplate;
        if (!template) {
            template = createTemplate({ parentEl: el });
            weakmap.set(el, template);
        }
        return template;
    } else {
        return null;
    }
}

class Template extends React.Component<ITemplateProps> {
    private _elRef: HTMLElement;

    private readonly _handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!!this.props.onClick) {
            this.props.onClick(this.props.dataContext);
        }
    }

    private readonly _setRef = (element: HTMLElement | null) => {
        if (this._elRef !== element) {
            _disposeTemplate(this._elRef);
            this._elRef = element;
        }
    };

    componentDidMount() {
        _updateTemplate(this._elRef, this.props);
    }

    componentDidUpdate() {
        _updateTemplate(this._elRef, this.props);
    }

    shouldComponentUpdate(nextProps: ITemplateProps) {
        const templateChanged = this.props.dataContext !== nextProps.dataContext || this.props.templateId !== nextProps.templateId;
        let res = this.props.className !== nextProps.className || this.props.style !== nextProps.style || this.props.onClick !== nextProps.onClick;

        if (templateChanged && !res) {
            if (!!this._elRef) {
                // only template is updated
                _updateTemplate(this._elRef, nextProps);
            } else {
                res = true;
            }
        }
        return res;
    }

    constructor(props) {
        super(props);
        this._elRef = null;
    }

    render(): JSX.Element {
        const style = this.props.style ? this.props.style : {};
        const css = this.props.className ? this.props.className : "";

        return <div onClick={this._handleClick} className={css} style={style} ref={this._setRef} />;
    }
}

export default Template;
