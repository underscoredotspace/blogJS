let err = null
const fakePromise = jest.fn(() => new Promise((resolve, reject) => {
  if (!err) {
    resolve()
  } else {
    reject(err)
  }
}))

module.exports = {
  Schema: jest.fn(),
  model: jest.fn(),
  findOne: jest.fn(() => fakePromise)
}