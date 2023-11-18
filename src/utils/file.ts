/* 外部方法 */
import fs from 'fs'
import path from 'path'
import * as url from 'url'

/* 型別 */
import { Config } from '../types'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export default {
  getJsonFile(dir: string, filename: string) {
    try {
      const result = fs.readFileSync(path.join(dir, `${filename}.json`), 'utf8')
      return JSON.parse(result)
    } catch (error) {
      console.error(error)
    }
  },

  getConfig(): Config {
    return this.getJsonFile(path.join(__dirname, '../..'), 'config')
  },

  getTargetExtFile(sourceDir: string, exts: string[]) {
    return fs.readdirSync(sourceDir).filter((i) => exts.includes(path.extname(i)))
  },
}
