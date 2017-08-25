// Karma configuration
// Generated on Thu Aug 10 2017 10:47:17 GMT-0300 (Hora oficial do Brasil)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
    // libs
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/angular/angular.js',
    'assets/js/l10n.js',
    'assets/js/helpers.js',
    'node_modules/angular-sanitize/angular-sanitize.js',
    'node_modules/@uirouter/angularjs/release/angular-ui-router.js',
    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    'node_modules/angular-ui-notification/dist/angular-ui-notification.js', 
    'node_modules/angular-ui-mask/dist/mask.min.js', 
    'node_modules/angular-dragula/dist/angular-dragula.js',
    'node_modules/angular-clipboard/angular-clipboard.js', 
    'node_modules/moment/moment.js',
    'node_modules/angular-mock/angular.mocks.js',

    //app
    'app/**/*.js',

    //spec
    'tests/**/*.spec.js'
    ],


    // list of files to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'app/**/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'coverage'],

    // optionally, configure the reporter 
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1
  })
}
