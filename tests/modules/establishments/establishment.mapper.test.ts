import AccountService from 'src/modules/accounts/account.service'
import AddressService from 'src/modules/establishments/addresses/address.service'
import EstablishmentMapper from 'src/modules/establishments/establishment.mapper'
import { EstablishmentDB } from 'src/types/database.types'
import { EstablishmentDTO } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'

// Stable jest.mock factories (avoid unstable_mockModule and top-level await)
jest.mock('src/modules/accounts/account.service', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getOneAccount: jest.fn()
    }))
  }
})

jest.mock('src/modules/establishments/addresses/address.service', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getOneAddress: jest.fn()
    }))
  }
})

describe('EstablishmentMapper', () => {
  const c = {} as any // minimal Hono Context substitute

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('toDTO - success', async () => {
    const account = { id: 'owner-1', type: 'enterprise', name: 'Owner' }
    const address = { id: 'addr-1', country: 'ES', postalCode: '08001', city: 'Barcelona', street: 'C/ Test', number: '1', coordinates: { latitude: 1, longitude: 2 } }

    // set mock implementations
    ;(AccountService as jest.Mock).mockImplementation(() => ({ getOneAccount: jest.fn().mockResolvedValue(account) }))
    ;(AddressService as jest.Mock).mockImplementation(() => ({ getOneAddress: jest.fn().mockResolvedValue(address) }))

    const mapper = new EstablishmentMapper(c)

    const db: EstablishmentDB = {
      id: 'est-1',
      owner_id: 'owner-1',
      address_id: 'addr-1',
      name: 'Test Establishment',
      created_at: new Date('2020-01-01T00:00:00.000Z'),
      updated_at: new Date('2020-01-02T00:00:00.000Z')
    }

    const dto: EstablishmentDTO = await mapper.toDTO(db)

    expect(dto.id).toBe(db.id)
    expect(dto.owner).toEqual(account)
    expect(dto.address).toEqual(address)
    expect(dto.name).toBe(db.name)
    expect(dto.createdAt).toBe(db.created_at.toISOString())
    expect(dto.updatedAt).toBe(db.updated_at.toISOString())
  })

  test('toDTO - missing owner throws AppError', async () => {
    (AccountService as jest.Mock).mockImplementation(() => ({ getOneAccount: jest.fn().mockResolvedValue(undefined) }))
    const mapper = new EstablishmentMapper(c)
    const db: any = { id: 'est-2', owner_id: 'missing', address_id: 'addr-1', name: 'X', created_at: new Date(), updated_at: new Date() }

    await expect(mapper.toDTO(db)).rejects.toThrow(AppError)
    await expect(mapper.toDTO(db)).rejects.toMatchObject({
      statusCode: 404,
      error: expect.objectContaining({ code: 'ESTABLISHMENT_OWNER_NOT_FOUND' })
    })
  })

  test('toDTO - invalid owner type throws AppError', async () => {
    const account = { id: 'owner-2', type: 'personal' }
    ;(AccountService as jest.Mock).mockImplementation(() => ({ getOneAccount: jest.fn().mockResolvedValue(account) }))
    const mapper = new EstablishmentMapper(c)
    const db: any = { id: 'est-3', owner_id: 'owner-2', address_id: 'addr-1', name: 'X', created_at: new Date(), updated_at: new Date() }

    await expect(mapper.toDTO(db)).rejects.toThrow(AppError)
    await expect(mapper.toDTO(db)).rejects.toMatchObject({
      statusCode: 400,
      error: expect.objectContaining({ code: 'INVALID_ACCOUNT_TYPE' })
    })
  })

  test('toDTO - missing address throws AppError', async () => {
    const account = { id: 'owner-3', type: 'enterprise' }
    ;(AccountService as jest.Mock).mockImplementation(() => ({ getOneAccount: jest.fn().mockResolvedValue(account) }))
    ;(AddressService as jest.Mock).mockImplementation(() => ({ getOneAddress: jest.fn().mockResolvedValue(undefined) }))
    const mapper = new EstablishmentMapper(c)
    const db: any = { id: 'est-4', owner_id: 'owner-3', address_id: 'missing', name: 'X', created_at: new Date(), updated_at: new Date() }

    await expect(mapper.toDTO(db)).rejects.toThrow(AppError)
    await expect(mapper.toDTO(db)).rejects.toMatchObject({
      statusCode: 404,
      error: expect.objectContaining({ code: 'ESTABLISHMENT_ADDRESS_NOT_FOUND' })
    })
  })

  test('toDTOs - success', async () => {
    const accounts = [
      { id: 'owner-1', type: 'enterprise', name: 'Owner' },
      { id: 'owner-2', type: 'personal', name: 'Renwo' }
    ]
    const addresses = [
      { id: 'addr-1', country: 'ES', postalCode: '08001', city: 'Barcelona', street: 'C/ Test', number: '1', coordinates: { latitude: 1, longitude: 2 } },
      { id: 'addr-2', country: 'CA', postalCode: '08002', city: 'Tarragona', street: 'C/ Tset', number: '2', coordinates: { latitude: 3, longitude: 4 } }
    ]

  // Only enterprise accounts should succeed, so mock getOneAccount to return correct account per owner_id
  ;(AccountService as jest.Mock).mockImplementation(() => ({
      getOneAccount: jest.fn(async (_: any, { id }: any) => {
        return await Promise.resolve(accounts.find(acc => acc.id === id))
      })
    }))
    ;(AddressService as jest.Mock).mockImplementation(() => ({
      getOneAddress: jest.fn(async (_: any, { id }: any) => {
        return await Promise.resolve(addresses.find(addr => addr.id === id))
      })
    }))

    const mapper = new EstablishmentMapper(c)

    const dbs: EstablishmentDB[] = [
      {
        id: 'est-1',
        owner_id: 'owner-1',
        address_id: 'addr-1',
        name: 'Test Establishment',
        created_at: new Date('2020-01-01T00:00:00.000Z'),
        updated_at: new Date('2020-01-02T00:00:00.000Z')
      },
      {
        id: 'est-2',
        owner_id: 'owner-1',
        address_id: 'addr-2',
        name: 'Another Establishment',
        created_at: new Date('2020-02-01T00:00:00.000Z'),
        updated_at: new Date('2020-02-02T00:00:00.000Z')
      }
    ]

    const dtos = await mapper.toDTOs(dbs)

    expect(dtos).toHaveLength(2)
    expect(dtos[0].id).toBe(dbs[0].id)
    expect(dtos[0].owner).toEqual(accounts[0])
    expect(dtos[0].address).toEqual(addresses[0])
    expect(dtos[0].name).toBe(dbs[0].name)
    expect(dtos[0].createdAt).toBe(dbs[0].created_at.toISOString())
    expect(dtos[0].updatedAt).toBe(dbs[0].updated_at.toISOString())

    expect(dtos[1].id).toBe(dbs[1].id)
    expect(dtos[1].owner).toEqual(accounts[0])
    expect(dtos[1].address).toEqual(addresses[1])
    expect(dtos[1].name).toBe(dbs[1].name)
    expect(dtos[1].createdAt).toBe(dbs[1].created_at.toISOString())
    expect(dtos[1].updatedAt).toBe(dbs[1].updated_at.toISOString())
  })

  test('toDB - success with ids', () => {
    const mapper = new EstablishmentMapper(c)
    const dto: any = { name: 'Place', owner: 'owner-id', address: 'addr-id' }
    const db = mapper.toDB(dto)

    expect(db.name).toBe(dto.name)
    expect(db.owner_id).toBe('owner-id')
    expect(db.address_id).toBe('addr-id')
    expect(db.updated_at).toBeInstanceOf(Date)
  })

  test('toDB - missing owner id throws AppError', () => {
    const mapper = new EstablishmentMapper(c)
    const dto: any = { name: 'Place', owner: { name: 'no-id' }, address: 'addr-id' }

    try {
      mapper.toDB(dto)
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError)
      expect(err).toMatchObject({
        statusCode: 400,
        error: expect.objectContaining({ code: 'ESTABLISHMENT_OWNER_ID_REQUIRED' })
      })
    }
  })

  test('toDB - missing address id throws AppError', () => {
    const mapper = new EstablishmentMapper(c)
    const dto: any = { name: 'Place', owner: 'owner-id', address: { name: 'no-id' } }

    try {
      mapper.toDB(dto)
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError)
      expect(err).toMatchObject({
        statusCode: 400,
        error: expect.objectContaining({ code: 'ESTABLISHMENT_ADDRESS_ID_REQUIRED' })
      })
    }
  })
})
