(function() {
  angular
    .module('studio-v2')
    .service('httpService', httpService);
  
  httpService.$inject = ['$q', '$http'];
  
  function httpService($q, $http){

    function getModule(id){
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/'; 

      return $http({
        method: 'get',
        url: url.concat(id)
      });
    }

    function getModules() {
      var url = 'https://studio-v2.inpaas.com/api/studio/modules'; 

      return $http({
        method: 'get',
        url: url
      });
    }

    function getEntities() {
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/5/entities';

      return $http({
        method: 'get',
        url: url
      });
    }

    function getFieldsEntity(id) {
      var url = 'https://studio-v2.inpaas.com/api/studio/entities/69';

      return $http({
        method: 'get',
        url: url
      });
    }

    return {
      getModule: getModule,
      getEntities: getEntities,
      getFieldsEntity: getFieldsEntity
    }
  }

})();