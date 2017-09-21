describe('Root of API', () => {
  const request = require('supertest')
  const express = require('express')

  const app = express();

  const mockBlog = express.Router()
  mockBlog.use('/', (req, res) => {
    res.send('something')
  })

  jest.mock('../../server/routes/blog', () => mockBlog)
  app.use('/api', require('../../server/routes/api'))

  test('Request to /api/blog', () => {
    return request(app).get('/api/blog').then(res => {
      expect(res.text).toBe('something')
    })
  })

  test('Request to non-existant route', () => {
    return request(app).get('/api/job').then(res => {
      expect(res.status).toBe(404)
    })
  })
})