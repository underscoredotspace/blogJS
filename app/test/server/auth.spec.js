describe('OTP Auth', () => {
  const mockOtp = {
    delta: 0,
    googleAuthenticator: jest.fn(() => mockOtp),
    verify: jest.fn((code, secret) => {
      return {delta: mockOtp.delta}
    })
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

  describe('getSecret', () => {
    test('ok', () => {
      expect.assertions(1)
      mockUserModel.ok = true
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
    test('code not valid', () => {
      expect.assertions(1)
      return auth.checkCode('>23a5').catch(err => {
        expect(err).toBe('Invalid code')
      })
    })

    // test('ok', () => {
    //   expect.assertions(1)
    //   return auth.checkCode('123456').then(res => {
    //     expect(res).toBeTruthy()
    //   })
    // })
  })
})