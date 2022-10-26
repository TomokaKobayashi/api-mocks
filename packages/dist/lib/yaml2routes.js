"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const make_endpoints_1 = require("./make-endpoints");
const commander_1 = __importDefault(require("commander"));
const utils_1 = require("./utils");
const yamlPat = /^.+\.ya?ml$/;
const defaultConfigFile = 'yaml2routes.config.js';
const defaultConfig = {
    requiredSetting: []
};
const tryReadConfig = (fileName = defaultConfigFile) => {
    try {
        if (fs_1.default.existsSync(fileName)) {
            const stat = fs_1.default.statSync(fileName);
            if (stat.isFile()) {
                const fullPath = path_1.default.resolve(fileName);
                const config = require(fullPath);
                return config.default;
            }
        }
    }
    catch (error) {
        console.log(`ERROR: an error occurred in reading '${fileName}'`);
        console.log(error);
        console.log('continue...');
    }
    return defaultConfig;
};
commander_1.default
    .version("0.0.1", "-v --version")
    .usage("[options]")
    .option("-i --input <fileName | dirName>", "input file or directory name(required)")
    .option("-o --output <fileName>", "output file name for routes.json(default: 'routes.json'")
    .option("-p --prefix <prefix>", "response data file prefix")
    .option("-r --required-only <level>", "output only 'required' data", parseInt)
    .option("-s --stereo-type <fileName>", "prototype of output routes.json")
    .option("-w --with-validation", "enable to output validation parameters")
    .option("-c --suppress-content-length", "set suppressContentLength flag(omitted)")
    .option("-x --extra-config <fileName>", "read extra configuration file")
    .parse(process.argv);
const options = commander_1.default.opts();
const input = options.input;
const prefix = options.prefix;
const output = options.output || 'routes.json';
const withValidation = options.withValidation;
const stereoTypeFile = options.stereoType;
const requiredOnly = options.requiredOnly;
const extraConfig = options.extraConfig;
if (!input) {
    console.error('ERROR: input is required.');
    process.exit(1);
}
if (!fs_1.default.existsSync(input)) {
    console.error('ERROR: input does not exist.');
    process.exit(1);
}
// input is file or dir?
const yamlPat2 = /^.+\/all\.ya?ml$/;
const stat = fs_1.default.statSync(input);
const dirFlag = stat.isDirectory();
const targets = [];
const temp = [];
if (dirFlag) {
    // directory
    const founds = (0, utils_1.findFiles)(input, yamlPat);
    if (founds) {
        for (const ent of founds) {
            if (yamlPat2.test(ent)) {
                targets.push(ent);
                break;
            }
            temp.push(ent);
        }
        if (targets.length == 0) {
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
// read extra configuration file
const config = tryReadConfig(extraConfig);
try {
    // read and process yaml(s)
    const endpoints = [];
    for (const target of targets) {
        try {
            const content = fs_1.default.readFileSync(target, 'utf-8');
            const endpoint = (0, make_endpoints_1.makeEndpointsFromYaml)(content, target, requiredOnly, config);
            endpoints.push(...endpoint);
        }
        catch (err) {
            console.error(`ERROR: file:'${target}' can not be processed.`);
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
    else {
        // if datatype is 'value', try to convert 'object'.
        endpoints.forEach((endpoint) => {
            endpoint.matches.forEach(match => {
                const metaData = match.metadata;
                const data = metaData.data;
                if (data) {
                    if (metaData.datatype == 'value') {
                        const value = data;
                        try {
                            const jsonData = JSON.parse(value);
                            metaData.datatype = 'object';
                            metaData.data = jsonData;
                        }
                        catch (err) {
                            // no action
                        }
                    }
                }
            });
        });
    }
    // output routes.json
    const outputData = Object.assign(Object.assign({}, stereoType), { endpoints });
    fs_1.default.writeFileSync(output, JSON.stringify(outputData, null, '  '));
}
catch (error) {
    console.error('ERROR: some error occurred!');
    console.log(error);
    process.exit(1);
}
