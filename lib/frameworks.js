function express(middleware) {
  return middleware;
}

// 暂时只支持express框架，后续考虑增加koa
const converters = {express};

module.exports = function(middleware, framework) {
  if (framework) {
    if (converters[framework] !== -1) {
      return converters[framework](middleware);
    } else {
      throw new Error(`Unsupported framework: ${framework}`);
    }
  } else {
    return express(middleware);
  }
};
