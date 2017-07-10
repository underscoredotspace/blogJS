describe('API Setup Routes', () => {
  global.console.log = jest.fn()
  global.console.error = jest.fn()

  const mockDb = {
    data: null,
    oid: '595f70031e019e7f2a7aa121',
    collection: jest.fn().mockImplementation(() => mockDb),
    find: jest.fn().mockImplementation(() => mockDb),
    insert: jest.fn(),
    insertOne: jest.fn().mockImplementation((newPost, cb) => cb(null, [])),
    updateOne: jest.fn().mockImplementation((id, newPost, cb) => cb(null, [])),
    update: jest.fn(),
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
    err: null,
    code: null,
    qr: 'QR_CODE',
    qrErr: null,
    validateCode: jest.fn().mockImplementation((req, res, next) => next()),
    checkCode: jest.fn().mockImplementation((code, cb) => cb(mockAuth.err, mockAuth.pass, mockAuth.verified)),
    checkCookie: jest.fn().mockImplementation((req, res, next) => next()),
    getCode: jest.fn().mockImplementation(cb => cb(mockAuth.err, mockAuth.code, mockAuth.verified)),
    qrCode: jest.fn().mockImplementation(cb => cb(mockAuth.qrErr, mockAuth.qr))
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

  const setup = require('../../server/setup')

  app.use('/api/setup', setup)

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.pass = null
    mockAuth.verified = null
    mockAuth.err = null
    mockAuth.code = null
    mockAuth.qrErr = null
  })

  describe('Get Admin Code', () => {
    it('should output admin code', () => {
      mockAuth.code = '123456'
      mockAuth.verified = false
      
      return request(app).get('/api/setup/adminCode').then(res => {
        expect(console.log).toHaveBeenCalledWith('Your admin code is: 123456')
        expect(res.status).toBe(200)
      })
    })

    it('should return error cos admin code already verified', () => {
      mockAuth.code = '123456'
      mockAuth.verified = true
      
      return request(app).get('/api/setup/adminCode').then(res => {
        expect(console.log).not.toHaveBeenCalled()
        expect(res.status).toBe(403)
        expect(res.text).toBe('{\"err\":\"Already verifed. Code no longer available.\"}')
        expect(console.error).toHaveBeenCalledWith('Already verifed. Code no longer available.')
      })
    })

    it('should return error from getCode failure', () => {
      mockAuth.code = '123456'
      mockAuth.verified = false
      mockAuth.err = 'some error'
      
      return request(app).get('/api/setup/adminCode').then(res => {
        expect(console.log).not.toHaveBeenCalled()
        expect(res.status).toBe(500)
        expect(res.text).toBe('{\"err\":\"some error\"}')
        expect(console.error).toHaveBeenCalledWith('Error getting admin code: some error')
      })
    })
  })

  describe('Get QR code', () => {
    it('Should return QR code', () => {
      const postData = {code:'123456'}
      mockAuth.pass = true
      return request(app).post('/api/setup/qr').send(postData).then(res => {
        expect(mockAuth.validateCode).toHaveBeenCalled()
        expect(mockAuth.qrCode).toHaveBeenCalled()
        expect(res.text).toBe('{\"qr\":\"QR_CODE\"}')
      })
    })

    it('Should request QR code, but fail cos code is invalid', () => {
      const postData = {code:'123456'}
      mockAuth.pass = false
      return request(app).post('/api/setup/qr').send(postData).then(res => {
        expect(mockAuth.validateCode).toHaveBeenCalled()
        expect(mockAuth.qrCode).not.toHaveBeenCalled()
        expect(res.status).toBe(401)
        expect(res.text).toBe('{\"err\":null,\"valid\":false,\"verified\":null}')
      })
    })

    it('Should request QR code, but fail cos code is already verified', () => {
      const postData = {code:'123456'}
      mockAuth.verified = true
      return request(app).post('/api/setup/qr').send(postData).then(res => {
        expect(mockAuth.validateCode).toHaveBeenCalled()
        expect(mockAuth.qrCode).not.toHaveBeenCalled()
        expect(res.status).toBe(401)
        expect(res.text).toBe('{\"err\":null,\"valid\":null,\"verified\":true}')
      })
    })

    it('Should request QR code, but fail cos code getCode returned error', () => {
      const postData = {code:'123456'}
      mockAuth.err = 'some error'
      return request(app).post('/api/setup/qr').send(postData).then(res => {
        expect(mockAuth.validateCode).toHaveBeenCalled()
        expect(mockAuth.qrCode).not.toHaveBeenCalled()
        expect(res.status).toBe(401)
        expect(res.text).toBe('{\"err\":\"some error\",\"valid\":null,\"verified\":null}')
      })
    })

    it('Should request QR code, but fail cos code qrCode returned error', () => {
      const postData = {code:'123456'}
      mockAuth.qrErr = 'some error'
      mockAuth.pass = true
      return request(app).post('/api/setup/qr').send(postData).then(res => {
        expect(mockAuth.validateCode).toHaveBeenCalled()
        expect(mockAuth.qrCode).toHaveBeenCalled()
        expect(res.status).toBe(500)
        expect(res.text).toBe('{\"err\":\"some error\"}')
      })
    })
  })

  describe('Verify QR code', () => {
    it('Should pass', () => {
      const postData = {code:'123456'}
      mockAuth.pass = true
      return request(app).post('/api/setup/verify').send(postData).then(res => {
        expect(mockAuth.validateCode).toHaveBeenCalled()
        expect(mockAuth.checkCode).toHaveBeenCalled()
        expect(mockDb.collection).toHaveBeenCalledWith('admin')
        expect(mockDb.update).toHaveBeenCalledWith({}, {$set: {verified: true}})
        expect(res.text).toBe('{\"err\":null,\"valid\":true}')
        expect(res.headers.hasOwnProperty('set-cookie')).toBe(true)
        const cookieRegEx = /^qqBlog=s%3Atrue/
        expect(cookieRegEx.test(res.headers['set-cookie'][0])).toBe(true)
      })
    })

    it('Should fail', () => {
      const postData = {code:'123456'}
      mockAuth.pass = false
      return request(app).post('/api/setup/verify').send(postData).then(res => {
        expect(mockAuth.validateCode).toHaveBeenCalled()
        expect(mockAuth.checkCode).toHaveBeenCalled()
        expect(res.text).toBe('{\"err\":null,\"valid\":false}')
        expect(res.headers.hasOwnProperty('set-cookie')).toBe(false)
      })
    })

    it('Should fail cos checkCode returned error', () => {
      const postData = {code:'123456'}
      mockAuth.pass = true
      mockAuth.err = 'some error'
      return request(app).post('/api/setup/verify').send(postData).then(res => {
        expect(mockAuth.validateCode).toHaveBeenCalled()
        expect(mockAuth.checkCode).toHaveBeenCalled()
        expect(res.text).toBe('{\"err\":\"some error\",\"valid\":true}')
        expect(res.headers.hasOwnProperty('set-cookie')).toBe(false)
      })
    })
  })
})