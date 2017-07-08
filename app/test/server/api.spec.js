describe('Blog API', () => {
  const mockDb = {
    data: null,
    oid: '595f70031e019e7f2a7aa121',
    collection: jest.fn().mockImplementation(() => mockDb),
    find: jest.fn().mockImplementation(() => mockDb),
    insert: jest.fn(),
    insertOne: jest.fn().mockImplementation((newPost, cb) => cb(null, [])),
    updateOne: jest.fn().mockImplementation((id, newPost, cb) => cb(null, [])),
    remove: jest.fn().mockImplementation((id, cb) => cb(null, [])),
    toArray: jest.fn().mockImplementation(cb => cb(null, mockDb.data)),
    sort: jest.fn().mockImplementation(cb => mockDb),
    limit: jest.fn().mockImplementation(cb => mockDb),
    ObjectId: jest.fn().mockImplementation(() => mockDb.oid)
  }

  jest.mock('../../server/mongo', () => mockDb)

  const mockAuth = {
    pass: null,
    verified: null,
    validateCode: jest.fn().mockImplementation((req, res, next) => next()),
    checkCode: jest.fn().mockImplementation((code, cb) => cb(null, mockAuth.pass, mockAuth.verified)),
    checkCookie: jest.fn().mockImplementation((req, res, next) => next())
  }

  jest.mock('../../server/auth', () => mockAuth)

  const request = require('supertest')
  const express = require('express')
  const bodyParser = require('body-parser')
  const cookieParser = require('cookie-parser')

  const app = express();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(cookieParser('7hIseGuy.H3_f$&*5'))

  const api = require('../../server/api')

  app.use('/api', api)

  beforeEach(() => {
    mockDb.insert.mockClear()
    mockDb.toArray.mockClear()
    mockDb.find.mockClear()
    mockDb.collection.mockClear()
    mockDb.sort.mockClear()
    mockDb.limit.mockClear()
    mockDb.insertOne.mockClear()
    mockDb.updateOne.mockClear()
    mockDb.remove.mockClear()

    mockAuth.checkCode.mockClear()
    mockAuth.validateCode.mockClear()
    mockAuth.checkCookie.mockClear()
  })

  it('Should 404 cos bad API path', () => {
    return request(app).get('/api/something').then(res => {
      expect(res.status).toBe(404)
    })
  })

  describe('Get posts', () => {
    it('should get 3 latest posts', () => {
      mockDb.data = [{title: 'the title', content: 'the content'}]
      
      return request(app).get('/api/latest/3').then(res => {
        expect(JSON.parse(res.text)[0].content).toBe(mockDb.data[0].content)
        expect(mockDb.collection).toHaveBeenCalledWith('blog')
        expect(mockDb.limit).toHaveBeenCalledWith(3)
        expect(mockDb.sort).toHaveBeenCalledWith({'_id': -1})
        expect(mockDb.toArray).toHaveBeenCalled()
      })
    })

    it('should request 3 latest posts but return error cos there\'s none', () => {
      mockDb.data = []
      
      return request(app).get('/api/latest/3').then(res => {
        expect(res.status).toBe(204)
        expect(mockDb.collection).toHaveBeenCalledWith('blog')
        expect(mockDb.limit).toHaveBeenCalledWith(3)
        expect(mockDb.sort).toHaveBeenCalledWith({'_id': -1})
        expect(mockDb.toArray).toHaveBeenCalled()
      })
    })

    it('should request 21 latest posts but return error cos that\'s too many', () => {
      mockDb.data = []
      
      return request(app).get('/api/latest/21').then(res => {
        expect(res.status).toBe(400)
        expect(mockDb.collection).not.toHaveBeenCalled()
      })
    })

    it('should redirect to /api/latest/1', () => {
      return request(app).get('/api/latest').then(res => {
        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/api/latest/1')
      })
    })

    it('should get specified post', () => {
      mockDb.data = [{'_id': '592c78780e0322032c845436', title: 'the title', content: 'the content'}]
      return request(app).get('/api/post/592c78780e0322032c845436').then(res => {
        expect(JSON.parse(res.text)[0]._id).toBe(mockDb.data[0]._id)
        expect(mockDb.collection).toHaveBeenCalledWith('blog')
        expect(mockDb.limit).not.toHaveBeenCalled()
        expect(mockDb.sort).not.toHaveBeenCalled()
        expect(mockDb.toArray).toHaveBeenCalled()
      })
    })

    it('should fail to get bad post z{24}', () => {
      return request(app).get('/api/post/zzzzzzzzzzzzzzzzzzzzzzzz').then(res => {
        expect(mockDb.collection).not.toHaveBeenCalled()
        expect(res.status).toBe(400)
      })
    })

    it('should fail to get bad post with too long ObjectID', () => {
      return request(app).get('/api/post/592c78780e0322032c845436a').then(res => {
        expect(mockDb.collection).not.toHaveBeenCalled()
        expect(res.status).toBe(400)
      })
    })

     it('should return error as post doesn\'t exist', () => {
      mockDb.data = []
      return request(app).get('/api/post/592c78780e0322032c845436').then(res => {
        expect(res.status).toBe(204)
        expect(mockDb.collection).toHaveBeenCalledWith('blog')
        expect(mockDb.limit).not.toHaveBeenCalled()
        expect(mockDb.sort).not.toHaveBeenCalled()
        expect(mockDb.toArray).toHaveBeenCalled()
      }).catch(err => expect(err).toBeUndefined())
    })
  })

  describe('Make post', () => {
    it('should make a new post', () => {
      const newPost = {blogpost: {
        title: 'post title',
        content: 'post content',
      }}
      return request(app).post('/api/post').send(newPost).then(res => {
        expect(mockDb.insertOne).toHaveBeenCalled()
        expect(JSON.parse(res.text).id).toBe(mockDb.oid)
      })
    })

    it('should fail to make a new post because content is too short', () => {
      const newPost = {blogpost: {
        title: 'title long enough',
        content: 'not',
      }}
      return request(app).post('/api/post').send(newPost).then(res => {
        expect(mockDb.insertOne).not.toHaveBeenCalled()
        expect(res.status).toBe(400)
        expect(res.text).toBe('{\"err\":\"Post or title not long enough\"}')
      })
    })

    it('should fail to make a new post because title is too short', () => {
      const newPost = {blogpost: {
        title: 'not',
        content: 'content long enough',
      }}
      return request(app).post('/api/post').send(newPost).then(res => {
        expect(mockDb.insertOne).not.toHaveBeenCalled()
        expect(res.status).toBe(400)
        expect(res.text).toBe('{\"err\":\"Post or title not long enough\"}')
      })
    })
  })

  describe('Delete post', () => {
    it('Should delete post', () => {
      return request(app).delete('/api/post/' + mockDb.oid).then(res => {
        expect(mockDb.remove).toHaveBeenCalled()
        expect(res.text).toBe('{\"err\":null,\"res\":[]}')
      })
    })

    it('Should fail to delete invalid post ID', () => {
      return request(app).delete('/api/post/zzzzzzzzzzzzzzzzzzzzzzzz').then(res => {
        expect(mockDb.remove).not.toHaveBeenCalled()
        expect(res.status).toBe(400)
      })
    })
  })

  describe('Amend post', () => {
    it('Should update post', () => {
      const newPost = {blogpost: {
        title: 'post title',
        content: 'post content',
      }}
      return request(app).patch('/api/post/' + mockDb.oid).send(newPost).then(res => {
        expect(mockDb.updateOne).toHaveBeenCalled()
        expect(res.text).toBe('{\"id\":\"595f70031e019e7f2a7aa121\"}')
      })
    })

    it('Should fail to update invalid post ID', () => {
      const newPost = {blogpost: {
        title: 'post title',
        content: 'post content',
      }}
      return request(app).patch('/api/post/zzzzzzzzzzzzzzzzzzzzzzzz').send(newPost).then(res => {
        expect(mockDb.updateOne).not.toHaveBeenCalled()
        expect(res.status).toBe(400)
      })
    })

    it('Should fail to update cos title too short', () => {
      const newPost = {blogpost: {
        title: 'not',
        content: 'good content',
      }}
      return request(app).patch('/api/post/' + mockDb.oid).send(newPost).then(res => {
        expect(mockDb.updateOne).not.toHaveBeenCalled()
        expect(res.status).toBe(400)
      })
    })

    it('Should fail to update cos content too short', () => {
      const newPost = {blogpost: {
        title: 'good title',
        content: 'not',
      }}
      return request(app).patch('/api/post/' + mockDb.oid).send(newPost).then(res => {
        expect(mockDb.updateOne).not.toHaveBeenCalled()
        expect(res.status).toBe(400)
      })
    })
  })

  describe('Authentication', () => {
    it('should log in', () => {
      mockAuth.pass = true
      mockAuth.verified = true
      return request(app).post('/api/login').send({code:'282828'}).then(res => {
        expect(res.headers.hasOwnProperty('set-cookie')).toBe(true)
        const cookieRegEx = /^qqBlog=s%3Atrue/
        expect(cookieRegEx.test(res.headers['set-cookie'][0])).toBe(true)
        expect(res.text).toBe('{\"loggedin\":true}')
      })
    })

    it('should not log in cos code invalid', () => {
      mockAuth.pass = false
      mockAuth.verified = true
      return request(app).post('/api/login').send({code:'282828'}).then(res => {
        expect(res.headers.hasOwnProperty('set-cookie')).toBe(false)
        expect(res.text).toBe('{\"err\":null,\"valid\":false,\"verified\":true}')
      })
    })

    it('should not log in cos not yet verifed', () => {
      mockAuth.pass = true
      mockAuth.verified = false
      return request(app).post('/api/login').send({code:'282828'}).then(res => {
        expect(res.headers.hasOwnProperty('set-cookie')).toBe(false)
        expect(res.text).toBe('{\"err\":null,\"valid\":true,\"verified\":false}')
      })
    })

    it('should log out', () => {
      return request(app).get('/api/logout').then(res => {
        expect(res.text).toBe('{\"loggedin\":false}')
        const cookieRegEx = /^qqBlog=s%3Atrue/
        expect(cookieRegEx.test(res.headers['set-cookie'][0])).toBe(false)
      })
    })
  })
})