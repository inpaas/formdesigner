(function(){
  angular
    .module('studio-v2')
    .service('labelsService', labelsService);

  labelsService.$inject = ['$http', '$filter', '$l10n', '$q', 'jsonFormService'];

  function labelsService($http, $filter, $l10n, $q, jsonFormService){
    var _userLocale = getLanguageUser(),
        labelsNamespace = ""; 
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
        });
    }

    function generateKey(name){
      return labelsNamespace.concat(name);
    }

    function getLanguageUser(){
      return $filter('translate')('label.locale'); 
    }

    function setLabelsNamespace(moduleKey, formKey) {
      var template = "labels.forms.{{form}}.";
      labelsNamespace = labelsNamespace || template.replace('{{module}}', moduleKey).replace('{{form}}', formKey);
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

      var deferred = $q.defer();

      buildLabelsFromTitle(jsonForm.label, moduleId);
      buildLabelsFromBreadcrumb(jsonForm.views.edit.breadcrumb, 'edit', moduleId);
      buildLabelsFromBreadcrumb(jsonForm.views.list.breadcrumb, 'list', moduleId);
      buildLabelsFromActions(jsonForm.views.edit.actions, 'edit', moduleId);
      buildLabelsFromActions(jsonForm.views.list.actions, 'list', moduleId);
      buildLabelsFromFields(jsonForm.fields, moduleId); 

      deferred.resolve();

      return deferred.promise;
    }

    function buildLabelsFromTitle(title, moduleId, lang){
      var key = generateKey('title');

      $l10n.editLabel(key, title);
      jsonFormService.editLabel(key);

      saveLabel(title, key, moduleId);
    }

    function buildLabelsFromBreadcrumb(breadcrumb, view, moduleId){
      breadcrumb.forEach(function(item, index){
        if (item.hasOwnProperty('label')) {
          var key = generateKey('breadcrumb-')
                      .concat(view)
                      .concat('-')
                      .concat(index), 
              value = item.label; 
              
          item.label = key;
          $l10n.editLabel(key, value);
          saveLabel(value, key, moduleId);
        }
      });

      jsonFormService.editBreadcrumb(breadcrumb, view);
    }

    function buildLabelsFromActions(actions, view, moduleId){
      actions.forEach(function(action, index){
        if (action.label && !isKeyLabel(action.label)) {
          var key = generateKey('action-')
                    .concat(view)
                    .concat('-')
                    .concat('customAction')
                    .concat(index), 
              value = action.label;

          action.label = key;
          $l10n.editLabel(key, value);
          saveLabel(value, key, moduleId);
        }
      });

      jsonFormService.editActions(actions, view);
    }

    function buildLabelsFromFields(fields, moduleId){
      fields.forEach(function(field, index){
        var key = generateKey('field-').concat(field.name),
            value = field.label;

        field.label = key;
        $l10n.editLabel(key, value);
        saveLabel(value, key, moduleId); 
      });

      jsonFormService.editFields(fields);
    }

    function isKeyLabel(label){
      return $l10n.getLabel(label);
    }

    function translateLabels(form){
      form.label = translateTitle(form.label);
      translateBreadcrumb(form.views.edit.breadcrumb);
      translateBreadcrumb(form.views.list.breadcrumb);
      translateActions(form.views.list.actions);
      translateActions(form.views.edit.actions);
      translateFields(form.fields);

      return form;
    }

    function translateTitle(label){
      return $l10n.translate(label);
    }

    function translateBreadcrumb(breadcrumb){
      breadcrumb.forEach(function(item, index){
        if (item.hasOwnProperty('label')) {
          item.label = $l10n.translate(item.label);
        }
      });
    }

    function translateActions(actions){
      actions.forEach(function(action, index){
        action.label = $l10n.translate(action.label);
      }); 
    }

    function translateFields(fields){
      fields.forEach(function(field, index){
        field.label = $l10n.translate(field.label);
      });
    }

    return{
      getLabelsNamespace: getLabelsNamespace,
      setLabelsNamespace: setLabelsNamespace,
      buildLabels: buildLabels,
      saveLabel: saveLabel,
      buildLabelsFromTitle: buildLabelsFromTitle,
      translateLabels: translateLabels
    }
  }

})();