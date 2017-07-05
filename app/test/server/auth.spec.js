
describe('OTP Auth Service', () => {
  const okSecret = 'EQZGCJBQGUSGEZRWGNGUE2BWPJKGMSSSORSHQWJZJ4XU25LRJNHFIULZNREUO5LSLFCEEZ2HGFZEM3LGNVKFKY2XGZYVC2KX'
  let mockDb, mockGa

  mockDb = {
    data: null,
    collection: jest.fn().mockImplementation(() => mockDb),
    find: jest.fn().mockImplementation(() => mockDb),
    insert: jest.fn(),
    toArray: jest.fn().mockImplementation(cb => cb(null, mockDb.data))
  }

  jest.mock('../../server/mongo', () => mockDb)

  const auth = require('../../server/auth')

  beforeEach(() => {
    mockDb.insert.mockClear()
    mockDb.toArray.mockClear()
    mockDb.find.mockClear()
    mockDb.collection.mockClear()
  })

  describe('Get secret', () => {
    it('should return the secret', () => {
      mockDb.data = [{secret: '123', verified: true}]
      auth._getSecret((err, secret, verified) => {
        expect(err).toBe(null)
        expect(secret).toBe('123')
        expect(verified).toBe(true)
      })
    })

    it('should return the secret, but show that user isn\'t verified yet', () => {
      mockDb.data = [{secret: '123', verified: false}]
      auth._getSecret((err, secret, verified) => {
        expect(err).toBe(null)
        expect(secret).toBe('123')
        expect(verified).toBe(false)
      })
    })

    it('should fail to return the secret cos there\s two records in table', () => {
      mockDb.data = [{one:1}, {two:2}]
      auth._getSecret((err, secret, verified) => {
        expect(err).toBe('too many records in admin collection')
        expect(secret).toBeUndefined()
        expect(verified).toBeUndefined()
      })
    })

    it('should fail to return the secret cos there\s a bad record in table', () => {
      mockDb.data = [{one:1}]
      auth._getSecret((err, secret, verified) => {
        expect(err).toBe('problem with admin record')
        expect(secret).toBeUndefined()
        expect(verified).toBeUndefined()
      })
    })

    it('should return a new unverified secret cos there\'s no records in table', (done) => {
      mockDb.data = []
      auth._getSecret((err, secret, verified) => {
        expect(err).toBe(null)
        const secretRegEx = /[A-Z0-9]{95}/
        expect(secretRegEx.test(secret)).toBe(true)
        expect(verified).toBe(false)
        expect(mockDb.insert).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('Get code', () => {
    it('Should return OTP code and store new secret', (done) => {
      mockDb.data = []
      auth.getCode((err, code, verified) => {
        expect(err).toBe(null)
        expect(verified).toBe(false)
        const codeRegEx = /[0-9]{6}/
        expect(codeRegEx.test(code)).toBe(true)
        expect(mockDb.insert).toHaveBeenCalled()
        done()
      })
    })

    it('Should return OTP code using existing verified secret', (done) => {
      mockDb.data = [{secret: okSecret, verified: true}]
      auth.getCode((err, code, verified) => {
        expect(err).toBe(null)
        expect(verified).toBe(true)
        const codeRegEx = /[0-9]{6}/
        expect(codeRegEx.test(code)).toBe(true)
        expect(mockDb.insert).not.toHaveBeenCalled()
        done()
      })
    })

    it('Should return OTP code using existing unverified secret', (done) => {
      mockDb.data = [{secret: okSecret, verified: false}]
      auth.getCode((err, code, verified) => {
        expect(err).toBe(null)
        expect(verified).toBe(false)
        const codeRegEx = /[0-9]{6}/
        expect(codeRegEx.test(code)).toBe(true)
        expect(mockDb.insert).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('Validate code', () => {
    let req
    
    const res = {
      status: jest.fn().mockImplementation(() => res),
      json: jest.fn().mockImplementation(() => res)
    }, next = jest.fn()

    beforeEach(() => {
      req = {body:{code: null}}
      jest.clearAllMocks()
    })

    it('should validate OTP code is digits and 6 long', () => {
      req.body.code = '123456'  
      auth.validateCode(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalledWith()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should fail to validate a OTP code that is not 6 digits long', () => {
      req.body.code = '12345'  
      auth.validateCode(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({err: 'Invalid code'})
    })

    it('should fail to validate a OTP code that is not digits', () => {
      req.body.code = '$abc'  
      auth.validateCode(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({err: 'Invalid code'})
    })
  })

  describe('Check code', () => {
    mockDb.data = [{secret: okSecret, verified: false}]

    it('should return true when provided valid code', (done) => {
      let myCode

      auth.getCode((err, code, verified) => {
        myCode = code
      })

      auth.checkCode(myCode, (err, pass) => {
        expect(pass).toBe(true)
        done()
      })
    })

    it('should return false when provided invalid code', (done) => {
      let myCode

      auth.getCode((err, code, verified) => {
        myCode = (Number(code) + 1).toString()
        if (myCode.length < 6) {
          const diff = 6 - myCode.length
          for(let i=0; i<diff; i++) {
            myCode = '0' + myCode
          }
        }
      })

      auth.checkCode(myCode, (err, pass) => {
        expect(pass).toBe(false)
        done()
      })
    })

    it('should return error when provided valid code for the second time', (done) => {
      let myCode

      auth.getCode((err, code, verified) => {
        myCode = code
      })

      auth.checkCode(myCode, () => {})
      auth.checkCode(myCode, (err, pass) => {
        expect(err).toBe('Wait for next code')
        expect(pass).toBeUndefined()
        done()
      })

    })

  })

  describe('Get QR', () => {
    it('should give a QR SVG', () => {
      auth.qrCode((err, QR) => {
        const qrRegEx = /<svg.+\/><\/svg>/
        expect(qrRegEx.test(QR)).toBe(true)
      })
    })
  })

})