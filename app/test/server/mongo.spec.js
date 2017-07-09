describe('Mongo handler module', () => {
  const mockMongo = {
    err: null,
    db: {collection: jest.fn()},
    MongoClient: null
  }

  mockMongo.db.collection.mockImplementation(() => 'collection')

  mockMongo.MongoClient = {
    connect: jest.fn().mockImplementation((url, cb) => {
      cb(mockMongo.err, mockMongo.db)
    }),
    collection: jest.fn()
  }

  jest.mock('mongodb', () => mockMongo)

  const mongo = require('../../server/mongo')

  beforeEach(() => {
    mongo._disconnect()
    mockMongo.err = null
    mockMongo.MongoClient.connect.mockClear()
    mockMongo.MongoClient.collection.mockClear()
    mockMongo.db.collection.mockClear()
  })

  describe('Connecting', () => {
    it('Should connect to mongo', () => {
      mongo.connect('http://localhost', err => {
        expect(mockMongo.MongoClient.connect).toHaveBeenCalledWith('http://localhost', jasmine.any(Function))
        expect(err).toBeUndefined()
        
        mockMongo.MongoClient.connect.mockClear()
      
        mongo.connect('http://localhost', err => {
          expect(err).toBeUndefined()
          expect(mockMongo.MongoClient.connect).not.toHaveBeenCalled()
        })
      })
    })

    it('Should fail to connect to mongo', () => {
      mockMongo.err = 'some error'
      mongo.connect('http://localhost', err => {
        expect(err).toBe('some error')
      })
    })
  })

  describe('Collection functions', () => {
    it('should call collection and return it', () => {
      mongo.connect('http://localhost', err => {
        const collection = mongo.collection('test')
        expect(collection).toBe('collection')
        expect(mockMongo.db.collection).toHaveBeenCalledWith('test')
      })
    })

    it('should return error cos we forgot the collection name', () => {
      mongo.connect('http://localhost', err => {
        const collection = mongo.collection()
        expect(collection).toBe(null)
        expect(mockMongo.db.collection).not.toHaveBeenCalled()
      })
    })
  })
})