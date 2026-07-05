export default function getId (input: any): string {
  return typeof input === 'string' ? input : input.id
}
