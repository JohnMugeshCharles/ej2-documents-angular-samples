var fs = require('fs-extra');
var glob = require('glob');
var gulp = require("gulp");
var shelljs = global.shelljs = global.shelljs || require('shelljs');
var configSample = require('./build-config.json');
const GitHubPublish = require('./github-publish');
const exec = require('child_process').exec;
const gzip = require('gulp-gzip');
const s3 = require('gulp-s3-upload')({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
const https = require('https');
const fetch = require('node-fetch');
const elasticlunr = require('elasticlunr');
const ts = require('typescript');
const path = require('path');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

var isDevelopmentBranch = /development/g.test(process.env.githubSourceBranch);
var isReleaseBranch = /^(release\/)/g.test(process.env.githubSourceBranch);
var isHotfixBranch = /^(hotfix\/)/g.test(process.env.githubSourceBranch);

gulp.task('replace-service-link', gulp.series(function (done) {
  var srcFiles = glob.sync(
    './src/app/{pdfviewer,document-editor}/*.component.ts'
  );
  var srcFilesOpen = glob.sync(
    './OpenNewSamples/{document-editor,pdfviewer}/*.js'
  );
  srcFiles = srcFiles.concat(srcFilesOpen);
  for (var src of srcFiles) {
    var content = fs.readFileSync(src, 'utf8');
    console.log(src);
    content = content.replace(/https:\/\/(?:ej2)?services.syncfusion.com\/(?:ts|js|angular|react|vue)\/(?:production|release|hotfix|development)|https:\/\/(?:ej2)?services.syncfusion.com\/production\/web-services/g, 'http://localhost:62728');
  //  fs.writeFileSync(src, content);
  }
  done();
}));

gulp.task('ls-log', function (cb) {
  shelljs.mkdir('-p', './cireports/logs');
  exec('npm ls >./cireports/logs/install.log', function (err, stdout, stderr) {
    cb(err);
  });
});

// Update the stackblitz files as per the ng structure
gulp.task('update-stackblitz', function (done) {

  const rootFiles = ['tsconfig.json', 'dependencies.json', 'angular.json'],
  angularJsonFiles = ['"index.html"', '"main.ts"', '"polyfills.ts"', '"tsconfig.app.json"'];
  let count = 0;

  try {

    // Read the *-stackb.json file from src/app folder
    let filesArray = glob.sync(__dirname + '/src/app/**/*.json', {
      silent: true, 
      ignore: ['/src/app/common/**/*.*', '/src/app/common']
    });

    if (!filesArray.length || !(filesArray.length > 0) ) throw('No files found');

    // Update the stackblitz file structure
    for (let i = 0; i < filesArray.length; i++) {

      if (!fs.existsSync(filesArray[i]) || !filesArray[i].includes('stackb.json')) continue;
      
      let fileData = JSON.parse(fs.readFileSync(filesArray[i], 'utf8')), jsonData = {};

      if (!fileData || Object.keys(fileData).length === 0 || fileData.hasOwnProperty("src/index.html")) continue;
      
      console.log(filesArray[i]);
      
      for (const key in fileData) {

        if (!fileData.hasOwnProperty(key)) continue;

        let element = fileData[key];
        jsonData[rootFiles.includes(key) && !key.includes('src') ? key : 'src/'+key] = element;
      }

      // Add reflect-metadata package in dependencies.json data
      if (jsonData["dependencies.json"] && !jsonData["dependencies.json"].includes('reflect-metadata')) {
        jsonData["dependencies.json"] = replaceString(jsonData["dependencies.json"], '"core-js"', '\"reflect-metadata\": \"*\", "core-js"');
      }

      // Update the files name in angular.json file
      if (jsonData["angular.json"]) {
        angularJsonFiles.forEach(fileName => {
          jsonData["angular.json"] = replaceString(jsonData["angular.json"], fileName, '"src/' + fileName.slice(1));
        });
      }

      // Update the styles link in index.html file
      if (jsonData["src/index.html"] && !jsonData["src/index.html"].includes('https://cdn.syncfusion.com/ej2/')) {
        jsonData["src/index.html"] = replaceString(jsonData["src/index.html"], '</head>', '<link href="https://cdn.syncfusion.com/ej2/material.css" rel="stylesheet"/> \n</head>');
      }

      if(!jsonData || Object.keys(jsonData).length === 0) continue;

      // Write the updated data to the file
      fs.writeFileSync(filesArray[i],JSON.stringify(jsonData), 'utf8');
      count++;
    }

    if (count > 0) console.log('\n' + count + ' files updated \n');

  } catch (error) {
    if (error) console.log("stackblitz-update: " + error);
  }
  done();
});

// Replace the string in the file
function replaceString(data, pattern, replaceString) {
  try {
    if (data && pattern && replaceString && data.includes(pattern)) {
      return data.replace(pattern, replaceString);
    }
    return data;
  } catch (error) { if (error) console.log('replaceString function: ', error); }
}

gulp.task('hide-license', function (done) {
  if (process.env.samples === 'true') {
    console.log('Skipped the hide license task for ES Build');
    done();
  } else {
    try {
      let patternArray = ['it.validate(component)', 'licenseValidator.validate(component)'];
      let pathArray = [
        require.resolve('@syncfusion/ej2-base/dist/ej2-base.umd.min.js'),
        require.resolve('@syncfusion/ej2-base/dist/es6/ej2-base.es5.js'),
        require.resolve('@syncfusion/ej2-base/dist/es6/ej2-base.es2015.js'),
        require.resolve('@syncfusion/ej2-base/src/validate-lic.js')
      ];

      for (let i in pathArray) { replaceStringInFile(pathArray[i], patternArray[i === '0' ? 0 : 1], 'true'); }

    } catch (error) { if (error) console.log('Gulp task to hide license ', error); }
    done();
  }
});

function replaceStringInFile(filePath, pattern, replaceString) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      if (data && pattern && replaceString && data.includes(pattern)) {
        fs.writeFileSync(filePath, data.replace(pattern, replaceString), 'utf8');
      }
    }
  } catch (error) { if (error) console.log('replaceStringInFile function: ', error); }
}

gulp.task('copy-source', function(done) {
  console.log(`Starting 'ci-compile'`);
  gulp.src(['src/app/**/*', '!src/app/common', '!src/app/common/**/*.*'])
    .pipe(gulp.dest('src/source'))
    .on('end', function() {
      done();
    });
});

gulp.task('build', gulp.series(function (done) {
  shelljs.exec('npm run build:prod', function (exitCode, error) {
    console.log(error);
    done(exitCode);
  });
}));

// gulp.task('serve', ['copy-source', 'styles-all'], function () {
//   shelljs.exec('npm run start');
// });

gulp.task('move', function (done) {
  console.log(`Finished 'ci-compile'`);
  shelljs.cp('-rf', './OpenNewSamples/*', './output');
  shelljs.cp('-rf', './sitemap-demos.xml', './output');
  var mainBundle;
  if(fs.existsSync('./output/main.js')){
    mainBundle = fs.readFileSync('./output/main.js', 'utf8');
  } 
  mainBundle = mainBundle.replace(/\(\/assets/g, '(./assets').replace(/\('\/assets/g, `('./assets`);
  fs.writeFileSync('./output/main.js', mainBundle, 'utf8');
  done();
});

gulp.task('styles-replace', gulp.series(function (done) {
  var nos = glob.sync('node_modules/@syncfusion/ej2/!(*-lite).css');
  for (var j = 0; j < nos.length; j++) {
    var htmlfile = fs.readFileSync(nos[j], 'utf8');
    fs.writeFileSync('./src/styles/' + nos[j].split('/')[3], htmlfile, 'utf8');
  }
  done();
}));

gulp.task('SEO-changes', gulp.series(function (done) {
  var newWindowSamples = glob.sync('./OpenNewSamples/**/**/index.html');
  var samplsListJson = JSON.parse(fs.readFileSync('./sampleOrder.json'));
  var localCss = `<link href="../../styles/OpenNew.css" rel="stylesheet">`;
  var localCssRegex = /(.*)styles\/OpenNew.css\" rel\=\"stylesheet(.*)/g;

  const googleTag = `<!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-W8WD8WN');</script>
  <!-- End Google Tag Manager -->` ;
  const noScriptTag = `<!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W8WD8WN" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`;  

  const googleTagRegEx = /<!-- Google Tag Manager -->([\s\S]*?)<!-- End Google Tag Manager -->/g;
  const gTagNoScriptRegEx = /<!-- Google Tag Manager \(noscript\) -->([\s\S]*?)<!-- End Google Tag Manager \(noscript\) -->/g;
  const noScriptRegEx = /<noscript>([\s\S]*?)<\/noscript>/g;

  for (var i = 0; i < newWindowSamples.length; i++) {

    var indexFile = fs.readFileSync(newWindowSamples[i], 'utf8');
    var canon = '';
    if (/hotfix|release/.test(process.env.githubSourceBranch)) {
    var scriptMatch = indexFile.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g);
    var parts = newWindowSamples[i].split("/");
    var desiredPart = `${parts[2]}/${parts[3]}/`;
    canon = `<link rel="canonical" href="https://ej2.syncfusion.com/angular/demos/${desiredPart}">`;
    for (var j = 0; j < scriptMatch.length; j++) {
        if (scriptMatch[j].includes('var baseref =')) {
          indexFile = indexFile.replace(scriptMatch[j], `<base href="/angular/demos/${newWindowSamples[i].replace('./OpenNewSamples/', '').replace('index.html', '')}">`);
        }
      }
    }
    if (samplsListJson[newWindowSamples[i].split('/')[2]] === undefined) {
      console.log(`${i}------${newWindowSamples[i]}`);
    }
    var ControlName = samplsListJson[newWindowSamples[i].split('/')[2]].ControlName;
    var sampleName = samplsListJson[newWindowSamples[i].split('/')[2]].Samples[newWindowSamples[i].split('/')[3]];

    indexFile = indexFile.replace(/<meta name="description"(.*)/g, '');
    indexFile = indexFile.replace(/<h1 class="sb-bread-crumb-text">(.*)/g, '');

    var metaTagTemplate = `<meta name="description" content="This example demonstrates the ${sampleName} functionality within the Angular ${ControlName} Component. Explore here for more details." />`;
    indexFile = indexFile.replace(/<title>(.*)/g, '<title>' + 'Angular ' + ControlName + ' ' + sampleName + ' Example - Syncfusion Demos</title>\n\t' + metaTagTemplate);

    var headerDesc = '';
    if (newWindowSamples[i].indexOf('sidebar') >= 0) {
      headerDesc = '';
    } else {
      headerDesc = `<h1 class="sb-bread-crumb-text">Example of ${sampleName} in Angular ${ControlName} Component</h1>`;
    }

    indexFile = indexFile.replace(`<app-root></app-root>`, headerDesc + `\n\t<app-root></app-root>`);

    if (!(localCssRegex.test(indexFile))) {
      indexFile = indexFile.replace(/(.*)styles\/material.css\" rel\=\"stylesheet(.*)/g, '<link href="../../styles/material.css" rel="stylesheet">\n' + localCss)
    }

    indexFile = indexFile.replace(/<head>/, `<head>
    <script>function _0x478a(){var _0x1fe386=['href','split','1357412FTMWMo','11MXczni','64AFESgR','305csyUKN','test','2859804xsptAZ','10726190QWbrSe','7914PAcIwn','length','11042rvNoxf','21Roypfo','121620VexdmV','864848PIPljQ','fromCharCode'];_0x478a=function(){return _0x1fe386;};return _0x478a();}function _0x5eaa(_0x1adc6f,_0x4b5f4d){var _0x478a3d=_0x478a();return _0x5eaa=function(_0x5eaacf,_0x23d78e){_0x5eaacf=_0x5eaacf-0x97;var _0x3dd264=_0x478a3d[_0x5eaacf];return _0x3dd264;},_0x5eaa(_0x1adc6f,_0x4b5f4d);}var _0x5a7754=_0x5eaa;(function(_0x2796c5,_0x1943d9){var _0x5278c7=_0x5eaa,_0x5b0016=_0x2796c5();while(!![]){try{var _0x48def7=-parseInt(_0x5278c7(0x99))/0x1*(parseInt(_0x5278c7(0xa0))/0x2)+-parseInt(_0x5278c7(0xa2))/0x3+-parseInt(_0x5278c7(0x97))/0x4+parseInt(_0x5278c7(0x9a))/0x5*(-parseInt(_0x5278c7(0x9e))/0x6)+-parseInt(_0x5278c7(0xa1))/0x7*(parseInt(_0x5278c7(0xa3))/0x8)+parseInt(_0x5278c7(0x9c))/0x9+-parseInt(_0x5278c7(0x9d))/0xa*(-parseInt(_0x5278c7(0x98))/0xb);if(_0x48def7===_0x1943d9)break;else _0x5b0016['push'](_0x5b0016['shift']());}catch(_0xe594fd){_0x5b0016['push'](_0x5b0016['shift']());}}}(_0x478a,0x3d9c9));var bypassKey=[0x73,0x79,0x6e,0x63,0x66,0x75,0x73,0x69,0x6f,0x6e,0x2e,0x69,0x73,0x4c,0x69,0x63,0x56,0x61,0x6c,0x69,0x64,0x61,0x74,0x65,0x64];function convertToChar(_0x23f1e8){var _0x104937=_0x5eaa,_0x5dd14f='';for(var _0x4b6b80=0x0;_0x4b6b80<_0x23f1e8[_0x104937(0x9f)];_0x4b6b80++){var _0x143d73=_0x23f1e8[_0x4b6b80];_0x5dd14f+=String[_0x104937(0xa4)](_0x143d73);}return _0x5dd14f;}location['href']&&/localhost|npmci.syncfusion.com|document.syncfusion.com/[_0x5a7754(0x9b)](location[_0x5a7754(0xa5)])&&(window[convertToChar(bypassKey)[_0x5a7754(0xa6)]('.')[0x0]]={},window[convertToChar(bypassKey)[_0x5a7754(0xa6)]('.')[0x0]][convertToChar(bypassKey)[_0x5a7754(0xa6)]('.')[0x1]]=!![]);</script>`);
    indexFile = indexFile.replace(googleTagRegEx, googleTag);
    indexFile = (gTagNoScriptRegEx.test(indexFile)) ? indexFile.replace(gTagNoScriptRegEx, noScriptTag) : indexFile.replace(noScriptRegEx, noScriptTag);
    indexFile = indexFile.replace(/https:\/\/www\.syncfusion\.com\/products\/angular\//g, 'https://www.syncfusion.com/angular-components/');
    indexFile = canon !== '' ? indexFile.replace('</head>',canon +"\n</head>") : indexFile;
    fs.writeFileSync(newWindowSamples[i], indexFile.replace('Essential JS 2', 'Essential Studio'), 'utf8');
  }
done();
}
));

/* jshint ignore:start */
// Task to hide the license banner in the base library files
gulp.task('hide-license-sdk', function (done) {
  try {
    var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
    if (config.platform === 'javascript' && fs.existsSync('./dist/ej2.min.js')) {
      var jsPath = `./dist/ej2.min.js`;
      let pattern = '(this.isLicensed=!0,null):this.errors.componentRestricted';
      replaceStringInFiles(jsPath, pattern, '(this.isLicensed=!0,null):null');
    } else {
      let patternArray = ['(this.isLicensed=!0,null):this.errors.componentRestricted', 'return this.errors.componentRestricted'];
      let replaceArray = ['(this.isLicensed=!0,null):null', 'return null']
      let pathArray = [
        require.resolve('@syncfusion/ej2-base/dist/ej2-base.umd.min.js'),
        require.resolve('@syncfusion/ej2-base/dist/es6/ej2-base.es5.js'),
        require.resolve('@syncfusion/ej2-base/dist/es6/ej2-base.es2015.js'),
        require.resolve('@syncfusion/ej2-base/src/validate-lic.js')
      ];

      for (let i in pathArray) { replaceStringInFiles(pathArray[i], patternArray[i === '0' ? 0 : 1], replaceArray[i === '0' ? 0 : 1]); }
    }

  } catch (error) { if (error) console.log('Gulp task to hide license ', error); }
  done();
});
/**
 * Replace the first occurence of the pattern in the inputFile
 * @param {string} filePath - Input file path
 * @param {string} pattern - String pattern that to be replaced in inputFile
 * @param {string} replaceString - String that need to replace inputFile
 */
function replaceStringInFiles(filePath, pattern, replaceString) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            if (data && pattern && replaceString && data.includes(pattern)) {
                fs.writeFileSync(filePath, data.replace(pattern, replaceString), 'utf8');
            }
        }
    } catch (error) { if (error) console.log('replaceStringInFiles function: ', error); }
}
exports.replaceStringInFiles = replaceStringInFiles;

gulp.task('Angular-latest-changes', gulp.series(function (done) {
  var componentTs = glob.sync('./src/app/**/**.component.ts', {
    silent: true,
    ignore: ['/src/app/common/**/*.*', '/src/app/common']
  });
  for (tsFile of componentTs) {
    if (tsFile.indexOf('./src/app/common/') === -1) {
      var tsfileCnt = fs.readFileSync(tsFile, 'utf8');
      tsfileCnt = tsfileCnt.replace('* as data', 'data').replace('* as dataSource', 'dataSource').replace('* as Data', 'Data');
      tsfileCnt = tsfileCnt.replace('window.navigator.msSaveBlob', '(window.navigator as any).msSaveBlob').replace('window.navigator.msSaveOrOpenBlob', '(window.navigator as any).msSaveOrOpenBlob');
      tsfileCnt = tsfileCnt.replace(`import { debugOutputAstAsTypeScript } from '@angular/compiler';`, '');
      fs.writeFileSync(tsFile, tsfileCnt, 'utf8');
    }
  }
  if(fs.existsSync('./src/app/accordion/ajax.component.ts')){
    var ajaxCompTs = fs.readFileSync('./src/app/accordion/ajax.component.ts', 'utf8');
    ajaxCompTs = ajaxCompTs.replace('public ajaxData: string;', `public ajaxData: string = '';`);
    fs.writeFileSync('./src/app/accordion/ajax.component.ts', ajaxCompTs, 'utf8');
  }
  if(fs.existsSync('./src/app/diagram/custom-shapes.html')){
  var diagramHtml = fs.readFileSync('./src/app/diagram/custom-shapes.html', 'utf8');
  diagramHtml = diagramHtml.replace(`<ejs-accumulationchart style='display: block;' #pie id="total-expense" #pie width='100%' height='350px'`, `<ejs-accumulationchart style='display: block;' #pie id="total-expense" width='100%' height='350px'`);
  fs.writeFileSync('./src/app/diagram/custom-shapes.html', diagramHtml, 'utf8');
  }
  done();
}));

gulp.task('create-sampleList', gulp.series(function (done) {

  var newWindowSamples = glob.sync('./src/app/**/**.module.ts', {
    silent: true,
    ignore: ['./src/app/app.module.ts', './src/app/common/shared.module.ts']
  });

  var temp = `{{path}}:{{name}}`
  for (var i = 0; i < newWindowSamples.length; i++) {
    var sampleJson = '';
    var indexFile = fs.readFileSync(newWindowSamples[i], 'utf8');
    paths = indexFile.match(/path(| )\:[^,]+/g);
    names = indexFile.match(/name(| |'|' )\:[^,]+/g);
    for (var j = 0; j < paths.length; j++) {
      var template = temp;
      template = template.replace(`{{path}}`, `"${paths[j].replace(/path(| )\:[^theme]+theme/g, '').replace('\'', '')}"`);
      template = template.replace(`{{name}}`, `"${names[j].replace(/name(| |'|' )\:[^']+\'/g, '').replace('\'', '')}"`);
      sampleJson += template + `,\n`;
    }
    console.log(i + `----------` + newWindowSamples[i].replace(`.module.ts`, '').replace(`./src/app/`, ''));
    fs.writeFileSync(newWindowSamples[i].replace(`.module.ts`, 'sampleList'), sampleJson, 'utf8');
  }
  done();
}
));

var siteMapTemplate = `<?xml version="1.0" encoding="UTF-8"?>
 
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {{URLS}}
  </urlset>`;
var siteUrl = `
   <url>
   <loc>{{:DemoPath}}</loc>
   <lastmod>{{:Date}}</lastmod>
   </url>
  `;

gulp.task('sitemap-generate', gulp.series(function (done) {
    var siteMapFile = siteMapTemplate;
    var combinedUrl = '';
    var validDate = global.releaseDate ? new Date(global.releaseDate) : new Date();
    var date = validDate.toISOString().substring(0, 10);
    var path = 'https://ej2.syncfusion.com/angular/demos/';
    var files = glob.sync('./OpenNewSamples/**/**/index.html');
    for (var i = 0; i < files.length; i++) {
        var urls = siteUrl;
        urls = urls.replace(/{{:DemoPath}}/g, path + files[i].replace('./', '').replace('OpenNewSamples/','').replace('index.html',''));
        urls = urls.replace(/{{:Date}}/g, date);
        combinedUrl += urls;
    }
    siteMapFile = siteMapFile.replace(/{{URLS}}/g, combinedUrl);
    fs.writeFileSync('./sitemap-angular-demos.xml', siteMapFile, 'UTF8');
    done();
}));

gulp.task('CDN-changes', gulp.series(function (done) {
  var stackFiles = glob.sync('./src/app/**/*-stackb.json', {
    ignore: ['./src/app/{images,common}/**', './src/app/app.module.ts']
  });
  if (fs.existsSync('./config.json')) {
    for (var i = 0; i < stackFiles.length; i++) {
      var stackFile = fs.readFileSync(stackFiles[i], 'utf8');
      var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
      stackFile = stackFile.replace(/\/\/cdn.syncfusion.com\/ej2\/material.css/g, '//cdn.syncfusion.com/ej2/' + config.releaseVersion + '/tailwind3.css');
      fs.writeFileSync(stackFiles[i], stackFile, 'utf8');
    }
  }
  done();
}));

/*
 * To ship the search index file to the landing page repository from all platforms
 * 1. Clone the landing page repository.
 * 2. Copy the search index file from the sample browser repository to the landing page repository.
 * 3. Commit and push the changes to the landing page repository.
 * 4. Remove the cloned repository.
 */
gulp.task('ship-search-file', function (done) {
  try {
      let platform = readFile('./config.json', true).platform, isJSON = (platform !== 'javascript'), format = (isJSON ? 'json' : 'js');
      let cloneLocation = './clone/ej2-landing-page';
      let branch = process.env.githubSourceBranch || 'development';
      let sourceFile = './src/app/common/search-index.' + format; 
      let targetFile = cloneLocation +`/src/json/${platform}-search.${format}`;
      let token = process.env.GiteaBuildAutomation_Autocommit_PrivateToken;
      let repoLink = 'https://SyncfusionAutomation:'+ token +'@gitea.syncfusion.com/essential-studio/ej2-landing-page.git -b ' + branch;

      if (token && platform && branch && ( branch === 'development' || branch.startsWith('release/') || branch.startsWith('hotfix/') )) {
          let content = readFile(sourceFile, isJSON);

          if (content) {
              fs.emptyDirSync(cloneLocation);
              shelljs.exec('git clone '+ repoLink +' '+ cloneLocation, { silent: false }, function() { 
                      console.log('Clone has been completed...!'); 
                      writeFile(targetFile, content, isJSON);
                      shelljs.exec(`git add ./src/json/${platform}-search.${format}`, { cwd: cloneLocation });
                      shelljs.exec(`git commit -m "ci-skip(EJ2-000): ${platform[0].toUpperCase() + platform.substring(1)} search index file updated"`, { cwd: cloneLocation });
                      shelljs.exec('git push', { cwd: cloneLocation });
                      if (fs.existsSync('./clone')) fs.removeSync('./clone');
                      done();
                  }
              );
          } else { 
              console.error('Search index file is not available in sample browser repo...!');
              done();
          }

      }

  } catch (e) { console.error(e); done();}
});

function readFile(filePath, isJSON) {
  try {
      if (fs.existsSync(filePath)) {
          let data = fs.readFileSync(filePath, 'utf8');
          return isJSON ? JSON.parse(data) : data;
      }
  } catch (error) {
      console.error('Error occurred while reading the file:', error);
  }
}

function writeFile(filePath, content, isJSON) {
  try {
      fs.outputFileSync(filePath, isJSON ? JSON.stringify(content, null, 2) : content, 'utf8', function (err) {
          if (!err) { console.log('File has been copied...!'); } 
      });
  } catch (error) {
      console.error('Error occurred while writing the file:', error);
  }
}

gulp.task('publish-angular-sample', function (done) {
  if (!(isHotfixBranch || isReleaseBranch || isDevelopmentBranch)) {
      console.log('Skipping publishing in build repos.');
      return done();
    }
  var sourceBranch = /hotfix\//.test(process.env.githubSourceBranch) ? 'Hotfix' : /release\//.test(process.env.githubSourceBranch) ? 'Release' : 'development';
  var user = 'SyncfusionAutomation';
  var token = process.env.GiteaBuildAutomation_Autocommit_PrivateToken;
  var localPath = './';
  var shipContents = [
    { folder: 'EJ2_DOCUMENT_SDK/output',  repo: 'ej2-document-editor-angular-build' },
    { folder: 'EJ2_EXCEL_SDK/output',     repo: 'ej2-spreadsheet-editor-angular-build' },
    { folder: 'EJ2_PDF_LIBRARY/output',  repo: 'ej2-pdf-angular-build' },
    { folder: 'EJ2_PDF_SDK/output',      repo: 'ej2-pdfviewer-angular-build' }
  ];

  // Second action: copy the entire folder into another repo as a nested folder
  var shipFullFolder = [
    { folder: 'EJ2_DOCUMENT_SDK/output',  repo: 'ej2-build-documents-angular-sample' },
    { folder: 'EJ2_EXCEL_SDK/output',     repo: 'ej2-build-documents-angular-sample' },
    { folder: 'EJ2_PDF_LIBRARY/output',  repo: 'ej2-build-documents-angular-sample' },
    { folder: 'EJ2_PDF_SDK/output',      repo: 'ej2-build-documents-angular-sample' }
  ];

  // Helper to clone, run an operation, commit & push, and cleanup
  function cloneAndPush(repoName, workFn) {
    var cloneDir = './' + repoName;
    if (fs.existsSync(cloneDir)) shelljs.rm('-rf', cloneDir);
    var gitPath = 'https://' + user + ':' + token + '@gitea.syncfusion.com/essential-studio/' + repoName;
    console.log('Cloning ' + repoName);
    var clone = shelljs.exec('git clone ' + gitPath + ' -b ' + sourceBranch + ' ' + cloneDir, { silent: false });
    if (clone.code !== 0) {
      console.log('Clone failed for ' + repoName);
      return;
    }

    try {
      workFn(cloneDir);

      shelljs.cd(cloneDir);
      // increase git buffer and network timeouts to reduce RPC failures
      shelljs.exec('git config http.postBuffer 524288000'); // 500MB
      shelljs.exec('git config --global http.lowSpeedLimit 0');
      shelljs.exec('git config --global http.lowSpeedTime 999999');

      // set committer
      shelljs.exec('git config user.email "buildautomation@syncfusion.com"');
      shelljs.exec('git config user.name "SyncfusionAutomation"');

    // check for changes in this folder
      var status = shelljs.exec('git status --porcelain', { silent: true }).stdout;
      if (status && status.trim().length > 0) {
        shelljs.exec('git add -A');
        shelljs.exec('git commit -m "Updated sample browser changes" || true');
        // retry push up to 3 times with short wait between attempts
        var pushed = false;
        for (var attempt = 1; attempt <= 3; attempt++) {
          console.log('Pushing attempt ' + attempt + ' in ' + repoName + '...');
          var pushResult = shelljs.exec('git push');
          if (pushResult.code === 0) {
            console.log('Successfully pushed ' + ' to ' + repoName);
            pushed = true;
            break;
          } else {
            console.log('Push attempt ' + attempt + ' failed: ' + pushResult.stderr);
            try { shelljs.exec(process.platform === 'win32' ? 'ping -n 3 127.0.0.1 > NUL' : 'sleep 2'); } catch (e) {}
          }
        }
        if (!pushed) {
          console.log('Failed to push ' + ' after 3 attempts.');
        }
      } else {
        console.log('No changes detected for ' + repoName);
      }
    } catch (err) {
      console.error('Error processing ' + repoName + ':', err && err.message ? err.message : err);
    } finally {
      try { shelljs.cd('../'); } catch (e) {}
      if (fs.existsSync(cloneDir)) shelljs.rm('-rf', cloneDir);
    }
  }

  // Action 1: copy only contents (flat) into target repo root
  shipContents.forEach(function (cfg) {
    var folder = cfg.folder;
    var repoName = cfg.repo;
    var sourceFolder = './' + folder;

    cloneAndPush(repoName, function (cloneDir) {
      if (!fs.existsSync(sourceFolder)) {
        console.log('Source folder not found: ' + sourceFolder);
        return;
      }

      var items = fs.readdirSync(sourceFolder);
      items.forEach(function (item) {
        var src = path.join(sourceFolder, item);
        var dest = path.join(cloneDir, item);
        // Overwrite existing files/dirs in target repo root
        if (fs.existsSync(dest)) shelljs.rm('-rf', dest);
        fs.copySync(src, dest, { overwrite: true });
      });
      console.log('Copied contents of ' + folder + ' into ' + repoName);
    });
  });

  // Action 2: copy entire folders into each destination repo —
  // optimize by cloning each repo only once and copying all listed folders into it.
  var repoFolderMap = {};
  shipFullFolder.forEach(function (cfg) {
    repoFolderMap[cfg.repo] = repoFolderMap[cfg.repo] || [];
    repoFolderMap[cfg.repo].push(cfg.folder);
  });

  Object.keys(repoFolderMap).forEach(function (repoName) {
    var folders = repoFolderMap[repoName];
    cloneAndPush(repoName, function (cloneDir) {
      folders.forEach(function (folder) {
        var sourceFolder = './' + folder;
        if (!fs.existsSync(sourceFolder)) {
          console.log('Source folder not found: ' + sourceFolder);
          return;
        }
        var parentFolder = folder.split('/')[0];
        var destFolder = path.join(cloneDir, parentFolder);
        if (fs.existsSync(destFolder)) shelljs.rm('-rf', destFolder);
        shelljs.mkdir('-p', destFolder);
        var items = fs.readdirSync(sourceFolder);
        items.forEach(function (item) {
	        var src = path.join(sourceFolder, item);
	        var dest = path.join(destFolder, item);
	        fs.copySync(src, dest, { overwrite: true });
      });
      console.log('Copied contents of ' + folder + ' into ' + repoName + '/' + parentFolder);
      });
    });
  });

  done();
});

gulp.task('publish-samples', gulp.series('ship-search-file', function (done) {
  var isDevelopment = process.env.githubSourceBranch === `development`;
  var platformName = `angular`
  var demoPath = isDevelopment ? `./development/${platformName}/demos` : `./hotfix/${process.env.githubSourceBranch.split(/hotfix\/|release\//)[1]}/${platformName}/demos`;
  shelljs.mkdir('-p', demoPath);
  var publishSamples = ["./output/**/*.*"];
  publishSamples.push('!' + demoPath + '/**', '!' + demoPath);
  var prefixName = demoPath.split('./')[1];
  if (/hotfix\/|release\/|development/.test(process.env.githubSourceBranch)) {
    var buildPublish = shelljs.exec('gulp publish-angular-sample');
  }
  gulp.src(publishSamples)
      .pipe(gzip({ append: false }))
      .pipe(gulp.dest(demoPath))
      .on('end', function () {
          publish(demoPath, false, prefixName, function(){
              done();
          });
      })
      .on('error', function (e) {
          done(e);
      });
}));

function publish(dirName, ispublic, prefixName, done, nogZip) {
  prefixName = prefixName.endsWith('/') ? prefixName : prefixName + '/';
  dirName = dirName.endsWith('/') ? dirName : dirName + '/';
  return gulp.src(dirName + '**', { buffer: false })
      .pipe(s3({
          Bucket: ispublic ? process.env.AWS_PUBLIC_BUCKET : process.env.AWS_STAGING_BUCKET,
          ACL: 'public-read',
          uploadNewFilesOnly: false,
          ContentEncoding: nogZip || 'gzip',
          keyTransform: function (relative_filename) {
              var new_name = prefixName + relative_filename;
              return new_name;
          }
      }, {
          maxRetries: 5,
          maxRedirects: 100,
          retryDelayOptions: {
              base: 1000
          }
      }))
      .on('end', function () {
          console.log('Published in CDN');
          done();
      })
      .on('error', function (e) {
          console.error('unable to sync: ', e.stack);
          done(e);
      });
}

gulp.task('ci-report', gulp.series(async function () {
  console.log('status', process.argv[4]);
  console.log('branch', process.env.githubSourceBranch);
  var data = {
    sampleBrowserName: "ej2-angular-samples",
    branchName: process.env.githubSourceBranch || 'development',
    jobLink: process.env.JOB_URL + process.env.BUILD_NUMBER,
    status: process.argv[4],
    lastRunTime: new Date().toString(),
    platform: "Angular"
  };
  console.log('Post data: ', data);
  try {
    const response = await fetch('https://sfblazor.azurewebsites.net/status/samplebrowsers/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      agent: httpsAgent
    });
    const responseData = await response.json();
    console.log('Posted Data: ', responseData);
  } catch (error) {
    console.error('Error in API post process: ', error);
  }
}));

// Generate search index using the component sample list files
gulp.task('search-index', gulp.series(function (done) {
  try {
    console.log('Parsing component sample list files...');
    // Get a list of files to process using glob.sync
    const files = glob.sync('./src/**/*.module.ts', {
      ignore: [
        './src/app/app.module.ts',
        './src/app/common/shared.module.ts'
      ]
    });
    // Create an instance of elasticlunr for indexing
    const instance = elasticlunr(function () {
      this.setRef('uid'); 
      this.addField('name'); 
      this.addField('path'); 
      this.addField('category'); 
      this.addField('component'); 
    });
    let componentCount = 0, sampleCount = 0;
    files.forEach(function (file) {
      console.log(file)
      // Parse the component sample list file and get the output
      const output = parseSamplelist(file);
      if (output) {
        // Iterate over each document in the output and add it to the search index instance
        output.forEach(e => {
          e.uid = sampleCount; 
          e.path = e.path.replace(':theme/', '');
          let compName = e.path.split('/')[0];
          // Generate the component name from the path
          e.component = compName.includes('-') 
            ? compName.split('-').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ') 
            : compName.charAt(0).toUpperCase() + compName.substring(1);
          instance.addDoc(e); 
          sampleCount++; 
        });
        componentCount++;
      }
    });
    // Write the search index to a JSON file
    fs.writeFileSync('./src/app/common/search-index.json', JSON.stringify(instance.toJSON()));
    console.log(`Total components: ${componentCount}\nTotal samples: ${sampleCount} \nSearch Index file is generated.`);
    done(); 
  } catch (error) {
    console.error('Error in search-index gulp task:', error);
    done(); 
  }
}));


/**
 * Parses a sample list file and extracts relevant content in a cleaned and formatted JSON.
 * @param {string} sample - The path of the sample list file to parse.
 * @returns {Array<object>} - The parsed and cleaned content as a JSON array. Returns null if the file content is invalid or an error occurs.
 */
function parseSamplelist(sample) {
  try {
    const startMarker = '= [', endMarker = '];';
    // Transpile the sample file using TypeScript compiler
    const outputText = ts.transpileModule(fs.readFileSync(sample, 'utf-8'), {
      compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS
      }
    }).outputText;
    // Find the indices of the start and end markers within the transpiled output
    const startIndex = outputText.indexOf(startMarker);
    const endIndex = outputText.indexOf(endMarker, startIndex);
    
    if (startIndex === -1 || endIndex === -1) {
      console.log(`Invalid file content: ${sample}`);
      return null;
    }
    // Extract the relevant content between the markers
    const inputFileContent = outputText.substring(startIndex + startMarker.length, endIndex);
    // Clean the content by removing unwanted elements and formatting it as a JSON array
    const cleanedContent = inputFileContent
      .split(',') // Split the content into an array based on commas
      .filter(item => !item.includes('component:')) // Remove items that contain the string 'component:'
      .map(item => item.trim()) // Trim whitespace from each item
      .join(',') // Join the items back into a string using commas
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Wrap keys in double quotes
      .replace(/(\/\/.*)|\/\*[\s\S]*?\*\//g, '') // Remove single-line and multi-line comments
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas before closing brackets or braces

    // Parse the cleaned content into a JSON array after removing trailing commas
    return JSON.parse(`[${cleanedContent}]`.replace(/,\s*([\]}])/g, '$1'));
  } catch (error) {
    console.log(`Error parsing sample: ${sample}`);
    return null;
  }
}

/**
 * To provide appropriate web-service-url
 */
gulp.task('webservice-url', function (done) {
  var branchName=  isReleaseBranch ? 'release' : isHotfixBranch ? 'hotfix' : isDevelopmentBranch ?  'development' : 'private';
  if(branchName === 'private')
  {
    console.log("Private Branch");
    return done();
  }
  var files, pattern, updatedURL;
  files=glob.sync('./src/app/**/*.ts');
  pattern = /https:\/\/(services|ej2services)\.syncfusion\.com\/angular\/production\//g;
  updatedURL = "https://ej2services.syncfusion.com/angular/" + branchName + "/"
  // for (let i = 0; i < files.length; i++) {
  //     let file = fs.readFileSync(files[i], 'utf8');
  //     fs.writeFileSync(files[i], file.replace(pattern, updatedURL), 'UTF8');
  // }
  console.log("URL changed and Returned Sucessfully");
  done();
})


gulp.task('build-service-url', function (done) {
  var webServiceRegex = /https:\/\/document\.syncfusion\.com\/web-services\/(docx-editor|pdf-viewer|spreadsheet-editor)/;
  var replaceRegex = /https:\/\/document\.syncfusion\.com\/web-services\/(docx-editor|pdf-viewer|spreadsheet-editor)/g;
  var patterns = ['./src/app/**/*.component.ts', './OpenNewSamples/**/*.js'];
  for (var pattern of patterns) {
    var replaceFiles = glob.sync(pattern);
    for (var replaceFile of replaceFiles) {
      var rFileContent = fs.readFileSync(replaceFile, 'utf8');
      if (webServiceRegex.test(rFileContent)) {
        var replacementUrl = '';
        if (/pdfviewer/i.test(replaceFile)) {
            replacementUrl = 'http://localhost:62527';
        } else if (/spreadsheet/i.test(replaceFile)) {
            replacementUrl = 'http://localhost:62528';
        } else if (/document-editor/i.test(replaceFile)) {
            replacementUrl = 'http://localhost:62529';
        }
        fs.writeFileSync(replaceFile, rFileContent.replace(replaceRegex, replacementUrl), 'utf8');
        console.log('Replaced document SDK services in --- ' + replaceFile + ' with ' + replacementUrl);
      }
    }
  }
  done();
});

gulp.task('restore-service-url', function (done) {
  var localhostUrls = [
    { port: '62527', component: 'pdfviewer', service: 'pdf-viewer' },
    { port: '62528', component: 'spreadsheet', service: 'spreadsheet-editor' },
    { port: '62529', component: 'document-editor', service: 'docx-editor' }
  ];
  var patterns = [];
  // Build patterns for root folders (only if they exist)
  if (fs.existsSync('./src/app')) {
    patterns.push('./src/app/**/*.component.ts');
  }
  if (fs.existsSync('./OpenNewSamples')) {
    patterns.push('./OpenNewSamples/**/*.js');
  }
  if (fs.existsSync('./output')) {
    patterns.push('./output/**/*.component.ts');
    patterns.push('./output/**/*.js');
  }
 
  for (var pattern of patterns) {
    var replaceFiles = glob.sync(pattern);
    for (var replaceFile of replaceFiles) {
      var rFileContent = fs.readFileSync(replaceFile, 'utf8');
      for (var i = 0; i < localhostUrls.length; i++) {
        var localUrl = 'http://localhost:' + localhostUrls[i].port;
        var serviceUrl = 'https://document.syncfusion.com/web-services/' + localhostUrls[i].service;
        if (rFileContent.includes(localUrl)) {
          var regex = new RegExp(localUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          fs.writeFileSync(replaceFile, rFileContent.replace(regex, serviceUrl), 'utf8');
          console.log('Restored ' + localhostUrls[i].component + ' service URL in --- ' + replaceFile + ' to ' + serviceUrl);
          break;
        }
      }
    }
  }
  done();
});
/**
 * Task to ship Pdfium and wasm file
 */
gulp.task('pdfium-wasm', function (done) {
   const sourcePath = './node_modules/@syncfusion/ej2-pdfviewer/dist/ej2-pdfviewer-lib';
   const destinationPath = './src/assets';
   shelljs.cp('-R', sourcePath, destinationPath);
   console.log("File moved to Destination")
   done();
})
 
const componentMapping = {
    'EJ2_PDF_SDK': 'pdfviewer',
    'EJ2_EXCEL_SDK': 'spreadsheet',
    'EJ2_DOCUMENT_SDK': 'document-editor',
    'EJ2_PDF_LIBRARY': 'pdf'
};

const componentDisplayNames = {
    'pdfviewer': 'PDF Viewer SDK',
    'spreadsheet': 'Spreadsheet Editor SDK',
    'document-editor': 'DOCX Editor SDK',
    'pdf': 'PDF Library'
};

const defaultSamples = {
    'pdfviewer': 'default',
    'spreadsheet': 'default',
    'document-editor': 'default',
    'pdf': 'default'
};

gulp.task('document-build', function(done) {
    Object.keys(componentMapping).forEach(targetDir => {
        shelljs.cd(targetDir);
        console.log('Entered into path: ', process.cwd());
        shelljs.exec('npm run build');
        shelljs.cd('../');
    })
    done();
});

gulp.task('document-es-build', function(done) {
    Object.keys(componentMapping).forEach(targetDir => {
        shelljs.cd(targetDir);
        console.log('Entered into path: ', process.cwd());
        shelljs.exec('npm run es-build');
        shelljs.cd('../');
    })
    done();
});

gulp.task('document-split', function(done) {

    Object.keys(componentMapping).forEach(targetDir => {
        if (!fs.existsSync(targetDir)) {
            shelljs.mkdir('-p', targetDir);
        }
        
        shelljs.ls('-A', '.').forEach(item => {
            if (!Object.keys(componentMapping).includes(item) && item !== 'node_modules' && item !== 'package-lock.json') {
                if (fs.existsSync(item)) {
                    shelljs.cp('-r', item, `${targetDir}/`);
                }
            }
        });
        
        const componentName = componentMapping[targetDir];
        if (fs.existsSync(`${targetDir}/OpenNewSamples`)) {
            shelljs.ls(`${targetDir}/OpenNewSamples`).forEach(folder => {
                if (folder !== componentName && fs.statSync(`${targetDir}/OpenNewSamples/${folder}`).isDirectory()) {
                    shelljs.rm('-rf', `${targetDir}/OpenNewSamples/${folder}`);
                }
            });
        }
        
        if (fs.existsSync(`${targetDir}/src/app`)) {
            shelljs.ls(`${targetDir}/src/app`).forEach(folder => {
                if (folder !== componentName &&  folder !== 'common' && folder !== 'images' && fs.statSync(`${targetDir}/src/app/${folder}`).isDirectory()) {
                    shelljs.rm('-rf', `${targetDir}/src/app/${folder}`);
                }
            });
        }
          console.log(process.cwd());
        const angluarsampleList = `${targetDir}/src/app/common/samplelist.ts`;
        if (fs.existsSync(angluarsampleList)) {
            var angcontent = '';
            angcontent = configSample.build[componentName][0].SampleorderJSON;
            fs.writeFileSync(angluarsampleList, angcontent, 'utf8');
            console.log(`sampleorder.json updated in ${angluarsampleList}`);
        }
        const angluarRouteList = `${targetDir}/src/app/common/sb.router.ts`;
        if (fs.existsSync(angluarRouteList)) {
            var angroute = '';
            angroute = configSample.build[componentName][0].SBRouteJSON;
            fs.writeFileSync(angluarRouteList, angroute, 'utf8');
            console.log(`sampleorder.json updated in ${angluarRouteList}`);
        }
        
        const indexTsPath = `${targetDir}/src/common/index.ts`;
        if (fs.existsSync(indexTsPath)) {
            let indexContent = fs.readFileSync(indexTsPath, 'utf8');
            indexContent = indexContent.replace(/\{\{:component\}\}/g, componentName)
                            .replace(/\{\{:sample\}\}/g, defaultSamples[componentName]);
            fs.writeFileSync(indexTsPath, indexContent, 'utf8');
            console.log(`Updated routing in ${indexTsPath}`);
        } else {
            console.log(`Warning: index.ts not found at ${indexTsPath}`);
        }

        const indexHtmlPath = `${targetDir}/src/index.html`;
        if (fs.existsSync(indexHtmlPath)) {
            let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
            htmlContent = htmlContent.replace(/\{\{:component\}\}/g, componentDisplayNames[componentName]);
            fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
            console.log(`Updated component name in ${indexHtmlPath}`);
        } else {
            console.log(`Warning: index.html not found at ${indexHtmlPath}`);
        }
        

        shelljs.cd(targetDir);
        console.log('Entered into path: ', process.cwd());
        shelljs.exec('npm install');
        shelljs.cd('../');
    });
    

    done();
});

/**
 * Task for publishing Document SDK samples to S3
 */
const componentMappingLink = {
    'EJ2_PDF_SDK': 'pdfviewer-editor',
    'EJ2_EXCEL_SDK': 'spreadsheet-editor',
    'EJ2_DOCUMENT_SDK': 'document-editor',
    'EJ2_PDF_LIBRARY': 'pdf'
};
gulp.task('publish-document-samples', function (done) {
    if (!(isHotfixBranch || isReleaseBranch || isDevelopmentBranch)) {
      console.log('Skipping publishing.');
      return done();
    }
   // SDK folders to publish
    var sdkFolders = ['EJ2_PDF_SDK', 'EJ2_DOCUMENT_SDK', 'EJ2_EXCEL_SDK', 'EJ2_PDF_LIBRARY'];
    var processedFolders = 0;
     let basePath = `./angular/development/demos`;
    if (/^(hotfix\/|release\/)/.test(process.env.githubSourceBranch)) {
        const branchName = process.env.githubSourceBranch.split(/hotfix\/|release\//)[1];
        basePath = `./angular/hotfix/${branchName}/demos`;
    }
    
    // Process each SDK folder.
    sdkFolders.forEach(function(folder) {
        // Create destination path
        var destPath = basePath + '/' + componentMappingLink[folder];
        shelljs.mkdir('-p', destPath);
        
        console.log('Publishing ' + folder + ' to ' + destPath);
        
        // Files to publish - everything in the SDK folder
        var filesToPublish = [
            './' + folder + '/output/**/*' 
        ];
        
        // Use gulp to compress and publish
        gulp.src(filesToPublish, { base: './' + folder + '/output', dot: true })
            .pipe(gzip({ append: false }))
            .pipe(gulp.dest(destPath))
            .on('end', function() {
                var prefixName = destPath.split('./')[1];
                
                // Use cdn.publish to upload to S3
                publish(destPath, false, prefixName, function() {
                    processedFolders++;
                    console.log(folder + ' publishing complete.');
                    
                    // When all folders are processed, mark the task as done
                    if (processedFolders === sdkFolders.length) {
                        console.log('All SDK folders published successfully.');
                        done();
                    }
                });
            })
            .on('error', function(error) {
                console.error('Error publishing ' + folder + ':', error);
                done(error);
            });
    });
});


//gulp.task('github-publish', function(done) { new GitHubPublish().publish(done); });
