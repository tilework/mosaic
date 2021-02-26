export interface WebpackInjectorConfig {
    // Inject definitions into ProvidePlugin
    provideGlobals: boolean

    // Support util/extensions
    supportLegacy: boolean,

    // They may be several entry points for plugins
    // These files will be injected with ExtUtils.setPlugins
    entryMatcher: string | function | RegExp,

    // Instance of webpack that the application uses
    webpack: any
}
