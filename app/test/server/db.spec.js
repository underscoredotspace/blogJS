describe('mongoose connection', () => {
  const mockMongoose = {
    connect: jest.fn().mockImplementation(mockPromise)
  }

  let promiseResolve

  function mockPromise() {
    return new Promise((resolve, reject) => {
      if (promiseResolve){
        const mockPromiseReturn = {db: {databaseName: 'dbname'}}
        resolve(mockPromiseReturn)
      } else {
        const mockPromiseReturn = 'error'
        reject(mockPromiseReturn)
      }
    })
  }

  jest.mock('mongoose', () => mockMongoose)

  const db = require('../../server/db')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('connects to mongo', () => {
    promiseResolve = true
    db.connect()
    expect(mockMongoose.connect).toHaveBeenCalled()
  })

  it('connects to mongo', () => {
    promiseResolve = false
    db.connect()
    expect(mockMongoose.connect).toHaveBeenCalled()
  })
})