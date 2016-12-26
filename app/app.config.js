(function() {
    var dependencies = [
      'ui.mask', 'ui.bootstrap', 'ngTable', 'ui-notification', 'ngFileUpload', 'ui.router',
      'angular-clipboard', 'ngSanitize', 'ngMessages', 'Localization', 'rw.moneymask'
    ];

    angular
      .module('formdesigner', dependencies)
      .config(config);

      function config(NotificationProvider, $stateProvider, $urlRouterProvider, $locationProvider, $interpolateProvider) {

        $stateProvider
          .state('forms', {
              'url': '/forms',
              'templateUrl': 'form-list/templates/listForms.html',
              'controller': 'ListFormsController',
              'controllerAs': 'vm'
          })
          .state('form-edit', {
              'url': '/form',
              'templateUrl': 'form-edit/templates/formTemplate.html', 
              'controller': 'FormEditController',
              'controllerAs': 'vm'
          })
          .state('formId', {
                'url': '/form-edit/:id',
                'templateUrl': 'form-edit/templates/formTemplate.html',
                'controller': 'FormEditController',
                'controllerAs': 'vm'
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
})();