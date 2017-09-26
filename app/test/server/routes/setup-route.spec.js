describe('Setup API', () => {
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

  const mockAuth = {
    printSetupCode: mockPromise,
    checkCode: mockPromise,
    genQR: mockPromise,
    verifyUser: mockPromise
  }

  jest.mock('../../../server/auth', () => mockAuth)
  
  app.use('/api/setup', require('../../../server/routes/setup'))
  
  beforeEach(() => {
    jest.clearAllMocks()
  
    mockResolve = []
    mockReject = {name:'name', message: 'message'}
    mockPromiseOk = true
  })

  test('Request to print setup code', () => {
    expect.assertions(1)
    return request(app).get('/api/setup/code')
      .then(res => {
        expect(res.status).toBe(200)
      })
  })

  test('Request to print setup code fail because already verified', () => {
    expect.assertions(1)
    mockPromiseOk = false
    mockReject = 'User verified'
    return request(app).get('/api/setup/code')
      .then(res => {
        expect(res.status).toBe(403)
      })
  })

  test('Request to print setup code fail', () => {
    expect.assertions(1)
    mockPromiseOk = false
    return request(app).get('/api/setup/code')
      .then(res => {
        expect(res.status).toBe(500)
      })
  })

  test('Request QR code', () => {
    expect.assertions(1)
    return request(app).post('/api/setup/qr').send({code:'123456'})
      .then(res => {
        expect(res.status).toBe(200)
      })
  })

  test('Request QR code fail', () => {
    expect.assertions(1)
    mockPromiseOk = false
    return request(app).post('/api/setup/qr').send({code:'123456'})
      .then(res => {
        expect(res.status).toBe(500)
      })
  })

  test('Request QR code fail because already verified', () => {
    expect.assertions(1)
    mockPromiseOk = false
    mockReject = 'User verified'
    return request(app).post('/api/setup/qr').send({code:'123456'})
      .then(res => {
        expect(res.status).toBe(403)
      })
  })

  test('Request verify code', () => {
    expect.assertions(1)
    return request(app).post('/api/setup/verify').send({code:'123456'})
      .then(res => {
        expect(res.status).toBe(200)
      })
  })

  test('Request verify code fail', () => {
    expect.assertions(1)
    mockPromiseOk = false
    return request(app).post('/api/setup/verify').send({code:'123456'})
      .then(res => {
        expect(res.status).toBe(403)
      })
  })
})