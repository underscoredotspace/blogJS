describe('showdownConfig', () => {
  require('angular')
  require('angular-cookies')
  require('angular-route')
  require('angular-sanitize')
  window.hljs = require('highlightjs')
  window.showdown = require('showdown')
  require('ng-showdown')
  require('angular-mocks')
  require('../../client/src/00-config.js')

  let $showdown

  beforeEach(() => {
    angular.mock.module('colonApp')
    
    inject(function($injector) {
      $showdown = $injector.get('$showdown')
    })
  })

  it('Showdown/HLJS integration', () => {
    expect($showdown.makeHtml('**markdown**')).toBe('<p><strong>markdown</strong></p>')

    const codeBlockInline = 'Test ``console.log(\'hello\')`` the inline bit'
    const codeBlockInlineMD = '<p>Test <code>console.<span class=\"hljs-built_in\">log</span>(<span class=\"hljs-string\">\'hello\'</span>)</code> the inline bit</p>'
    expect($showdown.makeHtml(codeBlockInline)).toBe(codeBlockInlineMD)
    
    const codeBlock = '```\nconsole.log(\'hello\')\n```'
    const codeBlockMD = '<pre><code>console.<span class=\"hljs-built_in\">log</span>(<span class=\"hljs-string\">\'hello\'</span>)\n</code></pre>'
    expect($showdown.makeHtml(codeBlock)).toBe(codeBlockMD)
  })
})