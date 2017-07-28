/*globals moment angular jQuery*/
(function() {
    var dependencies = [
      'ui.bootstrap', 'ui-notification', 'ngSanitize', 'Localization', angularDragula(angular), 'ui.router'
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
          'controller': 'FormEditController',
          'controllerAs': 'ctrl',
          'templateUrl': '/forms/studiov2.forms.dashboard'
        })
        .state('forms.new-view-edit', {
          'url': '/new/view-edit',
          'views':{
            'sidebar': {
              'templateUrl': '/forms/studiov2.forms.sidebar.edit'
            },
            'view': { 
              'templateUrl': '/forms/studiov2.forms.view.edit'
            }
          }
        })
        .state('forms.new-view-list', {
          'url': '/new/view-list',
          'views':{
            'sidebar': {
              'templateUrl': '/forms/studiov2.forms.sidebar.edit'
            },
            'view': {
              'templateUrl': '/forms/studiov2.forms.view.list'
            }
          }
        })
        .state('forms.edit-view-edit', {
          'url': '/:id/view-edit',
          'views':{
            'sidebar': {
              'templateUrl': '/forms/studiov2.forms.sidebar.edit'
            },
            'view': {
              'templateUrl': '/forms/studiov2.forms.view.edit'
            }
          }
        })
        .state('forms.edit-view-list', {
          'url': '/:id/view-list',
          'views':{
            'sidebar': {
              'templateUrl': '/forms/studiov2.forms.sidebar.edit'
            },
            'view': {
              'templateUrl': '/forms/studiov2.forms.view.list'
            }
          }
        });


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