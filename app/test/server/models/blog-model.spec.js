describe('blog model setup', () => {
  const Blog = require('../../../server/models/blog-model.js')

  test('Blog model got defined and is available', () => {
    expect(Blog).toBeInstanceOf(Function)
    expect(Blog.find).toBeInstanceOf(Function)
  })
})