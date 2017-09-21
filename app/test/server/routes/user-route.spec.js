describe('User API', () => {
  const request = require('supertest')
  const superagent = require('superagent')
  const express = require('express')
  const bodyParser = require('body-parser')
  const cookieParser = require('cookie-parser')
  
  const app = express();
  const agent = superagent.agent(app)

  app.use(cookieParser('jøbb!3'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  

  const mockAuth = {
    err: null,
    checkCode: jest.fn(() => new Promise((resolve, reject) => {
      if (!mockAuth.err) {
        resolve()
      } else {
        reject(mockAuth.err)
      }
    }))
  }

  jest.mock('../../../server/auth', () => mockAuth)
  app.use('/api/user', require('../../../server/routes/user'))
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.err = null
  })

  const cookieMatch = /^qqBlog=.+$/
  
  test('Logs in', () => { 
    const code = '123456'
    return request(app).post('/api/user/login').send({code}).then(res => {
      expect(res.status).toBe(200)
      const [cookie, age, path, expires] = res.headers['set-cookie'].pop().split(';')
      expect(cookieMatch.test(cookie)).toBeTruthy()
      expect(path.trim()).toBe('Path=/')
      expect(expires.trim()).not.toBe('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    })
  })

  test('Fails to log in', () => {
    const code = '123456'
    mockAuth.err = 'Invalid code'
    return request(app).post('/api/user/login').send({code}).then(res => {
      expect(res.status).toBe(403)
      expect(res.headers['set-cookie']).toBeUndefined()
      expect(res.text).toBe('{\"err\":\"Invalid code\"}')
    })
  })
  
  test('Logs out', () => {
    const code = '123456'
    return request(app).post('/api/user/login').send({code}).then(res => {
      const req = request(app).get('/api/user/logout')
      req.set('Cookie', res.headers['set-cookie'])
      
      return req.then(res => {
        expect(res.status).toBe(200)
        const [cookie, path, expires] = res.headers['set-cookie'].pop().split(';')
        expect(cookieMatch.test(cookie)).toBeFalsy()
        expect(path.trim()).toBe('Path=/')
        expect(expires.trim()).toBe('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
      })
    })  
  })
})