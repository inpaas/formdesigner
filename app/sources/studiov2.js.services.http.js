(function() {
  angular
    .module('studio-v2')
    .service('httpService', httpService);
  
  httpService.$inject = ['$q', '$http'];
  
  function httpService($q, $http){

    function getModule(id){
      var url = '/api/studio/modules/'.concat(id); 

      return $http({
        method: 'get',
        url: url
      });
    }

    function getApps() {
      var url = '/api/studio/apps'; 

      return $http({
        method: 'get',
        url: url
      });
    }

    function getEntities(idModule) {
      var url = '/api/studio/modules/'
                  .concat(idModule)
                  .concat('/entities');

      return $http({
        method: 'get',
        url: url
      });
    }

    function getFieldsByEntity(id) {
      var url = '/api/studio/entities/'.concat(id);

      return $http({
        method: 'get',
        url: url
      });
    }

    function getForm(id) {
      var url = '/api/studio/modules/5/forms-v2/'.concat(id);

      return $http({
        method: 'get',
        url: url
      });
    }

    function saveNewForm(form, idModule) {
      var url = '/api/studio/modules/'
            .concat(idModule)
            .concat('/forms-v2')

      return $http({
        method: 'post',
        url: url,
        data: {
          name: form.label,
          key: form.key
        }
      }).then(function(response){
        console.log('savenew', response);
        return saveEditForm(form, response.data.id, idModule);
      });
    }

    function saveEditForm(form, idForm, idModule) {
      var url = '/api/studio/modules/'
            .concat(idModule)
            .concat('/forms-v2/')
            .concat(idForm);

      return $http({
        method: 'put',
        url: url,
        data: {
          template: '',
          allowAnon: false,
          key: form.key,
          json: JSON.stringify(form)
        }
      });
    }

    function generateForm(entityId) {
      var url = '/api/generateCrudV2/'.concat(entityId);

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
      getForm: getForm,
      saveEditForm: saveEditForm,
      saveNewForm: saveNewForm,
      generateForm: generateForm
    }
  }

})();