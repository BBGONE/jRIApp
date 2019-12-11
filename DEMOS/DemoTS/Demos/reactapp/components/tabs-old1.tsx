import * as React from "react";

interface ITabsContext {
    activeContent: React.ReactNode | null;
    activeName: string | null;
    handleTabClick?: (name: string) => void;
    setActiveContent: (activeName: string, content: React.ReactNode) => void;
}

const TabsContext = React.createContext<ITabsContext>({ activeContent: null, activeName: null, setActiveContent: null });

export interface ITabsState {
    activeName: string;
    activeContent: React.ReactNode
}

export interface ITabsProps {
    activeName?: string; // name of the active tab (must be unique)
    onClick?: (name: string) => void
}

interface ITabProps {
  name: string;
  heading: () => string | JSX.Element;
}

interface InjectedProps {
    tabsContext: ITabsContext;
}

class Tab extends React.Component<ITabProps & InjectedProps> {
    constructor(props) {
        super(props);
    }

    private _updateTabsContent(): void {
        if (!this.props.tabsContext) {
            throw new Error("tabsContext is unavailable");
        }
        const context = this.props.tabsContext;
        if (!context.activeContent && this.props.name === context.activeName) {
            context.setActiveContent(this.props.name, this.props.children);
        }
    }

    public componentDidMount() {
        this._updateTabsContent();
    }

    public componentDidUpdate() {
        this._updateTabsContent();
    }

    public render() {
        const context = this.props.tabsContext;
        const activeName = context.activeName;
        const handleTabClick = (e: React.MouseEvent<HTMLDivElement>) => {
            context.setActiveContent(this.props.name, this.props.children);
            if (!!context.handleTabClick) {
                context.handleTabClick(this.props.name);
            }
        };

        return (
            <div onClick={handleTabClick} className={this.props.name === activeName ? "demo-tab active" : "demo-tab"}>
                {this.props.heading()}
            </div>
        );
    }
}

interface HOCComponent {
    (Element: React.ComponentClass<ITabProps & InjectedProps>): React.FunctionComponent<ITabProps>;
}

const withTabsContext: HOCComponent = TabElement => {
    const Res: React.SFC<ITabProps> = props => (
        <TabsContext.Consumer>
            {(context: ITabsContext) => <TabElement tabsContext={context} {...props} />}
        </TabsContext.Consumer>
    ); 

    return Res;
};

class Tabs extends React.Component<ITabsProps, ITabsState> {
    public static Tab = withTabsContext(Tab);

    constructor(props) {
        super(props);
        this.state = {
            activeName: null,
            activeContent: null
        };
    }

    static getDerivedStateFromProps(props: ITabsProps, state: ITabsState): Partial<ITabsState> | null {
        if (props.activeName !== state.activeName) {
            // invalidate saved active content, because the activeName changed
            return { activeContent: null };
        } else {
            return null;
        }
    }

    public render() {
        return (
            <TabsContext.Provider
                value={{
                    activeContent: this.state.activeContent,
                    activeName: this.props.activeName,
                    handleTabClick: this._handleTabClick,
                    setActiveContent: this._setActiveContent
                }}
            >
                <div className="demo-tabs">{this.props.children}</div>
                <div className="demo-tabs-content">{this.state && this.state.activeContent}</div>
            </TabsContext.Provider>
        );
    }

    private _setActiveContent = (activeName: string, content: React.ReactNode) => {
        this.setState({ activeContent: content, activeName: activeName });
    };

    private _handleTabClick = (name: string) => {
        if (!!this.props.onClick) {
            this.props.onClick(name);
        }
    };
}

export default Tabs;
