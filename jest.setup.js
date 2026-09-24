// Mock uuid module for Jest ESM compatibility
jest.mock('uuid', () => ({
  validate: jest.fn((value) => typeof value === 'string' && value.length > 0),
  v4: jest.fn(() => 'mock-uuid-v4'),
}), { virtual: true })
