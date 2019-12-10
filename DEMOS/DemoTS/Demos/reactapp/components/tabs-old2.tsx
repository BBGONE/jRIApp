import * as React from "react";
import { useRef, useCallback, useEffect, useContext, createContext } from "react";

interface ITabsContext {
    activeContent: React.ReactNode | null;
    activeName: string | null;
    handleTabClick?: (name: string) => void;
    setActiveContent: (activeName: string, content: React.ReactNode) => void;
}

const TabsContext = createContext<ITabsContext>({ activeContent: null, activeName: null, setActiveContent: null });

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

const Tab: React.SFC<ITabProps> = (props) => {
    const propsRef = useRef<React.PropsWithChildren<ITabProps>>(null);
    const context = useContext(TabsContext);
    const activeName = context.activeName;
    const { name, children, heading } = props;

    useEffect(() => {
        propsRef.current = props;
        if (!context.activeContent && name === context.activeName) {
            context.setActiveContent(name, children);
        }
    });

    const handleTabClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const { name, children } = propsRef.current;

        context.setActiveContent(name, children);
            if (!!context.handleTabClick) {
                context.handleTabClick(name);
            }
        },
        [context]
    );

    return (
        <div onClick={handleTabClick} className={name === activeName ? "demo-tab active" : "demo-tab"}>
            {heading()}
        </div>
    );
};


class Tabs extends React.Component<ITabsProps, ITabsState> {
    public static Tab = Tab;

    constructor(props: Readonly<ITabsProps>) {
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
