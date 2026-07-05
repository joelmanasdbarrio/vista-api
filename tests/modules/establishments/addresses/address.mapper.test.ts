import AddressMapper from 'src/modules/establishments/addresses/address.mapper'
import { AddressDB } from 'src/types/database.types'

describe('AddressMapper', () => {
  test('toDTO - success', async () => {
    const db: AddressDB = {
      id: 'addr-1',
      street: 'Main St',
      number: '123',
      postal_code: '12345',
      city: 'Metropolis',
      country: 'Countryland',
      block: null,
      floor: null,
      stair: null,
      door: null,
      coordinates: { x: 12.34, y: 56.78 },
      created_at: new Date('2020-01-01T00:00:00.000Z'),
      updated_at: new Date('2020-01-02T00:00:00.000Z')
    }

    const mapper = new AddressMapper()

    const dto = await mapper.toDTO(db)

    expect(dto.id).toBe(db.id)
    expect(dto.street).toBe(db.street)
    expect(dto.number).toBe(db.number)
    expect(dto.postalCode).toBe(db.postal_code)
    expect(dto.city).toBe(db.city)
    expect(dto.country).toBe(db.country)
    expect(dto.coordinates).toEqual({ latitude: db.coordinates.y, longitude: db.coordinates.x })
    expect(dto.createdAt).toBe(db.created_at.toISOString())
    expect(dto.updatedAt).toBe(db.updated_at.toISOString())
  })

  test('toDTOs - success', async () => {
    const dbs: AddressDB[] = [
      {
        id: 'addr-1',
        street: 'Main St',
        number: '123',
        postal_code: '12345',
        city: 'Metropolis',
        country: 'Countryland',
        block: null,
        floor: null,
        stair: null,
        door: null,
        coordinates: { x: 12.34, y: 56.78 },
        created_at: new Date('2020-01-01T00:00:00.000Z'),
        updated_at: new Date('2020-01-02T00:00:00.000Z')
      },
      {
        id: 'addr-2',
        street: 'Second St',
        number: '456',
        postal_code: '67890',
        city: 'Gotham',
        country: 'Countryland',
        block: null,
        floor: null,
        stair: null,
        door: null,
        coordinates: { x: 98.76, y: 54.32 },
        created_at: new Date('2021-01-01T00:00:00.000Z'),
        updated_at: new Date('2021-01-02T00:00:00.000Z')
      }
    ]

    const mapper = new AddressMapper()

    const dtos = await mapper.toDTOs(dbs)

    expect(dtos).toHaveLength(2)
    expect(dtos[0].id).toBe(dbs[0].id)
    expect(dtos[0].street).toBe(dbs[0].street)
    expect(dtos[0].number).toBe(dbs[0].number)
    expect(dtos[0].postalCode).toBe(dbs[0].postal_code)
    expect(dtos[0].city).toBe(dbs[0].city)
    expect(dtos[0].country).toBe(dbs[0].country)
    expect(dtos[0].coordinates).toEqual({ latitude: dbs[0].coordinates.y, longitude: dbs[0].coordinates.x })
    expect(dtos[0].createdAt).toBe(dbs[0].created_at.toISOString())
    expect(dtos[0].updatedAt).toBe(dbs[0].updated_at.toISOString())

    expect(dtos[1].id).toBe(dbs[1].id)
    expect(dtos[1].street).toBe(dbs[1].street)
    expect(dtos[1].number).toBe(dbs[1].number)
    expect(dtos[1].postalCode).toBe(dbs[1].postal_code)
    expect(dtos[1].city).toBe(dbs[1].city)
    expect(dtos[1].country).toBe(dbs[1].country)
    expect(dtos[1].coordinates).toEqual({ latitude: dbs[1].coordinates.y, longitude: dbs[1].coordinates.x })
    expect(dtos[1].createdAt).toBe(dbs[1].created_at.toISOString())
    expect(dtos[1].updatedAt).toBe(dbs[1].updated_at.toISOString())
  })

  test('toDB - success', () => {
    const dto = {
      street: 'Main St',
      number: '123',
      postalCode: '12345',
      city: 'Metropolis',
      country: 'Countryland',
      coordinates: { latitude: 56.78, longitude: 12.34 }
    }

    const mapper = new AddressMapper()

    const db = mapper.toDB(dto)

    expect(db.street).toBe(dto.street)
    expect(db.number).toBe(dto.number)
    expect(db.postal_code).toBe(dto.postalCode)
    expect(db.city).toBe(dto.city)
    expect(db.country).toBe(dto.country)
    expect(db.coordinates).toEqual({ x: dto.coordinates.longitude, y: dto.coordinates.latitude })
    expect(db.updated_at).toBeInstanceOf(Date)
  })
})
