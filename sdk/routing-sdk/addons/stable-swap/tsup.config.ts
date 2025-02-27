import { defineConfig } from 'tsup'
import { exec } from 'child_process'

export default defineConfig((options) => ({
  entry: {
    index: './src/index.ts',
  },
  sourcemap: true,
  skipNodeModulesBundle: true,
  format: ['esm', 'cjs'],
  noExternal: ['@monswap/utils'],
  dts: false,
  clean: !options.watch,
  treeshake: true,
  splitting: true,
  onSuccess: async () => {
    exec('tsc --emitDeclarationOnly --declaration', (err, stdout) => {
      if (err) {
        console.error(stdout)
        if (!options.watch) {
          process.exit(1)
        }
      }
    })
  },
}))
