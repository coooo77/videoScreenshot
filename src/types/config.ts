'use strict'

export type PathLikeString = string

export interface Resize {
  width: number
  height: number
}

export interface BaseConfig {
  exportPath?: PathLikeString
  row?: number
  col?: number
  resize?: Resize
  top?: number
  left?: number
  targetExtensions?: string[]
}

export interface ScreenshotConfig extends BaseConfig {
  sourceDirs: string[]
}

export interface Config {
  list: Array<PathLikeString | ScreenshotConfig>
  defaultConfig: BaseConfig
}
