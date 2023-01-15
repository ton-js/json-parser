
import { writeFile } from 'node:fs/promises';

import { build, BuildOptions } from 'esbuild';

import manifest from './package.json' assert { type: 'json' };


interface BuildDefinition {
  name: string;
  options: BuildOptions;
}


const builds: BuildDefinition[] = [
  {
    name: 'cjs',
    options: {
      platform: 'node',
      format: 'cjs',
      outfile: 'dist/index.cjs',
    },
  },
  {
    name: 'esm',
    options: {
      platform: 'node',
      format: 'esm',
      outfile: 'dist/index.mjs',
    },
  },
];


for (const definition of builds) {

  console.log(
    `\n> BUILDING: ${definition.name}\n`
  );

  const result = await build({
    entryPoints: [
      'src/index.ts',
    ],
    bundle: true,
    tsconfig: 'tsconfig.lib.json',
    metafile: true,
    sourcemap: 'linked',
    define: {
      PACKAGE_NAME: `"${manifest.name}"`,
      PACKAGE_VERSION: `"${manifest.version}"`,
    },
    plugins: [],
    ...definition.options,

  }).catch(error => {
    console.error(error);
    process.exit(1);

  });

  const {
    warnings,
    errors,
    metafile,

  } = result;

  for (const message of errors) {
    console.error(message.location, message.text);
  }

  for (const message of warnings) {
    console.warn(message.location, message.text);
  }

  await writeFile(
    `${definition.options.outfile}.meta.json`,
    JSON.stringify(metafile, null, 4)
  );

}
