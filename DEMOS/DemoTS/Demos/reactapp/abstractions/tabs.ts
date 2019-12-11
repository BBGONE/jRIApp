export interface ITabContent {
    name: string;
    heading: {
        templateId: string;
        dataContext: object;
    }
    content: {
        templateId: string;
        dataContext: object;
    }
}

export interface ITabsProps {
    tabs: ITabContent[];
    activeName?: string; // name of the active tab (must be unique)
    onClick?: (name: string) => void
}

export interface ITabProps {
    isActive: boolean;
    name: string;
    heading: {
        templateId: string;
        dataContext: object;
    }
    onClick: (name: string) => void;
}
