const parseString = require('xml2js').parseString;
const fs = require('fs');
const path = require('path');
const util = require('util');
const cheerio = require('cheerio');
const saveToMongo = require('./saveToMongo');


const xmls = fs.readdirSync(path.join(__dirname, 'xmls'));

const importantErrors = ['title', 'content', 'image', 'timeLimit', 'memLimit', 'inputDesc', 'outputDesc', 'sampleInput', 'sampleOutput', 'test'];

xmls.forEach(xmlFileName => {
  const xml = fs.readFileSync(path.join(__dirname, 'xmls', xmlFileName));
  parseString(xml, (err, result) => {
    if (err) {
      throw err;
    }
    const problems = result.fps.item;
    const formattedProblems = problems.map(problem => {
      let errors = {
        image: false,
        title: false,
        timeLimit: false,
        memLimit: false,
        content: false,
        inputDesc: false,
        outputDesc: false,
        sampleInput: false,
        sampleOutput: false,
        test: false,
        hint: false,
        origin: false,
        solution: false,
      };
      let title, timeLimitUnit, timeLimit, memLimitUnit, memLimit, content, inputDesc, outputDesc, sampleInput,
        sampleOutput, test, hint, origin, solution;
      if (checkTitle(problem)) {
        title = problem.title.join().trim();
      } else {
        title = '';
        errors.title = true;
      }
      if (checkTimeLimitUnit(problem)) {  //default is s
        timeLimitUnit = problem.time_limit[0].$.unit;
        timeLimit = timeLimitUnit === "s" ? problem.time_limit[0]._ * 1000 : problem.time_limit[0]._;   //convert to ms
      } else {
        if (checkTimeLimit(problem)) {
          timeLimit = problem.time_limit.join().trim();
        } else {
          timeLimit = '';
          errors.timeLimit = true;
        }
      }
      if (checkMemLimitUnit(problem)) {
        memLimitUnit = problem.memory_limit[0].$.unit;
        memLimit = memLimitUnit === "mb" ? problem.memory_limit[0]._ * 1024 : problem.memory_limit[0]._;    //convert to kb
      } else {
        if (checkMemLimit(problem)) {
          memLimit = problem.memory_limit.join().trim();
        } else {
          memLimit = '';
          errors.memLimit = true;
        }
      }
      const imgs = problem.img && problem.img.reduce((imgMap, i) => {
        if (validate()(i, 'src') && validate()(i, 'base64')) {
          imgMap[i.src.join('')] = i.base64.join('').trim();
        }
        return imgMap;
      }, {});
      if (validate()(problem, 'description')) {
        content = problem.description.join('').trim();
      } else {
        content = '';
        errors.content = true;
      }
      if (imgs && content) {      //have images
        const $ = cheerio.load(content);
        const imgElements = $('img');
        imgElements.each(function () {      //change image url to base64
          const originSrc = $(this).attr('src');
          const extName = path.extname(originSrc).substr(1);
          if (imgs.hasOwnProperty(originSrc)) {
            const base64 = 'data:image/' + extName + ';base64,' + imgs[originSrc];
            $(this).attr('src', base64);
          } else {
            errors.image = true;
            console.error('problem: ' + title + '\'s image url is not corresponds to img info ' + originSrc);
          }
        });
        content = $.html();
      }
      if (validate()(problem, 'input')) {
        inputDesc = problem.input.join('').trim();
      } else {
        inputDesc = '';
        errors.inputDesc = true;
      }
      if (validate()(problem, 'output')) {
        outputDesc = problem.output.join('').trim();
      } else {
        outputDesc = '';
        errors.outputDesc = true;
      }
      if (validate()(problem, 'sample_input')) {
        sampleInput = problem.sample_input.join('').trim();
      } else {
        sampleInput = '';
        errors.sampleInput = true;
      }
      if (validate()(problem, 'sample_output')) {
        sampleOutput = problem.sample_output.join('').trim();
      } else {
        sampleOutput = '';
        errors.sampleOutput = true;
      }
      test = [];
      if (!validate()(problem, 'test_input') || !validate()(problem, 'test_output')) {
        errors.test = true;
      } else {
        const testNumber = problem.test_input.length === problem.test_output.length ? problem.test_input.length : 0;
        if (testNumber) {
          for (let i = 0; i < testNumber; i++) {
            test.push({input: problem.test_input[i], output: problem.test_output[i]});
          }
        } else {
          console.error(`test for problem:[${title}] is wrong`);
          errors.test = true;
        }
      }
      if (validate()(problem, 'hint')) {
        hint = problem.hint.join('').trim();
      } else {
        errors.hint = true;
        hint = '';
      }
      if (validate()(problem, 'source')) {
        origin = problem.source.join('').trim();
      } else {
        errors.origin = true;
        origin = '';
      }
      if (validate()(problem, 'solution')) {
        solution = problem.solution.map(s => ({language: s.$.language, code: s._}));
      } else {
        errors.solution = true;
        solution = [];
      }
      // console.log(util.inspect({
      //     title,
      //     timeLimit,
      //     memLimit,
      //     origin,
      //     content,
      //     submitCount: 0,
      //     acceptCount: 0,
      //     inputDesc,
      //     outputDesc,
      //     sampleInput,
      //     sampleOutput,
      //     test,
      //     hint,
      //     errors,
      //     solution,
      // }, false, null));
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
        errors,
        solution,
        submits: [],
      };
    }).filter(noErrors);
    console.log(util.inspect(formattedProblems, false, null));
    saveToMongo(formattedProblems);
    // fs.writeFileSync(path.join(__dirname, "fps-to-json.js"), util.inspect(FormattedProblems, false, null));
  });
});


function checkTitle(problem) {
  return validate()(problem, 'title');
}

function checkTimeLimitUnit(problem) {
  return validate()(problem, 'time_limit') && problem.time_limit[0].$ && problem.time_limit[0].$.unit;
}

function checkMemLimitUnit(problem) {
  return validate()(problem, 'memory_limit') && problem.memory_limit[0].$ && problem.memory_limit[0].$.unit;
}

function checkMemLimit(problem) {
  return validate()(problem, 'memory_limit');
}

function checkTimeLimit(problem) {
  return validate()(problem, 'time_limit');
}

function validate(config = {isArray: true, minArrayLength: 1}) {
  return function (problem, prop) {
    if (!problem[prop]) {
      return false;
    }
    return !(config.isArray && (!Array.isArray(problem[prop]) || problem[prop].length < config.minArrayLength));
  }
}

function noErrors(problem) {
  return Object.entries(problem.errors).filter(([prop]) => importantErrors.includes(prop)).every(([prop, isError]) => !isError);
}