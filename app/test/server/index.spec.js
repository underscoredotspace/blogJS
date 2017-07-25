describe('server/index', () => {
  const mockDb = {
    connect: jest.fn()
  }

  const mockDotEnv = {
    config: jest.fn(() => {
      process.env.PORT = 3000
    })
  }

  jest.mock('../../server/db', () => mockDb)
  jest.mock('dotenv', () => mockDotEnv)

  const request = require('supertest')
  const express = require('express')

  const mockAPI = express.Router()
  jest.mock('../../server/api', () => mockAPI)

  const index = require('../../server/index')

  afterAll(() => {
    index._stopExpress(index._listener)
  })

  test('Initialisation', () => {
      expect(mockDb.connect).toHaveBeenCalled()
      expect(mockDotEnv.config).toHaveBeenCalled()
  })

  test('Server running', () => {
    return Promise.all(
    [
      request('http://localhost:3000').get('/').then(res => {
        expect(res.status).toBe(200)
      })
    ],[
      request('http://localhost:3000').get('/lib/angular.js').then(res => {
        expect(res.status).toBe(200)
      })
    ],[
      request('http://localhost:3000').get('/banana').then(res => {
        expect(res.status).toBe(404)
      })
    ]
  )
})

  test('Server handles errors gracefully', (done) => {
    console.log(index._listener)
    index._startExpress().then(console.error).catch(err => {
      expect(err).toBe('Express error')
      done()
    })
  })
})