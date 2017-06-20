(function() {
  angular
    .module('studio-v2')
    .service('httpService', httpService);
  
  httpService.$inject = ['$q', '$http', 'jsonFormService', 'labelsService'];
  
  function httpService($q, $http, jsonFormService, labelsService){

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

    function getForm(id, idModule){
      var url = '/api/studio/modules/'
                  .concat(idModule)
                  .concat('/forms-v2/')
                  .concat(id);

      return $http({
        method: 'get',
        url: url
      }).then(function(response){
          var form = {};

          if (response.data.json) {
            form = JSON.parse(response.data.json);
            form.moduleId = response.data.moduleId;
            form.id = id;
            return form;

          }else{
            form.key = response.data.key;
            form.label = response.data.label;
            form.moduleId = response.data.moduleId;
            form.id = response.data.id;

            return jsonFormService.getFormTemplate().then(function(template){
                    angular.extend(template, form);
                    return template;
                  });
          }
      });
    }

    function getMasterForm(id, idModule) {
      return getForm(id, idModule).then(function(form){
        jsonFormService.setJsonForm(form);
        labelsService.translateLabels(form);

        return form;
      }).then(function(form){
        return getFormInclude(form, idModule).then(function(response){
          return form
        });
      });
    }

    function getFormInclude(form, idModule){
      var defer = $q.all,
          promises = []; 

      form.fields.forEach(function(field){
        if (field.meta.type == 'include') {
          var thenFn = callback.bind(null, field),
              promise = getForm(field.include.idForm, idModule).then(thenFn);

          promises.push(promise); 
        }
      });

      return defer(promises);

      function callback(field, form){
        field.fields = form.fields; 
      }
    }

    function saveNewForm(form, idModule) {
      var url = '/api/studio/modules/'
            .concat(idModule)
            .concat('/forms-v2');

      // Atualmente, a api do módulo salva somente um form novo com a key o name, depois é que podemos 
      // salvar o form inteiro
      // TODO: adaptar a api para salvar o form novo de uma vez
      return $http({
        method: 'post',
        url: url,
        data: {
          name: form.label,
          key: form.key,
          moduleId: idModule
        }
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
          allowAnon: false,
          key: form.key,
          name: form.label,
          json: JSON.stringify(form),
          template: form.template,
          moduleId: idModule
        }
      });
    }

    function generateForm(entityId) {
      var url = '/api/generateCrudV2/'.concat(entityId);

      return $http({
        method: 'get',
        url: url
      }).then(function(response){
        var form = angular.copy(response.data);

        jsonFormService.setJsonForm(form);
        form = labelsService.translateLabels(form);

        return form;
      });
    }

    function getPermissions(moduleId) {
      var url = '/api/iam/permissions';

      return $http({
        method: 'get',
        url: url,
        params: {
          module: moduleId
        }
      });
    }
    
    function getFormats(){
      var url = '/api/studio/formats';

      return $http({
        method: 'get',
        url: url
      });
    } 

    function deleteForm(id, idModule){
      var url = '/api/studio/modules/'
                  .concat(idModule)
                  .concat('/forms-v2/')
                  .concat(id);

      return $http({
        method: 'delete',
        url: url,
        data: {
          id: parseInt(id), 
          moduleId: idModule
        }
      });
    }

    function getFinders(entityName){
      var url = '/api/entity/'
                  .concat(entityName)
                  .concat('/finders');

      return $http({
        method: 'get',
        url: url
      });
    }

    function getFinder(entityName, name){
      var url = '/api/entity/' 
                  .concat(entityName)
                  .concat('/finders/')
                  .concat(name);

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
      generateForm: generateForm,
      getPermissions: getPermissions,
      getFormats: getFormats,
      deleteForm: deleteForm,
      getMasterForm: getMasterForm,
      getFinders: getFinders,
      getFinder: getFinder
    }
  }

})();