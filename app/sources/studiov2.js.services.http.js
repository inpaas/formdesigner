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

    function getEntities(idModule) {
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/'
                  .concat(idModule)
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

    function getForm(id) {
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/5/forms-v2/'.concat(id);

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