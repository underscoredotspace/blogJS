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
    user: jest.fn(() => mockUserModel),
    findOne: jest.fn().mockImplementation(() => Promise.resolve({secret:1,verified:false})),
    findOneAndUpdate: jest.fn().mockImplementation(() => Promise.resolve({secret:1,verified:false})),
    create: jest.fn().mockImplementation(() => Promise.resolve({secret:1,verified:false}))
  }

  jest.mock('../../server/models/user-model', () => mockUserModel)

  const auth = require('../../server/auth')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUser', () => {
    test('getUser ok', () => {
      expect.assertions(3)
      return auth._getUser().then(user => {
        expect(mockUserModel.findOne).toHaveBeenCalled()
        expect(user.secret).toBe(1)
        expect(user.verified).toBe(false)
      })
    })

    test('getUser no users found', () => {
      expect.assertions(4)
      mockUserModel.findOne.mockImplementationOnce(() => Promise.resolve(undefined))
      return auth._getUser().then(user => {
        expect(mockUserModel.findOne).toHaveBeenCalled()
        expect(mockUserModel.create).toHaveBeenCalled()
        expect(user.secret).toBe(1)
        expect(user.verified).toBe(false)
      })
    })

    test('getUser error', () => {
      expect.assertions(2)
      mockUserModel.findOne.mockImplementationOnce(() => Promise.reject('error'))
      return auth._getUser().catch(err => {
        expect(mockUserModel.findOne).toHaveBeenCalled()
        expect(err).toBe('error')
      })
    })
  })

  describe('checkCode', () => {
    test('checkCode ok', () => {
      expect.assertions(2)
      mockUserModel.findOne.mockImplementationOnce(() => Promise.resolve({secret:1,verified:true}))
      return auth.checkCode('123456').then(user => {
        expect(mockUserModel.findOne).toHaveBeenCalled()
        expect(user.verified).toBeTruthy()
      })
    })

    test('checkCode not valid', () => {
      expect.assertions(2)
      return auth.checkCode('>23a5').catch(err => {
        expect(mockUserModel.findOne).not.toHaveBeenCalled()
        expect(err).toMatchObject({'403':'Invalid code'})
      })
    })

    test('checkCode Missing code', () => {
      expect.assertions(2)
      return auth.checkCode().catch(err => {
        expect(mockUserModel.findOne).not.toHaveBeenCalled()
        expect(err).toMatchObject({'403':'Invalid code'})
      })
    })

    test('checkCode Incorrect code', () => {
      expect.assertions(3)
      mockGA.check.mockReturnValueOnce(false)
      mockUserModel.findOne.mockImplementationOnce(() => Promise.resolve({secret:1,verified:true}))
      return auth.checkCode('123457').catch(err => {
        expect(mockUserModel.findOne).toHaveBeenCalled()
        expect(mockGA.check).toHaveBeenCalled()
        expect(err).toMatchObject({'403':'Incorrect code'})
      })
    })

    test('checkCode Reused code', () => {
      expect.assertions(2)
      mockUserModel.findOne.mockImplementationOnce(() => Promise.resolve({secret:1,verified:true}))
      return auth.checkCode('123459').then(() => {
        return auth.checkCode('123459').catch(err => {
          expect(mockUserModel.findOne).toHaveBeenCalledTimes(1)
          expect(err).toMatchObject({'403':'Invalid code'})
        })
      })
    })
  })

  describe('genQR', () => {
    test('genQR ok', () => {
      expect.assertions(1)

      return auth.genQR()
        .then(qr => {
          expect(qr).toBe('qr')
        })
    })

    test('genQR not ok', () => {
      expect.assertions(1)
      mockUserModel.findOne.mockImplementationOnce(() => Promise.reject('error'))
      return auth.genQR()
        .catch(err => {
          expect(err).toBe('error')
        })
    })

    test('genQR not ok cos user already verified', () => {
      expect.assertions(1)

      mockUserModel.findOne.mockImplementationOnce(() => Promise.resolve({secret:1,verified:true}))
      return auth.genQR()
        .catch(err => {
          expect(err).toMatchObject({'403':'User verified'})
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
    test('Print setup code Ok', () => {
      expect.assertions(1)
      return auth.printSetupCode().then(() => {
        expect(mockUserModel.findOne).toHaveBeenCalled()
      })
    })

    test('Print setup code not ok as already verified', () => {
      expect.assertions(2)
      mockUserModel.findOne.mockImplementationOnce(() => Promise.resolve({secret:1,verified:true}))
      return auth.printSetupCode()
        .catch(err => {
          expect(mockUserModel.findOne).toHaveBeenCalled()
          expect(err).toMatchObject({'403':'User verified'})
        })
    })
  })

  describe('Verify user', () => {
    test('Verify user ok', () => {
      expect.assertions(2)
      mockUserModel.findOneAndUpdate.mockImplementationOnce(() => Promise.resolve({secret:1,verified:true}))
      return auth.verifyUser().then(verifed => {
        expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith({}, {verified:true})
        expect(verifed).toBeTruthy()
      })
    })
  })
  
})