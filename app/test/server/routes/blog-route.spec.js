describe('Blog API', () => {
  const request = require('supertest')
  const express = require('express')
  const bodyParser = require('body-parser')

  const app = express();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  
  const mockBlog = {
    find: jest.fn().mockImplementation(() => mockBlog),
    sort: jest.fn().mockImplementation(() => mockBlog),
    skip: jest.fn().mockImplementation(() => mockBlog),
    limit: jest.fn().mockImplementation(() => mockBlog),
    findById: jest.fn().mockImplementation(() => Promise.resolve([])),
    create: jest.fn().mockImplementation(() => Promise.resolve([])),
    findByIdAndRemove: jest.fn().mockImplementation(() => Promise.resolve([])),
    findByIdAndUpdate: jest.fn().mockImplementation(() => Promise.resolve([]))
  }
  
  jest.mock('../../../server/models/blog-model', () => mockBlog)

  const mockAuth = {
    checkCookie: jest.fn(((req, res, next) => next()))
  }

  jest.mock('../../../server/auth', () => mockAuth)
  
  app.use('/api/blog', require('../../../server/routes/blog'))
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    test('Latest posts',  () => {
      expect.assertions(5)
      mockBlog.limit.mockImplementationOnce(() => Promise.resolve([]))

      return request(app).get('/api/blog').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.find).toHaveBeenCalled()
        expect(mockBlog.sort).toHaveBeenCalledWith({date:-1})
        expect(mockBlog.skip).toHaveBeenCalledWith(0)
        expect(mockBlog.limit).toHaveBeenCalledWith(4)
      })
    })

    test('Latest posts with page number 1',  () => {
      expect.assertions(5)
      mockBlog.limit.mockImplementationOnce(() => Promise.resolve([]))

      return request(app).get('/api/blog/1').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.find).toHaveBeenCalled()
        expect(mockBlog.sort).toHaveBeenCalledWith({date:-1})
        expect(mockBlog.skip).toHaveBeenCalledWith(0)
        expect(mockBlog.limit).toHaveBeenCalledWith(4)
      })
    })

    test('Latest posts with page number 2',  () => {
      expect.assertions(5)
      mockBlog.limit.mockImplementationOnce(() => Promise.resolve([]))

      return request(app).get('/api/blog/2').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.find).toHaveBeenCalled()
        expect(mockBlog.sort).toHaveBeenCalledWith({date:-1})
        expect(mockBlog.skip).toHaveBeenCalledWith(3)
        expect(mockBlog.limit).toHaveBeenCalledWith(4)
      })
    })

    test('Latest posts with next page', () => {
      expect.assertions(1)
      mockBlog.limit.mockImplementationOnce(() => Promise.resolve(['1','2','3','4']))
      return request(app).get('/api/blog').then(res => {
        expect(res.text).toBe('{\"posts\":[\"1\",\"2\",\"3\"],\"more\":true}')
      })
    })

    test('Handle failure in blog/ & blog/:page',  () => {
      expect.assertions(6)
      mockBlog.limit.mockImplementationOnce(() => Promise.reject({name:'name',message:'message'}))

      return request(app).get('/api/blog').then(res => {
        expect(res.status).toBe(500)
        expect(res.text).toBe('{\"err\":\"name\",\"message\":\"message\"}')
        expect(mockBlog.find).toHaveBeenCalled()
        expect(mockBlog.sort).toHaveBeenCalledWith({date:-1})
        expect(mockBlog.skip).toHaveBeenCalledWith(0)
        expect(mockBlog.limit).toHaveBeenCalledWith(4)
      })
    })

    test('Specific post',  () => {
      expect.assertions(2)
      return request(app).get('/api/blog/id/2').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.findById).toHaveBeenCalledWith('2')
      })
    })

    test('Handle failure in blog/id/:id',  () => {
      expect.assertions(3)
      mockBlog.findById.mockImplementationOnce(() => Promise.reject({name:'name',message:'message'}))
      return request(app).get('/api/blog/id/2').then(res => {
        expect(res.status).toBe(500)
        expect(res.text).toBe('{\"err\":\"name\",\"message\":\"message\"}')
        expect(mockBlog.findById).toHaveBeenCalledWith('2')
      })
    })
  })

  describe('POST', () => {
    test('make a new post', () => {
      expect.assertions(1)
      const blogpost = {
        title: 'A title that is long enought to post',
        content: 'Content. You know, the nonsense you expect people to read. '
      }

      mockResolve = {
        id: '592c78780e0322032c845430',
        title: blogpost.title,
        content: blogpost.content
      }

      mockBlog.create.mockImplementationOnce(() => Promise.resolve(mockResolve))

      return request(app).post('/api/blog').send({blogpost}).then(res => {
        expect(res.text).toBe('{\"id\":\"592c78780e0322032c845430\"}')
      })
    })

    test('fail to make a new post as title is too short', () => {
      expect.assertions(1)
      const blogpost = {
        title: 'No',
        content: 'Content. You know, the nonsense you expect people to read. '
      }

      return request(app).post('/api/blog').send({blogpost}).then(res => {
        expect(res.status).toBe(400)
      })
    })

    test('fail to make a new post as content is too short', () => {
      expect.assertions(1)
      const blogpost = {
        title: 'A title that is long enought to post',
        content: 'No'
      }

      return request(app).post('/api/blog').send({blogpost}).then(res => {
        expect(res.status).toBe(400)
      })
    })

    test('fail to make a new post as title and content are too short', () => {
      expect.assertions(1)
      const blogpost = {
        title: 'No',
        content: 'No'
      }

      return request(app).post('/api/blog').send({blogpost}).then(res => {
        expect(res.status).toBe(400)
      })
    })

    test('Handle db error in POST /api/blog ',  () => {
      expect.assertions(3)
      
      const blogpost = {
        title: 'A title that is long enought to post',
        content: 'Content. You know, the nonsense you expect people to read. '
      }

      mockBlog.create.mockImplementationOnce(() => Promise.reject({name:'name',message:'message'}))

      return request(app).post('/api/blog').send({blogpost}).then(res => {
        expect(res.status).toBe(500)
        expect(res.text).toBe('{\"err\":\"name\",\"message\":\"message\"}')
        expect(mockBlog.create).toHaveBeenCalled()
      })
    })
  })

  describe('DELETE', () => {
    test('Delete a post', () => {
      expect.assertions(2)
      
      return request(app).delete('/api/blog/123').then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.findByIdAndRemove).toHaveBeenLastCalledWith('123')
      })
    })

    test('Fail to delete a post', () => {
      expect.assertions(2)
      mockBlog.findByIdAndRemove.mockImplementationOnce(() => Promise.reject({name:'name',message:'message'}))

      return request(app).delete('/api/blog/123').then(res => {
        expect(res.status).toBe(500)
        expect(mockBlog.findByIdAndRemove).toHaveBeenLastCalledWith('123')
      })
    })
  })

  describe('EDIT', () => {
    test('Edit a post', () => {
      expect.assertions(2)
      const blogpost = {
        title: 'A title that is long enought to post',
        content: 'Content. You know, the nonsense you expect people to read. '
      }

      return request(app).patch('/api/blog/592c78780e0322032c845430').send({blogpost}).then(res => {
        expect(res.status).toBe(200)
        expect(mockBlog.findByIdAndUpdate).toHaveBeenCalledWith('592c78780e0322032c845430', blogpost)
      })
    })

    test('fail to edit a post as title is too short', () => {
      expect.assertions(2)
      const blogpost = {
        title: 'No',
        content: 'Content. You know, the nonsense you expect people to read. '
      }

      return request(app).patch('/api/blog/592c78780e0322032c845430').send({blogpost}).then(res => {
        expect(res.status).toBe(400)
        expect(mockBlog.findByIdAndUpdate).not.toHaveBeenCalled()
      })
    })

    test('fail to edit a post as content is too short', () => {
      expect.assertions(2)
      const blogpost = {
        title: 'A title that is long enought to post',
        content: 'No'
      }

      return request(app).patch('/api/blog/592c78780e0322032c845430').send({blogpost}).then(res => {
        expect(res.status).toBe(400)
        expect(mockBlog.findByIdAndUpdate).not.toHaveBeenCalled()
      })
    })

    test('fail to edit a post as title and content are too short', () => {
      expect.assertions(2)
      const blogpost = {
        title: 'No',
        content: 'No'
      }

      return request(app).patch('/api/blog/592c78780e0322032c845430').send({blogpost}).then(res => {
        expect(res.status).toBe(400)
        expect(mockBlog.findByIdAndUpdate).not.toHaveBeenCalled()
      })
    })

    test('Handle db error in PATCH /api/blog ',  () => {
      expect.assertions(3)
      mockBlog.findByIdAndUpdate.mockImplementationOnce(() => Promise.reject({name:'name',message:'message'}))
      
      const blogpost = {
        title: 'A title that is long enought to post',
        content: 'Content. You know, the nonsense you expect people to read. '
      }

      return request(app).patch('/api/blog/592c78780e0322032c845430').send({blogpost}).then(res => {
        expect(res.status).toBe(500)
        expect(res.text).toBe('{\"err\":\"name\",\"message\":\"message\"}')
        expect(mockBlog.findByIdAndUpdate).toHaveBeenCalledWith('592c78780e0322032c845430', blogpost)
      })
    })
  })
})