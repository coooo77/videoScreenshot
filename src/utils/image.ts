'use strict'

/* 外部方法 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { joinImages } from 'join-images'

/* 內部方法 */
import { helper } from './index.js'
import type { Resize } from '../types/index.js'

const defaultAddTimestampsOption = {
  top: 5,
  left: 5,
}

interface combineScreenshotsOptions {
  exportPath?: string
  exportFileName?: string
  resize?: Resize
}

export default {
  async addTimestampsToImg(screenshotPaths: string[], timeStamps: number[], option: Partial<typeof defaultAddTimestampsOption> = {}) {
    const { top, left } = { ...defaultAddTimestampsOption, ...option }

    const timestampImgs: string[] = []
    for (let i = 0; i < screenshotPaths.length; i++) {
      const timeStamp = timeStamps[i]
      const screenshot = screenshotPaths[i]

      const { hours, minutes, seconds } = helper.convertSecondsToTime(timeStamp)
      const time = [hours, minutes, seconds].map((i) => String(i).padStart(2, '0')).join(':')

      const instance = sharp(screenshot).composite([
        {
          top,
          left,
          input: {
            text: {
              dpi: 300,
              rgba: true,
              text: `<span weight="bold" size="xx-large" foreground="#90C2FF" background="#151515"> ${time} </span>`,
            },
          },
        },
      ])

      const { dir, name } = path.parse(screenshot)
      const imgName = path.join(dir, `${name}_withTime.jpg`)
      await instance.toFile(path.join(imgName))
      fs.unlinkSync(screenshot)
      timestampImgs.push(imgName)
    }

    return timestampImgs
  },

  async combineScreenshots(col: number, images: string[], option: combineScreenshotsOptions = {}) {
    const { exportPath, exportFileName, resize } = option
    const { dir } = path.parse(images[0])
    const toPath = exportPath || dir

    let count = 0
    const combinedImagePaths: string[] = []

    for (let i = 0; i < images.length; i += col) {
      const imgsToCombine = images.slice(i, i + col)
      const combineName = `screen_col_combined_${String(++count).padStart(3, '0')}.jpg`
      const combineImgPath = path.join(toPath, combineName)

      const img = await joinImages(imgsToCombine, { direction: 'horizontal', offset: 50 })
      await img.toFile(combineImgPath)
      await helper.deleteFiles(imgsToCombine)
      combinedImagePaths.push(combineImgPath)
    }

    const screenshot = await joinImages(combinedImagePaths, { offset: 50 })
    await helper.deleteFiles(combinedImagePaths)

    const screenshotOutputPath = path.join(toPath, `${exportFileName}.jpg`)

    if (resize) {
      const tempImg = path.join(toPath, `${new Date().getTime()}.jpg`)
      await screenshot.toFile(tempImg)
      await sharp(tempImg).resize(resize).toFile(screenshotOutputPath)
      await helper.deleteFiles([tempImg])
    } else {
      await screenshot.toFile(screenshotOutputPath)
    }
  },
}
