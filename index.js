'use strict';
const { join } = require('path');
const { writeFile, mkdir } = require('fs');

const html = (strings, ...keys) => {
  return ((...values) => {
    let template = '';
    strings.forEach((str, i) => template += `${str}${keys[i] ? keys[i] : ''}`)
    return template;
  })
}

let matchStore = [];

/**
 * @return {object}
 */
module.exports = (options) => {
  return {
    name: 'todo',
    transform(code, id) {
      let matches = code.match(/\/\/ TODO:(.*)(\W\/\/.*)|(\/\/.*)+/g);
      if (matches) {
        const parse = this.parse(code);
        let text = code;
        matches = matches.map(match => {
          const start = code.indexOf(match);
          const end = start + (match.length + 1);
          parse.body.forEach(node => {
            if (node.start >= end) {
              text = text.slice(node.start, node.end);
            }
          })
          return {
            start,
            end,
            value: match,
            code: text
          }
        })
        matchStore.push([id, matches]);
      }
    },
    buildEnd() {
      const dir = options.dir || process.cwd();
      mkdir(dir, (err) => {
        const path = join(options.dir, 'todo.html');
        const template = html`<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    <style>
      .todo {
        display: flex;
        flex-direction: column;
        background: #EEE;
        padding: 24px;
        box-sizing: boder-box;
      }
    </style>
    <h1></h1>
    <h2>TODO</h2>
    ${matchStore ? matchStore.map(([path, todos]) => `
<h3>${path}</h3>
${todos.map(todo => `
  <span class="todo">
  ${todo.value.split('\/\/').map((value, i) => {
    if (i === 0) return '';
    if (i === 1) return `<h4>${value.replace(' TODO: ', '')}</h4>`;
    return `<p>${value.replace('\/\/ ', '')}</p>`;
  }).join('')}
  <br>
  <p><strong>line</strong>${todo.start}</p>
  <code>${todo.code}</code>
  </span>
`).join(' ')}
`).join(' ') : ''}
  </body>
</html>`;
        writeFile(path, template(), (err) => {
          if (err) console.error(err);
        })
      })
    }
  };
}
