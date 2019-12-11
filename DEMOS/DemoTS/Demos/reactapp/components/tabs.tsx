import * as React from "react";
import { ITabContent, ITabProps, ITabsProps } from "../abstractions/tabs";
import Template from "../components/template";

const Tab: React.SFC<ITabProps> = props => {
    return (
        <Template onClick={() => {
            if (props.onClick) {
                props.onClick(props.name);
            }
        }} className={props.isActive ? "demo-tab active" : "demo-tab"} templateId={props.heading.templateId} dataContext={props.heading.dataContext} />
    );
};

class Tabs extends React.Component<ITabsProps> {

    public render() {
        let activeTab: ITabContent = null;
        const { tabs, activeName } = this.props;

        if (!!activeName) {
            const temp = tabs.filter((t) => t.name === activeName);
            if (temp.length > 0)
                activeTab = temp[0];
        }

        if (!activeTab && tabs.length > 0) {
            activeTab = tabs[0];
        }

        return (
            <React.Fragment>
                <div className="demo-tabs">{tabs.map((tab) => {
                    return (
                        <Tab key={tab.name} onClick={this._handleTabClick} name={tab.name} heading={tab.heading} isActive={activeTab === tab} />
                    );
                })}</div>

                {!!activeTab && (
                    <Template className="demo-tabs-content" templateId={activeTab.content.templateId} dataContext={activeTab.content.dataContext} />
                )}

                {!activeTab && (
                    <div className="demo-tabs-content"></div>
                )}
            </React.Fragment>
        );
    }

    private _handleTabClick = (name: string) => {
        if (!!this.props.onClick)
            this.props.onClick(name);
    };
}

export default Tabs;
