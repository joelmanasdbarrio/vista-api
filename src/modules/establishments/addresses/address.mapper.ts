import BaseMapper from 'src/modules/base.mapper'
import { AddressDB, NewAddressDB } from 'src/types/database.types'
import { AddressDTO } from '../../../types/vista-spec.types'

export default class AddressMapper extends BaseMapper<AddressDB, AddressDTO> {
  async toDTO (input: AddressDB): Promise<AddressDTO> {
    return {
      id: input.id,
      street: input.street,
      number: input.number,
      postalCode: input.postal_code,
      city: input.city,
      country: input.country,
      coordinates: {
        latitude: input.coordinates.y,
        longitude: input.coordinates.x
      },
      createdAt: (input.created_at != null) ? input.created_at.toISOString() : undefined,
      updatedAt: (input.updated_at != null) ? input.updated_at.toISOString() : undefined
    }
  }

  async toDTOs (input: AddressDB[]): Promise<AddressDTO[]> {
    return await Promise.all(input.map(this.toDTO))
  }

  toDB (data: AddressDTO): NewAddressDB {
    return {
      street: data.street,
      number: data.number,
      postal_code: data.postalCode,
      city: data.city,
      country: data.country,
      coordinates: {
        x: data.coordinates.longitude,
        y: data.coordinates.latitude
      },
      updated_at: new Date()
    }
  }
}
