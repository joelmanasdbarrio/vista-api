import AddressRepository from 'src/modules/establishments/addresses/address.repository'
import AddressService from 'src/modules/establishments/addresses/address.service'

jest.mock('src/modules/establishments/addresses/address.repository', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getOneById: jest.fn(),
      createOne: jest.fn(),
      updateOneById: jest.fn()
    }))
  }
})

describe('AddressService', () => {
  const c = {} as any // minimal Hono Context substitute

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getOneAddress - success', async () => {
    const address = { id: 'addr-1', country: 'ES', postalCode: '08001', city: 'Barcelona', street: 'C/ Test', number: '1', coordinates: { latitude: 1, longitude: 2 } }

    ;(AddressRepository as jest.Mock).mockImplementation(() => ({ getOneById: jest.fn().mockResolvedValue(address) }))
    const service = new AddressService()

    const result = await service.getOneAddress(c, { id: 'addr-1' })
  })
})
