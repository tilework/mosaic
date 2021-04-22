export interface MosaicConfig {
    extensions?: {
        [key: string]: boolean
    }
    sourceDirectories?: string[]
    preference?: string
}

/**
 * Get mosaic config from package.json file
 * @param pathname path to a directory with package.json or package.json object
 */
export const getMosaicConfig: (pathname: string, context?: string) => MosaicConfig;
