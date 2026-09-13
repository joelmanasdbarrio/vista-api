import AccountMapper from 'src/modules/accounts/account.mapper'
import { AccountDB } from 'src/types/database.types'
import { AccountTypeEnum } from 'src/types/vista-spec.types'

describe('AccountMapper', () => {
  test('toDTOs - success', async () => {
    const dbs: AccountDB[] = [
      {
        id: 'account-1',
        name: 'First Account',
        username: 'first_account',
        email: 'first@example.com',
        biography: '',
        gender: 'other',
        birthdate: null,
        avatar: '',
        website: '',
        is_private: false,
        is_verified: false,
        type: AccountTypeEnum.PERSONAL,
        created_at: new Date('2020-01-01T00:00:00.000Z'),
        updated_at: new Date('2020-01-02T00:00:00.000Z')
      },
      {
        id: 'account-2',
        name: 'Second Account',
        username: 'second_account',
        email: 'second@example.com',
        biography: '',
        gender: 'other',
        birthdate: null,
        avatar: '',
        website: '',
        is_private: false,
        is_verified: false,
        type: AccountTypeEnum.PERSONAL,
        created_at: new Date('2021-01-01T00:00:00.000Z'),
        updated_at: new Date('2021-01-02T00:00:00.000Z')
      }
    ]

    const dtos = await new AccountMapper().toDTOs(dbs)

    expect(dtos).toHaveLength(2)
    expect(dtos[0].id).toBe(dbs[0].id)
    expect(dtos[1].id).toBe(dbs[1].id)
  })
})
