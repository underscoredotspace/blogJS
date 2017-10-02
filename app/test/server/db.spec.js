describe('mongoose connection', () => {
  const mockMongoose = {
    connect: jest.fn()
  }

  jest.mock('mongoose', () => mockMongoose)

  const db = require('../../server/db')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('connects to mongo', () => {
    mockMongoose.connect.mockImplementationOnce(() => Promise.resolve({db: {databaseName: 'dbname'}}))
    db.connect()
    expect(mockMongoose.connect).toHaveBeenCalled()
  })

  it('connects to mongo', () => {
    mockMongoose.connect.mockImplementationOnce(() => Promise.reject('error'))
    db.connect()
    expect(mockMongoose.connect).toHaveBeenCalled()
  })
})