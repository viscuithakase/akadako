module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  setupFiles: [
    './jest_setup.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js}',
    '!**/node_modules/**'
  ],
  moduleFileExtensions: [
    'vue',
    'js',
    'json'
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
