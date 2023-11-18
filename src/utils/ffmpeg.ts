'use strict'

import path from 'path'
import cp from 'child_process'

type GetMediaDurationRes<T extends boolean> = T extends boolean ? number : string

interface GetScreenshotCmdOptions {
  exportPath?: string
  exportAppendName?: string
}

interface GetScreenshotCmdExports {
  commands: string[]
  screenshotPaths: string[]
}

export default {
  getMediaDuration<T extends boolean>(videoPath: string, showInSeconds = true): GetMediaDurationRes<T> {
    let command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 `

    if (!showInSeconds) command += ' -sexagesimal'

    command += ` ${videoPath}`

    const stdout = cp.execSync(command).toString()

    return (showInSeconds ? parseFloat(stdout) : stdout) as GetMediaDurationRes<T>
  },

  getScreenshotCmd(timeStamps: number[], videoPath: string, option: GetScreenshotCmdOptions = {}): GetScreenshotCmdExports {
    const { exportPath, exportAppendName = '_screenshot' } = option

    const { dir, name } = path.parse(videoPath)
    const exportFilePath = exportPath || dir
    const exportName = path.join(exportFilePath, `${name}${exportAppendName}`)

    const commands = timeStamps.map((t, i) => `ffmpeg -y -ss ${t} -i ${videoPath} -vframes 1 ${exportName}_${String(i + 1).padStart(3, '0')}.jpg`)

    const screenshotPaths = timeStamps.map((_, i) => `${exportName}_${String(i + 1).padStart(3, '0')}.jpg`)

    return { commands, screenshotPaths }
  },

  async countScreenshot(videoPath: string, count: number, exportPath?: string) {
    const duration = await this.getMediaDuration(videoPath)

    const interval = +(duration / count).toFixed(2)
    const timeStamps = Array.from({ length: count }).map((_, i) => interval * i)

    const { commands, screenshotPaths } = this.getScreenshotCmd(timeStamps, videoPath, { exportPath })

    for (const command of commands) {
      cp.spawnSync(command, { shell: true })
    }

    return { screenshotPaths, timeStamps }
  },
}
