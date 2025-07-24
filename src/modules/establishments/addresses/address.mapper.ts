import { sql } from 'drizzle-orm'
import { Address } from '../../../db/schema'
import { AddressDTO } from '../../../types/vista-spec.types'

export default class AddressMapper {
  toDTO (input: typeof Address.$inferInsert): AddressDTO {
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

  toDTOs (input: Array<typeof Address.$inferInsert>): AddressDTO[] {
    return input.map(this.toDTO)
  }

  toDB (data: AddressDTO): typeof Address.$inferInsert {
    const output: Record<string, any> = {
      id: data.id,
      street: data.street,
      number: data.number,
      postal_code: data.postalCode,
      city: data.city,
      country: data.country,
      coordinates: {
        x: data.coordinates.longitude,
        y: data.coordinates.latitude
      },
      updated_at: sql`NOW()`
    }

    return output as typeof Address.$inferInsert
  }
}
