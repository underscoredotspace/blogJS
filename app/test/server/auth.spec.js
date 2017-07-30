describe('OTP Auth', () => {
  const mockOtp = {
    googleAuthenticator: jest.fn()
  }

  jest.mock('otp.js', () => mockOtp)
  // jest.mock('../../server/models/user-model')

  const auth = require('../../server/auth')

  test('getSecret', (done) => {
    auth._getSecret().then(secret => {
      expect(secret).toBe(1)
      done()
    }).catch(err => {console.error(err)})
  })
})