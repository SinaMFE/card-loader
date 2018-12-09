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

function transES5(code) {
  return transform(code, babelOpt).code;
}

export { transES5 };
