#!/usr/bin/env node

const fs = require('fs');
const N3 = require('n3');
const fetch = require('node-fetch');

let indir = process.argv[2];

if (! ( indir && fs.lstatSync(indir).isDirectory())) {
    console.error('usage: gephi_network.js directory');
    process.exit(1);
}

main();

async function main() {
    let files = fs.readdirSync(indir);
    let promises = files.map( (file) => resolveFile(file) );

    Promise.all(promises).then( (values) => {
        let graph = {};
        let nodes_hash = {};

        values.forEach( (pair) => {
            nodes_hash[pair[0]] = 1;
            nodes_hash[pair[1]] = 1;
        });

        let nodes = Object.keys(nodes_hash);

        console.log(`<?xml version="1.0" encoding="UTF-8"?>`);
        console.log(`<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">`);
        console.log(` <graph mode="static" defaultedgetype="undirected">`);
        console.log(`  <nodes>`);
        nodes.forEach( (node) => {
            console.log(`   <node id="${node}" label=${node}/>`);
        });
        console.log(`  </nodes>`);
        console.log(`  <edges>`);
        values.forEach( (pair, index) => {
            console.log(`   <edge id="${index}" source="${pair[0]}" target=${pair[1]}/>`);
        });
        console.log(`  </edges>`);
        console.log(` </graph>`);
        console.log(`</gexf>`);
    }) ;
}

async function resolveFile(file) {
    let data = fs.readFileSync(`${indir}/${file}`,'utf-8');
    let json = JSON.parse(data);
    let context = json['context']['id'];
    let object  = json['object']['id'];
    let service_result = await getObject(object);

    if (!service_result) {
        throw new Error(`Eek! Can not resolve object`);
    }
    let citing_entity = await getCititingEntity(service_result);
    return [citing_entity,context];
}

async function getObject(url) {
    const response = fetch(url);

    if (response.ok) {
        return await response.text();
    }
    else {
        return undefined;
    }
}

function getMockObject(url) {
    return fs.readFileSync("data/demo.ttl","utf-8");
}

async function getCititingEntity(ttl) {
    const parser = new N3.Parser({ format: 'Turtle'});
    return new Promise( (resolve,reject) => {
        parser.parse(ttl, (_error,quad,_prefixes) => {
            if (quad) {
                if (quad.predicate.value === 'http://purl.org/spar/cito/hasCitingEntity') {
                    resolve(quad.object.value);
                }
            }
            else {
                resolve(undefined);
            }
        });
    });
}