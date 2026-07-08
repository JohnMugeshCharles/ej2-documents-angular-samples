// 'use strict';

// const fs = require('fs-extra');
// const path = require('path');
// const shell = require('shelljs');

// // Folders to ignore during publishing
// const IGNORE_FOLDERS = [
//     '.gitlap',
//     '.vscode',
//     'OpenNewSamples',
//     'node_modules',
//     'github'          // local clone workspace – must never be copied into itself
// ];

// // Files to ignore during publishing
// const IGNORE_FILES = [
//     '.npmrc',
//     'build-config.json',
//     'Jenkinsfile'
// ];

// class GitHubPublish {

//     constructor() {
//         // Derive repo name from package.json
//         const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
//         // Strip @scope/ prefix if present (e.g. "@syncfusion/ej2-documents-angular-samples" -> "ej2-documents-angular-samples")
//         this.repoName = packageJson.name.replace(/^@[^/]+\//, '');
//         //this.githubBaseUrl = 'https://github.com/syncfusion/';
//         this.githubBaseUrl = 'https://github.com/JohnMugeshCharles/';
//         this.branch = 'main';
//         this.localClonePath = './github/' + this.repoName;
//         return this;
//     }

//     /**
//      * Main entry point – clones the public GitHub repo, copies files from
//      * the current Gitea workspace (excluding ignored items) and force-pushes
//      * to the master branch.
//      */
//     publish(done) {
//         console.log('\n========================================');
//         console.log(' GitHub Publish – ' + this.repoName);
//         console.log('========================================\n');

//         // ── 0. Gate: only ship when the Gitea source branch is 'development' ─
//         var giteaBranch = process.env.githubSourceBranch || 'development';
//         if (giteaBranch !== 'development') {
//             console.log('[INFO] Gitea branch is "' + (giteaBranch || '<not set>') + '". Shipping to GitHub is only performed on the "development" branch. Skipping.');
//             if (done) done();
//             return;
//         }
//         console.log('[INFO] Gitea branch is "development". Proceeding with GitHub publish...');

//         // const GITHUB_USER  = process.env.GITHUB_USER;
//         // const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
//         if (!GITHUB_USER || !GITHUB_TOKEN) {
//             console.error('[ERROR] Environment variables GITHUB_USER and GITHUB_TOKEN must be set.');
//             if (done) done(new Error('Missing GitHub credentials'));
//             return;
//         }

//         // const gitUrl = 'https://' + GITHUB_USER + ':' + GITHUB_TOKEN +
//         //                '@github.com/syncfusion/' + this.repoName + '.git';
//         const gitUrl = 'https://' + GITHUB_USER + ':' + GITHUB_TOKEN +'@github.com/JohnMugeshCharles/' + this.repoName + '.git';

//         // ── 1. Prepare local clone directory ────────────────────────────────
//         if (fs.existsSync(this.localClonePath)) {
//             console.log('[INFO] Removing existing local clone at ' + this.localClonePath);
//             shell.rm('-rf', this.localClonePath);
//         }
//         fs.mkdirpSync(this.localClonePath);

//         // ── 2. Clone the public GitHub repo ─────────────────────────────────
//         console.log('[INFO] Cloning ' + this.githubBaseUrl + this.repoName + '.git ...');
//         var cloneResult = shell.exec(
//             'git clone -b ' + this.branch + ' ' + gitUrl + ' ' + this.localClonePath,
//             { silent: false }
//         );
//         if (cloneResult.code !== 0) {
//             // Repo may be empty/brand-new – init it instead of aborting
//             console.log('[WARN] Clone failed (repo may be empty). Initialising a fresh git repo.');
//             shell.cd(this.localClonePath);
//             shell.exec('git init');
//             shell.exec('git remote add origin ' + gitUrl);
//             shell.cd('../../');
//         }

//         // ── 3. Wipe clone content (keep .git) so only Gitea files are published ─
//         console.log('[INFO] Cleaning clone directory (preserving .git) ...');
//         var cloneAbsPath = path.resolve(this.localClonePath);
//         fs.readdirSync(cloneAbsPath).forEach(function (entry) {
//             if (entry === '.git') return;           // never delete the git metadata
//             var entryPath = path.join(cloneAbsPath, entry);
//             fs.removeSync(entryPath);
//         });

//         // ── 4. Copy workspace files to the clone, respecting ignore list ─────
//         console.log('[INFO] Copying files from workspace...');
//         console.log('       Ignoring folders : ' + IGNORE_FOLDERS.join(', '));
//         console.log('       Ignoring files   : ' + IGNORE_FILES.join(', '));
//         this._copyWorkspaceFiles('./', this.localClonePath);

//         // ── 5. Commit and push ───────────────────────────────────────────────
//         const releaseVersion = process.env.RELEASE_VERSION || this._getVersionFromPackageJson();
//         const commitMessage  = '"Publish v' + releaseVersion + '"';

//         shell.cd(this.localClonePath);
//         shell.exec('git add .');
//         shell.exec('git commit -m ' + commitMessage + ' --no-verify');
//         shell.exec(
//             'git push -f --set-upstream origin ' + this.branch + ' --no-verify',
//             { silent: false }
//         );
//         shell.cd('../../');

//         // ── 6. Clean up – remove the local github clone folder ───────────────
//         console.log('[INFO] Cleaning up local clone at ./github/ ...');
//         shell.rm('-rf', './github/');

//         console.log('\n[SUCCESS] ' + this.repoName + ' published to GitHub successfully.\n');

//         if (done) done();
//     }

//     /**
//      * Recursively copy/overwrite files/folders from `src` to `dest`,
//      * skipping entries in IGNORE_FOLDERS / IGNORE_FILES.
//      * Existing files in dest that are not present in src are left untouched.
//      */
//     _copyWorkspaceFiles(src, dest) {
//         fs.readdirSync(src).forEach(function (entry) {
//             var srcEntry  = path.join(src, entry);
//             var destEntry = path.join(dest, entry);
//             var stat      = fs.statSync(srcEntry);

//             if (stat.isDirectory()) {
//                 // Skip ignored folders
//                 if (IGNORE_FOLDERS.indexOf(entry) !== -1) {
//                     console.log('[SKIP FOLDER] ' + srcEntry);
//                     return;
//                 }

//                 // Skip the destination folder itself to avoid infinite recursion
//                 var resolvedSrc  = path.resolve(srcEntry);
//                 var resolvedDest = path.resolve(dest);
//                 if (resolvedSrc === resolvedDest) return;

//                 fs.mkdirpSync(destEntry);
//                 // Recurse but apply the same ignore filter at every level
//                 this._copyWorkspaceFiles(srcEntry, destEntry);
//             } else {
//                 // Skip ignored files
//                 if (IGNORE_FILES.indexOf(entry) !== -1) {
//                     console.log('[SKIP FILE]   ' + srcEntry);
//                     return;
//                 }

//                 fs.copySync(srcEntry, destEntry);
//             }
//         }.bind(this));
//     }

//     /**
//      * Read the version from package.json as a fallback.
//      */
//     _getVersionFromPackageJson() {
//         try {
//             var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
//             return pkg.version || '1.0.0';
//         } catch (e) {
//             return '1.0.0';
//         }
//     }
// }

// module.exports = GitHubPublish;


// // ── CLI usage ──────────────────────────────────────────────────────────────
// // Run directly:  node github-publish.js
// // Or integrate into gulpfile.js:
// //   const GitHubPublish = require('./github-publish');
// //   gulp.task('github-publish', function(done) { new GitHubPublish().publish(done); });
// // ──────────────────────────────────────────────────────────────────────────
// if (require.main === module) {
//     new GitHubPublish().publish(function (err) {
//         if (err) { console.error(err); process.exit(1); }
//     });
// }
var fs = require('fs-extra');
var glob = require('glob');
var gulp = require("gulp");
var shelljs = global.shelljs = global.shelljs || require('shelljs');
var configSample = require('./build-config.json');
const exec = require('child_process').exec;
const gzip = require('gulp-gzip');
const https = require('https');
const fetch = require('node-fetch');
const elasticlunr = require('elasticlunr');
const ts = require('typescript');
const path = require('path');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
var isDevelopmentBranch = true;
//var isDevelopmentBranch = /development/g.test(process.env.githubSourceBranch);
 var isReleaseBranch = /^(release\/)/g.test(process.env.githubSourceBranch);
 var isHotfixBranch = /^(hotfix\/)/g.test(process.env.githubSourceBranch);

gulp.task('github-publish', function (done) {
    if (!(isHotfixBranch || isReleaseBranch || isDevelopmentBranch)) {
        console.log('Skipping publishing in build repos.');
        return done();
    }

   //var sourceBranch = /hotfix\//.test(process.env.githubSourceBranch) ? 'Hotfix' : /release\//.test(process.env.githubSourceBranch) ? 'Release' : 'development';
  var sourceBranch = 'main';
  var user = process.env.GITHUB_USER;
  var token = process.env.GITHUB_TOKEN;

  const IGNORE_FOLDERS = ['.gitlap','.vscode','OpenNewSamples','node_modules','.git'];
  const IGNORE_FILES = ['.npmrc','build-config.json','Jenkinsfile','package-lock.json'];

    var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    var repoName = packageJson.name ? packageJson.name.replace(/^@[^/]+\//, '') : '';

    if (!repoName) {
        console.log('Repository name not found in package.json.');
        return done();
    }

    const sourceRoot = process.cwd();
    console.log('Publishing repository: ' + repoName);
    console.log('Source root: ' + sourceRoot);
    function cloneAndPush(repoName, workFn) {

        var cloneDir = path.join(sourceRoot, repoName + '_publish');

        if (fs.existsSync(cloneDir)) {
            shelljs.rm('-rf', cloneDir);
        }

        var gitPath = 'https://' + user + ':' + token + '@github.com/JohnMugeshCharles/' + repoName + '.git';
        var clone = shelljs.exec('git clone -b ' + sourceBranch + ' "' + gitPath + '" "' + cloneDir +'"', { silent: false } );
        if (clone.code !== 0) {
            console.log('Clone failed for ' + repoName);
            return;
        }
        try {

            workFn(cloneDir);
            shelljs.cd(cloneDir);
            console.log('Current branch:');
            shelljs.exec('git branch --show-current');
            shelljs.exec('git remote -v');
            shelljs.exec('git config user.email "buildautomation@syncfusion.com"');
            shelljs.exec('git config user.name "SyncfusionAutomation"');
            var status = shelljs.exec('git status --porcelain',{ silent: true }).stdout;

            if (status && status.trim().length > 0) {
                shelljs.exec('git add -A');
                shelljs.exec('git commit -m "Updated sample browser changes" || true');

                var pushed = false;
                for (var attempt = 1; attempt <= 3; attempt++) {

                    console.log('Pushing attempt ' +attempt +' to GitHub repository ' +repoName);

                    var pushResult = shelljs.exec(
                        'git push origin ' + sourceBranch
                    );

                    if (pushResult.code === 0) {
                        console.log('Successfully pushed to ' + repoName);
                        pushed = true;
                        break;
                    }

                    console.log(
                        'Push attempt failed:\n' + pushResult.stderr
                    );
                }

                if (!pushed) {
                    console.log('Failed to push after 3 attempts.');
                }

            } else {
                console.log('No changes detected.');
            }

        } catch (err) {
            console.error('Error processing ' +repoName +': ' +(err && err.message ? err.message : err));

        } finally {

            shelljs.cd(sourceRoot);
            if (fs.existsSync(cloneDir)) {
                shelljs.rm('-rf', cloneDir);
            }
        }
    }

    cloneAndPush(repoName, function (cloneDir) {

        fs.readdirSync(cloneDir).forEach(function (item) {

            if (item !== '.git') {
                shelljs.rm('-rf', path.join(cloneDir, item));
            }
        });

        fs.readdirSync(sourceRoot).forEach(function (item) {

            if (IGNORE_FOLDERS.indexOf(item) !== -1) {
                return;
            }

            if (IGNORE_FILES.indexOf(item) !== -1) {
                return;
            }

            if (item === path.basename(cloneDir)) {
                return;
            }

            var src = path.join(sourceRoot, item);
            var dest = path.join(cloneDir, item);

            fs.copySync(src, dest, {
                overwrite: true
            });
        });

        console.log(
            'Copied repository contents excluding ignored files/folders.'
        );
    });

    done();
});