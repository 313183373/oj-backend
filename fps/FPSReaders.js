const parseString = require('xml2js').parseString;
const fs = require('fs');
const path = require('path');
const xml = fs.readFileSync("./fps-example.xml");
const util = require('util');
const cheerio = require('cheerio');

parseString(xml, (err, result) => {
    if (err) {
        throw err;
    }
    const problems = result.fps.item;
    const FormattedProblems = problems.map(problem => {
        const title = problem.title.join('').trim();
        const timeLimitUnit = problem.time_limit[0].$.unit;
        const timeLimit = timeLimitUnit === "s" ? problem.time_limit[0]._ * 1000 : problem.time_limit[0]._;   //convert to ms
        const memLimitUnit = problem.memory_limit[0].$.unit;
        const memLimit = memLimitUnit === "mb" ? problem.memory_limit[0]._ * 1024 : problem.memory_limit[0]._;    //convert to kb
        const imgs = problem.img && problem.img.reduce((imgMap, i) => {
            imgMap[i.src.join('')] = i.base64.join('').trim();
            return imgMap;
        }, {});
        let content = problem.description.join('').trim();
        let hasImageErrors = false;
        if (imgs) {      //have images
            const $ = cheerio.load(content);
            const imgElements = $('img');
            imgElements.each(function () {      //change image url to base64
                const originSrc = $(this).attr('src');
                const extName = path.extname(originSrc).substr(1);
                if (imgs.hasOwnProperty(originSrc)) {
                    const base64 = 'data:image/' + extName + ';base64,' + imgs[originSrc];
                    $(this).attr('src', base64);
                } else {
                    hasImageErrors = true;
                    console.error('problem: ' + title + '\'s image url is not corresponds to img info ' + originSrc);
                }
            });
            content = $.html();
        }
        const inputDesc = problem.input.join('').trim();
        const outputDesc = problem.output.join('').trim();
        const sampleInput = problem.sample_input.join('').trim();
        const sampleOutput = problem.sample_output.join('').trim();
        const test = [];
        const testNumber = problem.test_input.length === problem.test_output.length ? problem.test_input.length : 0;
        if (testNumber) {
            for (let i = 0; i < testNumber; i++) {
                test.push({input: problem.test_input[i], output: problem.test_output[i]});
            }
        } else {
            console.error(`test for problem:[${title}] is wrong`);
        }
        const hint = problem.hint.join('').trim();
        const origin = problem.source.join('').trim();
        // const solution = problem.solution.map(s => ({language: s.$.language, code: s._}));
        return {
            title,
            timeLimit,
            memLimit,
            origin,
            content,
            submitCount: 0,
            acceptCount: 0,
            inputDesc,
            outputDesc,
            sampleInput,
            sampleOutput,
            hint,
            test,
            hasImageErrors,
        };
    }).filter(problem => !problem.hasImageErrors);
    fs.writeFileSync("fps-to-json.js", util.inspect(FormattedProblems, false, null));
});
