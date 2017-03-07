(function(){
  angular
    .module('studio-v2')
    .service('labelsService', labelsService);

  labelsService.$inject = ['$http', '$filter', '$l10n'];

  function labelsService($http, $filter, $l10n){
    var _userLocale = getLanguageUser(),
        labelsNamespace = "labels.{{module}}.forms.{{form}}."; 
        labels = [];

    function saveLabel(text, key, idModule){
      var url = '/api/studio/modules/'.concat(idModule).concat('/labels'), 
          data = {
            "key": key,
            "text": text,
            "translations": {}
          };

      data.translations[_userLocale] = text;

      return $http({
          url: url,
          method: 'post',
          data: data
        }).then(function(response){
          labels.push(data);
          $l10n.setNewLabel(key, text);
        });
    }

    function generateKey(name){
      return labelsNamespace.concat(name);
    }

    function getLanguageUser(){
      return $filter('translate')('label.locale'); 
    }

    function setLabelsNamespace(moduleKey, formKey) {
      labelsNamespace = labelsNamespace
                          .replace('{{module}}', moduleKey)
                          .replace('{{form}}', formKey);

    }

    function getLabelsNamespace(){
      return labelsNamespace;
    }

    function getLabelsByModule(moduleId){
      return $http({
        url: url,
        method: 'get'
      }).then(function(response){
        labels = reponse.data.data;
      });
    }

    function buildLabels(jsonForm, moduleId, moduleKey){
      setLabelsNamespace(moduleKey, jsonForm.key);
      buildLabelsFromTitle(jsonForm, moduleId);
      buildLabelsFromBreadcrumb(jsonForm.views.list.breadcrumb);
      buildLabelsFromBreadcrumb(jsonForm.views.edit.breadcrumb);
      buildLabelsFromActions(jsonForm.views.list.actions);
      buildLabelsFromActions(jsonForm.views.edit.actions);
      buildLabelsFromFields(jsonForm.fields);
    }

    function buildLabelsFromTitle(jsonForm, moduleId){
      var key = generateKey('title');

      saveLabel(jsonForm.label, key, moduleId);
      jsonForm.label = key;
    }

    function buildLabelsFromBreadcrumb(breadcrumb, moduleId){
      breadcrumb.forEach(function(item, index){
        if(item.label){
           
        } 
      });
    }

    function buildLabelsFromActions(actions){

    }

    function buildLabelsFromFields(fields){

    }

    return{
      getLabelsNamespace: getLabelsNamespace,
      setLabelsNamespace: setLabelsNamespace,
      buildLabels: buildLabels,
      saveLabel: saveLabel,
      buildLabelsFromTitle: buildLabelsFromTitle
    }
  }

})();