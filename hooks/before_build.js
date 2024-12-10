module.exports = function (ctx) {
  console.log("running hook: " + __filename);
  console.log(JSON.stringify(ctx.opts.plugin.pluginInfo));
  return Promise.resolve();
};
