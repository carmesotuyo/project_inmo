module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverage: true,  // Activar la recolección de cobertura
  coverageDirectory: 'coverage',  // Directorio donde se almacenarán los reportes de cobertura
  coverageReporters: ['text', 'lcov'],  // Formatos del reporte (lcov para visualización en herramientas, text para consola)
  collectCoverageFrom: [  // Especificar archivos para la cobertura
    'src/**/*.ts',  // Incluir todos los archivos TypeScript en src
    '!src/**/*.test.ts',  // Excluir los archivos de pruebas
    '!src/**/index.ts'  // Excluir archivos index.ts si es necesario
  ]
};