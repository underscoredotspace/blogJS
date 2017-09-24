describe('OTP Auth', () => {
  const mockOtp = {
    ok: true,
    delta: 0,
    googleAuthenticator: {
      verify: jest.fn((code, secret) => {
        if (mockOtp.ok) {
          return {delta: mockOtp.delta}
        } else {
          return null
        }
      }),
      gen: jest.fn(() => '123456'),
      qrCode: jest.fn(() => 'qr')
    }
  }

  jest.mock('otp.js', () => mockOtp)

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
    }))
  }
  jest.mock('../../server/models/user-model', () => mockUserModel)

  const auth = require('../../server/auth')

  beforeEach(() => {
    mockOtp.ok = true
    mockUserModel.ok = true
    mockUserModel.resolveVal = {secret:1,verified:true}
    mockOtp.delta = 0
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
    test('ok', () => {
      expect.assertions(2)
      auth.checkCode('123456').then(res => {
        expect(res.verified).toBeTruthy()
      })
      mockOtp.delta = -1
      auth.checkCode('123450').then(res => {
        expect(res.verified).toBeTruthy()
      })
    })

    test('code not valid', () => {
      expect.assertions(1)
      auth.checkCode('>23a5').catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('Missing code', () => {
      expect.assertions(1)
      auth.checkCode().catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('Invalid code', () => {
      expect.assertions(1)
      auth.checkCode('>23a5').catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('Incorrect code', () => {
      expect.assertions(1)
      mockOtp.ok = false
      auth.checkCode('123457').catch(err => {
        expect(err).toBe('Incorrect code')
      })
    })

    test('Stale code', () => {
      expect.assertions(1)
      mockOtp.delta = -2
      auth.checkCode('123458').catch(err => {
        expect(err).toBe('Incorrect code')
      })
    })

    test('Reused code', () => {
      expect.assertions(1)

      auth.checkCode('123459')
      auth.checkCode('123459').catch(err => {
        expect(err).toBe('Invalid code')
      })
    })
  })

  describe('genQR', () => {
    test('genQR ok', () => {
      expect.assertions(1)
      mockUserModel.resolveVal = {secret:1,verified:false}
      auth.genQR()
        .then(qr => {
          expect(qr).toBe('qr')
        })
    })

    test('genQR not ok', () => {
      expect.assertions(1)
      mockUserModel.ok = false
      return auth.genQR()
        .catch(err => {
          expect(err).toBe('error')
        })
    })

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
  
})