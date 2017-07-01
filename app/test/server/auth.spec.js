const auth = require('../../server/auth.js')

describe('OTP Auth Service > Validate code', () => {
  let req
  
  const res = {
    status: jest.fn().mockImplementation(() => res),
    json: jest.fn().mockImplementation(() => res)
  }, next = jest.fn()

  beforeEach(() => {
    req = {body:{code: null}}
    next.mockClear()
    res.status.mockClear()
    res.json.mockClear()
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