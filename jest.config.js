module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app\\.(js|ts)', 'tests'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
};
