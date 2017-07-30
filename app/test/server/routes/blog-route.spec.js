describe('Blog API', () => {
  const request = require('supertest')
  const express = require('express')
  const bodyParser = require('body-parser')

  const app = express();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  
  let mockResolve = [], 
  mockReject = {name:'name', message: 'message'}, 
  mockPromiseOk = true
  
  const mockPromise = jest.fn(() => {
    return new Promise((resolve, reject) => {
      if (mockPromiseOk) {
        resolve(mockResolve)
      } else {
        reject(mockReject)
      }
    })
  })
  
  let mockBlog, 
  mockReturn = jest.fn(() => mockBlog)
  
  mockBlog = {
    find: mockReturn,
    sort: mockReturn,
    skip: mockReturn,
    limit: mockReturn,
    findById: mockPromise
  }
  
  jest.mock('../../../server/models/blog-model', () => mockBlog)
  
  app.use('/api/blog', require('../../../server/routes/blog'))
  
  beforeEach(() => {
    jest.clearAllMocks()
  
    mockResolve = []
    mockReject = {name:'name', message: 'message'}
    mockPromiseOk = true

    mockBlog.limit = mockReturn
  })

  describe('GET', () => {
    test('Latest posts',  () => {
      mockBlog.limit = mockPromise

      return request(app).get('/api/blog').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.find).toHaveBeenCalled()
        expect(mockBlog.sort).toHaveBeenCalledWith({date:-1})
        expect(mockBlog.skip).toHaveBeenCalledWith(NaN)
        expect(mockBlog.limit).toHaveBeenCalledWith(3)
      })
    })

    test('Latest posts with page number 1',  () => {
      mockBlog.limit = mockPromise

      return request(app).get('/api/blog/1').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.find).toHaveBeenCalled()
        expect(mockBlog.sort).toHaveBeenCalledWith({date:-1})
        expect(mockBlog.skip).toHaveBeenCalledWith(0)
        expect(mockBlog.limit).toHaveBeenCalledWith(3)
      })
    })

    test('Latest posts with page number 2',  () => {
      mockBlog.limit = mockPromise

      return request(app).get('/api/blog/2').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.find).toHaveBeenCalled()
        expect(mockBlog.sort).toHaveBeenCalledWith({date:-1})
        expect(mockBlog.skip).toHaveBeenCalledWith(3)
        expect(mockBlog.limit).toHaveBeenCalledWith(3)
      })
    })

    test('Handle failure in blog/ & blog/:page',  () => {
      mockPromiseOk = false
      mockBlog.limit = mockPromise

      return request(app).get('/api/blog').then(res => {
        expect(res.status).toBe(400)
        expect(res.text).toBe('{\"err\":\"name\",\"message\":\"message\"}')
        expect(mockBlog.find).toHaveBeenCalled()
        expect(mockBlog.sort).toHaveBeenCalledWith({date:-1})
        expect(mockBlog.skip).toHaveBeenCalledWith()
        expect(mockBlog.limit).toHaveBeenCalledWith(3)
      })
    })

    test('Specific post',  () => {
      return request(app).get('/api/blog/id/2').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.findById).toHaveBeenCalledWith('2')
      })
    })

    test('Handle failure in blog/id/:id',  () => {
      mockPromiseOk = false
      return request(app).get('/api/blog/id/2').then(res => {
        expect(res.status).toBe(400)
        expect(res.text).toBe('{\"err\":\"name\",\"message\":\"message\"}')
        expect(mockBlog.findById).toHaveBeenCalledWith('2')
      })
    })

  })

})