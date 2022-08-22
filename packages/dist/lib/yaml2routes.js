"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const make_endpoints_1 = require("./make-endpoints");
const commander_1 = __importDefault(require("commander"));
commander_1.default
    .version("0.0.1", "-v --version")
    .usage("[options]")
    .option("-i --input <fileName | dirName>", "input file or directory name(required)")
    .option("-o --output <fileName>", "output file name for routes.json(default: 'routes.json'")
    .option("-p --prefix <prefix>", "response data file prefix")
    .option("-s --stereo-type <fileName", "prototype of output routes.jsib")
    .option("-w --with-validation", "enable to output validation parameters")
    .parse(process.argv);
const options = commander_1.default.opts();
const input = options.input;
const prefix = options.prefix;
const output = options.output || 'routes.json';
const withValidation = options.withValidation;
const stereoTypeFile = options.stereoType;
if (!input) {
    console.error('ERROR: input is required.');
    process.exit(1);
}
if (!fs_1.default.existsSync(input)) {
    console.error('ERROR: input does not exist.');
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
// read stereo type
let stereoType = {};
if (stereoTypeFile) {
    if (!fs_1.default.existsSync(stereoTypeFile)) {
        console.error('ERROR: stereoType does not exist.');
        process.exit(1);
    }
    const stat = fs_1.default.statSync(stereoTypeFile);
    if (!stat.isFile()) {
        console.error('ERROR: stereoType is not file.');
        process.exit(1);
    }
    try {
        stereoType = JSON.parse(fs_1.default.readFileSync(stereoTypeFile, 'utf-8'));
    }
    catch (err) {
        console.error('ERROR: can\'t read stereoType.');
        console.error(err);
        process.exit(1);
    }
}
// make outputPath
const dirName = path_1.default.dirname(output);
try {
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
    // if not need validation, delete validation infos.
    if (!withValidation) {
        for (const endpoint of endpoints) {
            endpoint.validatorArgs = undefined;
        }
    }
    // if prefix option exist, write data files to individual files
    if (prefix) {
        let fileIndex = 1;
        endpoints.forEach((endpoint) => {
            endpoint.matches.forEach(match => {
                if (match.metadataType === 'immediate') {
                    const metaData = match.metadata;
                    const data = metaData.data;
                    if (data) {
                        const fileName = prefix + fileIndex;
                        const fullPath = path_1.default.resolve(dirName, fileName);
                        fileIndex++;
                        if (metaData.datatype == 'object') {
                            const outputData = JSON.stringify(data, null, '  ');
                            fs_1.default.writeFileSync(fullPath, outputData);
                            metaData.datatype = 'file';
                            metaData.data = fileName;
                        }
                        else if (metaData.datatype == 'value') {
                            const value = data;
                            try {
                                const jsonData = JSON.parse(value);
                                fs_1.default.writeFileSync(fullPath, JSON.stringify(jsonData, null, '  '));
                            }
                            catch (err) {
                                fs_1.default.writeFileSync(fullPath, value);
                            }
                            metaData.datatype = 'file';
                            metaData.data = fileName;
                        }
                    }
                }
            });
        });
    }
    // output routes.json
    const outputData = Object.assign(Object.assign({}, stereoType), { endpoints });
    fs_1.default.writeFileSync(path_1.default.resolve(dirName, output), JSON.stringify(outputData, null, '  '));
}
catch (error) {
    console.error('ERROR: some error occurred!');
    console.log(error);
    process.exit(1);
}