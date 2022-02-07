const loader = require('../packages/dist/lib/response-modifier');
loader.loadScripts('./test/scripts')
const func = loader.getFunction('sample1.js', 'aaa');
func();
