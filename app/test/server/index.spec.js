describe('server/index', () => {
  const mockDb = {
    connect: jest.fn()
  }

  const mockDotEnv = {
    config: jest.fn(() => {
      process.env.PORT = 3000
      process.env.COOKIE_SECRET = '_p00π🙃ßüttHol£'
    })
  }

  jest.mock('../../server/db', () => mockDb)
  jest.mock('dotenv', () => mockDotEnv)

  const request = require('supertest')
  const express = require('express')

  const mockAPI = express.Router()
  jest.mock('../../server/routes/api', () => mockAPI)

  const index = require('../../server/index')

  afterAll(() => {
    index._stopExpress(index._listener)
  })

  test('Initialisation', () => {
    expect.assertions(2)
    expect(mockDb.connect).toHaveBeenCalled()
    expect(mockDotEnv.config).toHaveBeenCalled()
  })

  test('Server running', () => {
    expect.assertions(1)
    return request('http://localhost:3000').get('/banana').then(res => {
      expect(res.status).toBe(404)
    })
  })

  test('Server handles errors gracefully', () => {
    expect.assertions(2)
    return index._startExpress(express()).catch(err => {
      expect(err.hasOwnProperty('code')).toBeTruthy()
      expect(err.code).toBe('EADDRINUSE')
    })
  })

  test('Server can\'t open, but didn\'t fire error event', () => {
    expect.assertions(1)
    const fakeExpress = {
      listening: false,
      listen: port => fakeExpress,
      on: () => null
    }
    return index._startExpress(fakeExpress).catch(err => {
      expect(err).toMatchObject({err:'timeout'})
    })
  })

  test('Server listen request didn\'t include required Express App', () => {
    expect.assertions(1)
    return index._startExpress().catch(err => {
      expect(err).toMatchObject({err:'Express app required'})
    })
  })
})