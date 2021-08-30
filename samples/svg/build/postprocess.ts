import * as fs from 'fs'
import * as path from 'path'

const htmlData = require(path.resolve(__dirname, '../raw-data/svg-html-contribution.json'))
const cssData = require(path.resolve(__dirname, '../raw-data/svg-css-contribution.json'))

function transform(entry : any) {
  const result = {
    kind: 'markdown',
    value: ''
  }

  if (entry.description) {
    result.value += entry.description
  }

  if (entry.syntax) {
    result.value += `\n\nSyntax: ${entry.syntax}`
    delete entry.syntax
  }
  
  if (entry.status) {
    result.value += `\n\nStatus: ${entry.status}`
    delete entry.status
  }
  
  if (entry.browsers) {
    result.value += `\n\nSupported browsers: ${entry.browsers.join(',')}`
    delete entry.browsers
  }
  console.log(result.value)
  
  entry.description = result
}

cssData.properties.forEach(transform)

// fs.writeFileSync(path.resolve(__dirname, '../data/svg.html-data.json'), JSON.stringify(htmlData, null, 2));
fs.writeFileSync(path.resolve(__dirname, '../data/svg.css-data.json'), JSON.stringify(cssData, null, 2));
console.log('Done')