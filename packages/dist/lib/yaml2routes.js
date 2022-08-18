"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const make_endpoints_1 = require("./make-endpoints");
const commander_1 = __importDefault(require("commander"));
commander_1.default
    .version("0.0.1", "-v --version")
    .usage("[options]")
    .option("-i --input <fileName | dirName>", "input file or directory name(required)")
    .option("-p --prefix <prefix>", "response data file prefix")
    .option("-v --with-validation", "enable to output validation parameters")
    .parse(process.argv);
const options = commander_1.default.opts();
const input = options.input;
const prefix = options.prefix;
const withValidation = options.withValidation;
if (!input) {
    console.log('ERROR: input is required.');
    process.exit(1);
}
if (!fs_1.default.existsSync(input)) {
    console.log('ERROR: input does not exist.');
    process.exit(1);
}
// input is file or dir?
const stat = fs_1.default.statSync(input);
const dirFlag = stat.isDirectory();
const targets = [];
const yamlPat = /^.+.\ya?ml$/;
const yamlPat2 = /^all.\ya?ml$/;
if (dirFlag) {
    // directory
    const dir = fs_1.default.readdirSync(input);
    const temp = [];
    for (const ent of dir) {
        if (yamlPat.test(ent)) {
            if (yamlPat2.test(ent)) {
                // if 'all.yaml' exists, process only 'all.yaml'.
                targets.push(ent);
                break;
            }
            temp.push(ent);
        }
        if (targets.length == 0) {
            // 'all.yaml does not exist.
            targets.push(...temp);
        }
    }
}
else {
    // only single file
    targets.push(input);
}
// read and process yaml(s)
const endpoints = [];
for (const target of targets) {
    try {
        const content = fs_1.default.readFileSync(target, 'utf-8');
        const endpoint = (0, make_endpoints_1.makeEndpointsFromYaml)(content, target);
        endpoints.push(...endpoint);
    }
    catch (err) {
        console.error(`ERROR: file:'${target} can not be processed.`);
        console.error(err);
    }
}
// output routes.json
