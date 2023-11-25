'use strict'

import fs from 'fs'
import path from 'path'
import * as url from 'url'
import promiseFs from 'fs/promises'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export default {
  convertSecondsToTime(seconds: number) {
    const sec = seconds.toFixed(0)
    const hours = Math.floor(+sec / 3600)
    const minutes = Math.floor((+sec % 3600) / 60)
    const remainingSeconds = +sec % 60

    return {
      hours: hours,
      minutes: minutes,
      seconds: remainingSeconds,
    }
  },

  async deleteFiles(filePaths: string[]) {
    const jobs = filePaths.map((i) => promiseFs.unlink(i))
    await Promise.all(jobs)
  },

  defaultConfig() {
    return {
      top: 5,
      left: 5,
      row: 3,
      col: 3,
      targetExtensions: ['.ts', '.mp4'],
    }
  },

  isFileSizeLessThan(filePath: string, minSize: number = 10) {
    if (!fs.existsSync(filePath)) return

    const { size } = fs.statSync(filePath)

    const sizeInMegaBytes = size / (1024 * 1024)

    return sizeInMegaBytes < minSize
  },
}
