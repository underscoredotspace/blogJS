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
    checkCode: jest.fn().mockImplementation(() => Promise.resolve({verified:true}))
  }

  jest.mock('../../../server/auth', () => mockAuth)
  app.use('/api/user', require('../../../server/routes/user'))
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const cookieMatch = /^qqBlog=.+$/
  
  test('Logs in', () => { 
    expect.assertions(4)
    const code = '123451'
    return request(app).post('/api/user/login').send({code}).then(res => {
      expect(res.status).toBe(200)
      const [cookie, age, path, expires] = res.headers['set-cookie'].pop().split(';')
      expect(cookieMatch.test(cookie)).toBeTruthy()
      expect(path.trim()).toBe('Path=/')
      expect(expires.trim()).not.toBe('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    })
  })

  test('Fails to log in due to bad code', () => {
    expect.assertions(2)
    const code = '123452'
    mockAuth.checkCode.mockImplementationOnce(() => Promise.reject({'403':'Invalid code'}))
    return request(app).post('/api/user/login').send({code}).then(res => {
      expect(res.status).toBe(403)
      expect(res.headers['set-cookie']).toBeUndefined()
    })
  })

  test('Fails to log in due to other error', () => {
    expect.assertions(2)
    const code = '123452'
    mockAuth.checkCode.mockImplementationOnce(() => Promise.reject('error'))
    return request(app).post('/api/user/login').send({code}).then(res => {
      expect(res.status).toBe(500)
      expect(res.headers['set-cookie']).toBeUndefined()
    })
  })

  test('Refuse to log in because user not verified', () => {
    expect.assertions(3)
    const code = '123442'
    mockAuth.checkCode.mockImplementationOnce(() => Promise.resolve({verified:false}))
    return request(app).post('/api/user/login').send({code}).then(res => {
      expect(res.status).toBe(403)
      expect(res.headers['set-cookie']).toBeUndefined()
      expect(res.text).toBe('{\"err\":\"Not verified\"}')
    })
  })
  
  test('Logs out', () => {
    expect.assertions(4)
    const code = '123453'
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