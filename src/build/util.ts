import { transform } from '@babel/core';

const babelOpt = {
  babelrc: false,
  presets: [
    [
      require('@babel/preset-env').default,
      {
        useBuiltIns: false,
        // Do not transform modules to CJS
        modules: false,
        // Exclude transforms that make all code slower
        exclude: ['transform-typeof-symbol']
      }
    ]
  ]
};

export function transES5(code: string): string {
  const res = transform(code, babelOpt);

  if (res && res.code) return res.code;

  return '';
}
