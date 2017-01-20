(function() {
  angular
    .module('studio-v2')
    .service('httpService', httpService);
  
  httpService.$inject = ['$q', '$http'];
  
  function httpService($q, $http){

    function getModule(id){
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/'.concat(id); 

      return $http({
        method: 'get',
        url: url
      });
    }

    function getApps() {
      var url = 'https://studio-v2.inpaas.com/api/studio/apps'; 

      return $http({
        method: 'get',
        url: url
      });
    }

    function getEntities(id) {
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/'
                  .concat(id)
                  .concat('/entities');

      return $http({
        method: 'get',
        url: url
      });
    }

    function getFieldsByEntity(id) {
      var url = 'https://studio-v2.inpaas.com/api/studio/entities/'.concat(id);

      return $http({
        method: 'get',
        url: url
      });
    }

    function getForm(name) {
      var url = 'https://studio-v2.inpaas.com/api/forms-v2/'.concat(name);

      return $http({
        method: 'get',
        url: url
      });
    }

    return {
      getModule: getModule,
      getApps: getApps,
      getEntities: getEntities,
      getFieldsByEntity: getFieldsByEntity,
      getForm: getForm
    }
  }

})();