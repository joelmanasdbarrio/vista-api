import getDatabase from 'src/db/client'

describe('database client', () => {
  test('reuses the client for the same database URL', () => {
    const firstClient = getDatabase('postgres://localhost/vista')
    const secondClient = getDatabase('postgres://localhost/vista')

    expect(secondClient).toBe(firstClient)
  })

  test('keeps clients isolated for different database URLs', () => {
    const firstClient = getDatabase('postgres://localhost/vista-one')
    const secondClient = getDatabase('postgres://localhost/vista-two')

    expect(secondClient).not.toBe(firstClient)
  })
})
