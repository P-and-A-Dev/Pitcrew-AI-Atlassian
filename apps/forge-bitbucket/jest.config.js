module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.spec.ts'],
    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!src/**/*.d.ts',
        '!src/tests/**',
        '!src/**/__tests__/**',
    ],
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 50,
            functions: 60,
            lines: 60,
        },
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    verbose: true,
};
