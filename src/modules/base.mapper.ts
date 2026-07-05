export default abstract class BaseMapper<TDBRecord = any, TDTO = any> implements Mapper<TDBRecord, TDTO> {
  protected layer: string = 'Mapper'

  abstract toDTO (input: TDBRecord): Promise<TDTO>
  abstract toDTOs (input: TDBRecord[]): | Promise<TDTO[]>
  abstract toDB (data: TDTO): any
}

interface Mapper<TDBRecord = any, TDTO = any> {
  toDTO: (input: TDBRecord) => Promise<TDTO>
  toDTOs: (input: TDBRecord[]) => | Promise<TDTO[]>
  toDB: (data: TDTO) => any
}
