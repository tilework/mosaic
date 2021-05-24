/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@tilework/mosaic-config-injectors' {
    export interface WebpackInjectorConfig {
        // Inject definitions into ProvidePlugin
        provideGlobals: boolean
    
        // Support util/extensions
        supportLegacy: boolean,

        // Handle plugins during the injection
        shouldApplyPlugins: boolean,
    
        // They may be several entry points for plugins
        // These files will be injected with Mosaic.setPlugins
        entryMatcher: string | ((filepath: string) => boolean) | RegExp,
    
        // Instance of webpack that the application uses
        webpack: any
    }

    export interface BabelInjectorConfig {
        // Handle plugins during the injection
        shouldApplyPlugins: boolean
    }

    export function injectWebpackConfig(webpackConfig: any, options: WebpackInjectorConfig): any;
    export function injectBabelConfig(babelConfig: any, options: BabelInjectorConfig): any;
    export function injectNextConfig(nextConfig: any, args: any[]): any;
}
