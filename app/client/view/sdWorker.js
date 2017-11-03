const worker = this
worker.importScripts(
  'https://cdnjs.cloudflare.com/ajax/libs/showdown/1.8.1/showdown.js', 
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js'
)

worker.showdown.extension('codehighlight', codeHighlight)

const converter = new worker.showdown.Converter({ extensions: ['codehighlight'] });

function codeHighlight() {
  function htmlunencode (text) {
    return text.replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  }
  
  function filterFunc (text, converter, options) {
    const [left, right] = ['<code\\b[^>]*>', '</code>']

    function replacement(wholeMatch, match, left, right) {
      match = htmlunencode(match)
      return `${left}${worker.hljs.highlightAuto(match).value}${right}`
    }
    return worker.showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, 'g')
  }

  return [{type: 'output', filter: filterFunc}]
}

addEventListener('message', d => {
  const markdown = d.data.md
  const id = d.data.id
  const html = converter.makeHtml(markdown)
  postMessage({id, html})
})