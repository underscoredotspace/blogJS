describe('Blog API', () => {
  const mockDb = {
    data: null,
    collection: jest.fn().mockImplementation(() => mockDb),
    find: jest.fn().mockImplementation(() => mockDb),
    insert: jest.fn(),
    toArray: jest.fn().mockImplementation(cb => cb(null, mockDb.data)),
    sort: jest.fn().mockImplementation(cb => mockDb),
    limit: jest.fn().mockImplementation(cb => mockDb),
    ObjectId: jest.fn().mockImplementation(cb => mockDb)
  }

  jest.mock('../../server/mongo', () => mockDb)

  const mockAuth = {
    pass: null,
    verified: null,
    validateCode: jest.fn().mockImplementation((req, res, next) => next()),
    checkCode: jest.fn().mockImplementation((code, cb) => cb(null, mockAuth.pass, mockAuth.verified))
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

    it('should fail to get bad post zzz', () => {
      return request(app).get('/api/post/zzz').then(res => {
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

    it('should not log in cos not verifed', () => {
      mockAuth.pass = true
      mockAuth.verified = false
      return request(app).post('/api/login').send({code:'282828'}).then(res => {
        expect(res.headers.hasOwnProperty('set-cookie')).toBe(false)
        expect(res.text).toBe('{\"err\":null,\"valid\":true,\"verified\":false}')
      })
    })
  })
})