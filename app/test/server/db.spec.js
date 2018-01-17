describe('mongoose connection', () => {
  process.env.MONGO_ADDR = 'test'
  
  const mockMongoose = {
    connect: jest.fn()
  }

  jest.mock('mongoose', () => mockMongoose)

  const db = require('../../server/db')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('connects to mongo successfully', () => {
    expect.assertions(1)
    mockMongoose.connect.mockImplementationOnce(() => Promise.resolve({db: {databaseName: 'dbname'}}))
    db.connect()
    expect(mockMongoose.connect).toHaveBeenCalled()
  })

  test('fails to connect to mongo', () => {
    expect.assertions(1)
    mockMongoose.connect.mockImplementationOnce(() => Promise.reject('error'))
    db.connect()
    expect(mockMongoose.connect).toHaveBeenCalled()
  })
})