declare type JRIAppConfig = {
    debugLevel?: number;
    cssPath?: string; // "/Content/styles/"
    frameworkPath?: string; // "/Scripts/jriapp/"
    frameworkJS?: string; // "jriapp.js"
    bust?: string; // "bust=xyz"
}

declare const jriapp_config: JRIAppConfig;


