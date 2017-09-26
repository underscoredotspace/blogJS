describe('OTP Auth', () => {
  const mockGA = {
    generateSecret: jest.fn().mockReturnValue('1'),
    generate: jest.fn().mockReturnValue('002800'),
    check: jest.fn().mockReturnValue(true),
    keyuri: jest.fn().mockReturnValue('anImage')
  }

  jest.mock('otplib/authenticator', () => mockGA)

  const mockQR = {
    err: null,
    toString: jest.fn().mockImplementation((code, options, cb) => cb(mockQR.err, 'qr'))
  }

  jest.mock('qrcode', () => mockQR)

  const mockUserModel = {
    ok: null,
    resolveVal: null,
    user: jest.fn(() => mockUserModel),
    findOne: jest.fn(() => new Promise((resolve, reject)=> {
      if (mockUserModel.ok) {
        return resolve(mockUserModel.resolveVal) 
      } else {
        return reject('error')
      }
    })),
    findOneAndUpdate: jest.fn(() => new Promise((resolve, reject)=> {
      if (mockUserModel.ok) {
        return resolve(mockUserModel.resolveVal) 
      } else {
        return reject('error')
      }
    }))
  }
  jest.mock('../../server/models/user-model', () => mockUserModel)

  const auth = require('../../server/auth')

  beforeEach(() => {
    mockUserModel.ok = true
    mockUserModel.resolveVal = {secret:1,verified:true}
    mockGA.check.mockReturnValue(true)
  })

  describe('getUser', () => {
    test('ok', () => {
      expect.assertions(2)
      auth._getUser().then(user => {
        expect(user.secret).toBe(1)
        expect(user.verified).toBe(true)
      })
    })

    test('not ok', () => {
      expect.assertions(1)
      mockUserModel.ok = false
      auth._getUser().catch(err => {
        expect(err).toBe('error')
      })
    })
  })

  describe('checkCode', () => {
    test('checkCode ok', () => {
      expect.assertions(1)
      return auth.checkCode('123456').then(user => {
        expect(user.verified).toBeTruthy()
      })
    })

    test('checkCode not valid', () => {
      expect.assertions(1)
      return auth.checkCode('>23a5').catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('checkCode Missing code', () => {
      expect.assertions(1)
      return auth.checkCode().catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('checkCode Invalid code', () => {
      expect.assertions(1)
      return auth.checkCode('>23a5').catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('checkCode Incorrect code', () => {
      expect.assertions(1)
      mockGA.check.mockReturnValueOnce(false)
      return auth.checkCode('123457').catch(err => {
        expect(err).toBe('Incorrect code')
      })
    })

    test('checkCode Reused code', () => {
      expect.assertions(1)

      return auth.checkCode('123459').then(() => {
        return auth.checkCode('123459').catch(err => {
          expect(err).toBe('Invalid code')
        })
      })
    })
  })

  describe('genQR', () => {
    test('genQR ok', () => {
      expect.assertions(1)
      mockUserModel.resolveVal = {secret:1,verified:false}
      return auth.genQR()
        .then(qr => {
          expect(qr).toBe('qr')
        })
    })

    // test('genQR not ok', () => {
    //   expect.assertions(1)
    //   mockUserModel.ok = false
    //   return auth.genQR()
    //     .catch(err => {
    //       expect(err).toBe('error')
    //     })
    // })

    test('genQR not ok cos user already verified', () => {
      expect.assertions(1)
      mockUserModel.resolveVal = {secret:1,verified:true}
      return auth.genQR()
        .catch(err => {
          expect(err).toBe('User verified')
        })
    })
  })

  describe('Check cookie', () => {
    let req = {body:{}, signedCookies: {}}
    
    const res = {
      sendStatus: jest.fn().mockImplementation(() => res)
    }, next = jest.fn()

    beforeEach(() => {
      req = req = {body:{}, signedCookies: {}}
      jest.clearAllMocks()
    })

    test('Valid cookie', () => {
      expect.assertions(2)
      req.signedCookies = {'qqBlog':'true'}
      auth.checkCookie(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(res.sendStatus).not.toHaveBeenCalled()
    })

    test('Missing cookie', () => {
      expect.assertions(2)
      req.signedCookies = {}
      auth.checkCookie(req, res, next)
      expect(res.sendStatus).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Print setup code', () => {
    test('Ok', () => {
      mockUserModel.resolveVal = {secret:1,verified:false}
      return auth.printSetupCode()
    })

    test('Already verified', () => {
      mockUserModel.resolveVal = {secret:1,verified:true}
      return auth.printSetupCode()
        .catch(err => {
          expect(err).toBe('User verified')
        })
    })
  })

  describe('Verify user', () => {
    test('Verify user ok', () => {
      expect.assertions(2)
      auth.verifyUser().then(verifed => {
        expect(verifed).toBeTruthy()
        expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith({}, {verified:true})
      })
    })
  })
  
})