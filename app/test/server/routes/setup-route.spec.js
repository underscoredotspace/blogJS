describe('Setup API', () => {
  const request = require('supertest')
  const express = require('express')
  const bodyParser = require('body-parser')

  const app = express();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  const mockAuth = {
    checkCode: jest.fn().mockImplementation(() => Promise.resolve('ok')),
    printSetupCode: jest.fn().mockImplementation(() => Promise.resolve('ok')),
    genQR: jest.fn().mockImplementation(() => Promise.resolve('ok')),
    verifyUser: jest.fn().mockImplementation(() => Promise.resolve('ok'))
  }

  jest.mock('../../../server/auth', () => mockAuth)
  
  app.use('/api/setup', require('../../../server/routes/setup'))
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/code', () => {
    test('Request to print setup code ok', () => {
      expect.assertions(1)
      return request(app).get('/api/setup/code')
      .then(res => {
        expect(res.status).toBe(200)
      })
    })
    
    test('Request to print setup code fail because already verified', () => {
      expect.assertions(2)
      mockAuth.printSetupCode.mockImplementationOnce(() => Promise.reject({'403':'User verified'}))
      return request(app).get('/api/setup/code')
      .then(res => {
        expect(mockAuth.printSetupCode).toHaveBeenCalled()
        expect(res.status).toBe(403)
      })
    })
    
    test('Request to print setup code error', () => {
      expect.assertions(2)
      mockAuth.printSetupCode.mockImplementationOnce(() => Promise.reject('error'))
      return request(app).get('/api/setup/code')
      .then(res => {
        expect(mockAuth.printSetupCode).toHaveBeenCalled()
        expect(res.status).toBe(500)
      })
    })
  })

  describe('/qr', () => {
    test('Request QR code ok', () => {
      expect.assertions(2)
      return request(app).post('/api/setup/qr').send({code:'123456'})
      .then(res => {
        expect(res.text).toBe('{\"qr\":\"ok\"}')
        expect(res.status).toBe(200)
      })
    })
  
    test('Request QR code fail because already verified', () => {
      expect.assertions(2)
      mockAuth.genQR.mockImplementationOnce(() => Promise.reject({'403':'User verified'}))
      return request(app).post('/api/setup/qr').send({code:'123456'})
      .then(res => {
        expect(mockAuth.genQR).toHaveBeenCalled()
        expect(res.status).toBe(403)
      })
    })
    
    test('Request QR code error', () => {
      expect.assertions(2)
      mockAuth.genQR.mockImplementationOnce(() => Promise.reject('error'))
      return request(app).post('/api/setup/qr').send({code:'123456'})
      .then(res => {
        expect(mockAuth.genQR).toHaveBeenCalled()
        expect(res.status).toBe(500)
      })
    })
  })
  
  describe('/verify', () => {
    test('Request verify code ok', () => {
      expect.assertions(2)
      return request(app).post('/api/setup/verify').send({code:'123456'})
      .then(res => {
        expect(mockAuth.verifyUser).toHaveBeenCalled()
        expect(res.status).toBe(200)
      })
    })
    
    test('Request verify code error', () => {
      expect.assertions(2)
      mockAuth.verifyUser.mockImplementationOnce(() => Promise.reject('error'))
      return request(app).post('/api/setup/verify').send({code:'123456'})
      .then(res => {
        expect(mockAuth.verifyUser).toHaveBeenCalled()
        expect(res.status).toBe(500)
      })
    })
  })
})