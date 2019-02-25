const assert = require('assert');
const rollupPluginTodo = require('../index.js');
const rollup = require('rollup');
const { join } = require('path');

const roll = async () => {
  const inputOptions = {
    input: './test/import.js',
    plugins: [rollupPluginTodo()]
  };
  const outputOptions = {
    dir: join(__dirname, 'build'),
    format: 'cjs'
  };
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  // generate code
  const { output } = await bundle.generate(outputOptions);
  await bundle.write(outputOptions);
  }
  roll();
