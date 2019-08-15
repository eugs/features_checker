const recursiveReadSync = require('recursive-readdir-sync');
const fsx = require('fs-extra');
const expect = require('chai').expect;
const addContext = require('mochawesome/addContext');
const OUTPUT_DIR = './test-results',
      SCEN_FILE = 'scenarios.txt',
      OUTL_FILE = 'outlines.txt',
      OUTL_FILE2 = 'outlines_no_placeholders.txt';

  before('check reporter dir', () => {
    fsx.ensureDirSync(OUTPUT_DIR);
  })

  describe('Verify all Scenario and Scenarios Outlines names', () => {
    let scenarios = [];
    let outlines = [];

      before('grab all texts', () => {
        let files = recursiveReadSync('./features/');

        files.forEach((file) => {
          let text = fsx.readFileSync(file, 'utf8');
          
            // grab all scenario names
          let scenarioRE = RegExp(/(?:.*Scenario:)(.+$)/gim);
          while((matches = scenarioRE.exec(text)) !== null) {
            scenarios.push(matches[1].trim());
          }

          // grab all scenario outline names
          let outlineRE = RegExp(/(?:.*Scenario Outline:)(.+$)/gim);
          while((matches = outlineRE.exec(text)) !== null) {
            outlines.push(matches[1].trim());
          }
        });

        console.log('grabbed scenarios', scenarios.length);
        console.log('grabbed outlines', outlines.length)
      });

      it('should have unique Scenario names', function () {
        let duplicates = new Set(scenarios.filter((el, index, arr) => arr.indexOf(el) !== index));
        
        expect(duplicates.size).to.be.equal(0, 
          `duplicated values detected, check: ${SCEN_FILE} 
          ${
            addContext(this, {title: 'duplicates', value: Array.from(duplicates)}),
            storeInfo(SCEN_FILE, Array.from(duplicates).join('\n'))
          }`)
      })

      it('should have unique Scenario Outline names', function () {
        let duplicates = new Set(outlines.filter((el, index, arr) => arr.indexOf(el) !== index));
        
        expect(duplicates.size).to.be.equal(0, 
          `duplicated values detected, check: ${OUTL_FILE} 
          ${
            addContext(this, {title: 'duplicates', value: Array.from(duplicates)}),
            storeInfo(OUTL_FILE, Array.from(duplicates).join('\n'))
          }`)
      })

      it('should have all outlines with placeholders', function () {
        let ambigous = outlines.filter(name => !(name.match(/<.+>/)));

        expect(ambigous.length).to.be.equal(0, 
          `ambigous outlines values detected, check ${OUTL_FILE2} 
          ${
            addContext(this, {title: 'ambigous', value: Array.from(ambigous)}),
            storeInfo(OUTL_FILE2, Array.from(ambigous).join('\n'))
          }`)
      })

  })

  function storeInfo(path, data) {
    fsx.outputFile(`${OUTPUT_DIR}/${path}`, data, 'utf8');
    console.log('file saved', path);
  }
  