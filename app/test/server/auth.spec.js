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
      })
    }
  }

  jest.mock('otp.js', () => mockOtp)

  const mockUserModel = {
    ok: null,
    resolveVal: 1,
    user: jest.fn(() => mockUserModel),
    findOne: jest.fn(() => new Promise((resolve, reject)=> {
      if (mockUserModel.ok) {
        return resolve({secret:mockUserModel.resolveVal}) 
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
    mockOtp.delta = 0
  })

  describe('getSecret', () => {
    test('ok', () => {
      expect.assertions(1)
      return auth._getSecret().then(secret => {
        expect(secret).toBe(1)
      })
    })

    test('not ok', () => {
      expect.assertions(1)
      mockUserModel.ok = false
      return auth._getSecret().catch(err => {
        expect(err).toBe('error')
      })
    })
  })

  describe('checkCode', () => {
    test('ok', () => {
      expect.assertions(1)
      return auth.checkCode('123456').then(res => {
        expect(res).toBeTruthy()
      })
    })

    test('code not valid', () => {
      expect.assertions(1)
      return auth.checkCode('>23a5').catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('Missing code', () => {
      expect.assertions(1)
      return auth.checkCode().catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('Invalid code', () => {
      expect.assertions(1)
      return auth.checkCode('>23a5').catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    test('Incorrect code', () => {
      expect.assertions(1)
      mockOtp.ok = false
      return auth.checkCode('123456').catch(err => {
        expect(err).toBe('Incorrect code')
      })
    })

    test('Stale code', () => {
      expect.assertions(1)
      mockOtp.delta = -3
      return auth.checkCode('123456').catch(err => {
        expect(err).toBe('Incorrect code')
      })
    })
  })
})