/*globals moment angular jQuery*/
(function() {
    var dependencies = [
      'ui.mask', 'ui.bootstrap', 'ngTable', 'ui-notification', 'ngFileUpload', 'ui.router',
      'angular-clipboard', 'ngSanitize', 'Localization', angularDragula(angular)
    ];

    angular
      .module('studio-v2', dependencies)
      .config(config)
      .run(run);

      function config(NotificationProvider, $stateProvider, $urlRouterProvider, $interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');

        $stateProvider
          .state('forms', {
              'url': '/forms',
              'templateUrl': '/forms/studiov2.forms.form-list'
          })
          .state('form-edit', {
              'url': '/form-edit',
              'controller': 'FormEditController',
              'controllerAs': 'ctrl',
              'templateUrl': '/forms/studiov2.forms.form-edit'
          })
          .state('formId', {
                'url': '/form-edit/:id',
                'controller': 'FormEditController',
                'controllerAs': 'ctrl',
                'templateUrl': '/forms/studiov2.forms.form-edit'
          });
          
        
        $urlRouterProvider.otherwise('/forms');

        // $locationProvider.html5Mode(true);
        
        NotificationProvider.setOptions({
          delay: 4000,
          startTop: 20,
          startRight: 10,
          verticalSpacing: 20,
          horizontalSpacing: 20,
          positionX: 'right',
          positionY: 'top'
        });
      }

      function run($locale, $filter) {
        $locale.NUMBER_FORMATS.DECIMAL_SEP = $filter('translate')('fieldformat.numeral.decimal_separator');
        $locale.NUMBER_FORMATS.GROUP_SEP = $filter('translate')('fieldformat.numeral.grouping_separator');
        $locale.NUMBER_FORMATS.CURRENCY_SYM = $filter('translate')('fieldformat.currency.symbol'); 
      }
})();