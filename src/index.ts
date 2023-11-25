/* 外部方法 */
import { join, basename } from 'path'

/* 內部方法 */
import { BaseConfig } from './types/index.js'
import { helper, fileHandler, ffmpegHandler, imageHandler } from './utils/index.js'

async function main() {
  const { list, defaultConfig } = fileHandler.getConfig()

  for (const item of list) {
    let handleSource: null | string[] = null
    let handleConfig: null | BaseConfig = null

    const isSourcePath = typeof item === 'string'

    if (isSourcePath) {
      handleSource = [item]
      handleConfig = defaultConfig
    } else {
      const { sourceDirs, ...config } = item
      handleSource = sourceDirs
      handleConfig = { ...config }
    }

    const systemDefaultConfig = helper.defaultConfig()
    const { top, left, row, col, exportPath, targetExtensions, resize } = { ...systemDefaultConfig, ...handleConfig }

    const totalNum = row * col

    for (const videoDir of handleSource) {
      const videoNames = fileHandler.getTargetExtFile(videoDir, targetExtensions)

      for (const videoName of videoNames) {
        const videoPath = join(videoDir, videoName)

        const isLess10Mb = helper.isFileSizeLessThan(videoPath)
        if (isLess10Mb) continue

        const { screenshotPaths, timeStamps } = await ffmpegHandler.countScreenshot(videoPath, totalNum, exportPath)

        const imgs = await imageHandler.addTimestampsToImg(screenshotPaths, timeStamps, { top, left })

        await imageHandler.combineScreenshots(col, imgs, { exportPath, exportFileName: basename(videoName), resize })
      }
    }
  }
}

main()
