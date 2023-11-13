import fs from 'fs'
import path from 'path'
import * as url from 'url'

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

  getConfig() {
    return this.getJsonFile(path.join(__dirname, '../..'), 'config')
  },
}
