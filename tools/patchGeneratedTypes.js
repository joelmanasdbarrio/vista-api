import fs from 'node:fs'

const filePath = new URL('../src/types/schema/vista-spec.schema.ts', import.meta.url)
const source = fs.readFileSync(filePath, 'utf8')

const patchedDiscriminators = source
  .replace(/(AccountPersonalDTO: \{[\s\S]*?)accountType: (['"])personal\2/, '$1type: $2personal$2')
  .replace(/(AccountEnterpriseDTO: \{[\s\S]*?)accountType: (['"])enterprise\2/, '$1type: $2enterprise$2')
  .replace(/(ActivityOnsiteDTO: \{[\s\S]*?)activityType: (['"])onsite\2/, '$1type: $2onsite$2')
  .replace(/(ActivityOnlineDTO: \{[\s\S]*?)activityType: (['"])online\2/, '$1type: $2online$2')

const output = patchedDiscriminators.startsWith('// @ts-nocheck')
  ? patchedDiscriminators
  : `// @ts-nocheck\n${patchedDiscriminators}`

if (output !== source) {
  fs.writeFileSync(filePath, output)
}
