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
      if ($l10n.translate(key) == text){
        return false;
      }

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
          $l10n.editLabel(key, text);
          return response;
        });
    }

    function generateKey(name){
      return labelsNamespace.concat(name);
    }

    function getLanguageUser(){
      return $filter('translate')('label.locale'); 
    }

    function setLabelsNamespace(formKey) {
      var template = "label.forms.{{form}}.";
      labelsNamespace = template.replace('{{form}}', formKey);
      return labelsNamespace;
    }

    function getLabelsNamespace(){
      return labelsNamespace;
    }

    function getLabelsByModule(moduleId){
      return $http({
        url: url,
        method: 'get'
      }).then(function(response){
        labels = response.data.data;
      });
    }

    function buildLabels(jsonForm, moduleId){
      setLabelsNamespace(jsonForm.key);

      jsonForm.label = buildLabelsFromTitle(jsonForm.label, moduleId);

      if (jsonForm.views.edit.breadcrumb) {
        buildLabelsFromBreadcrumb(jsonForm.views.edit.breadcrumb, 'edit', moduleId);  
      }
      
      if(jsonForm.views.edit.actions){
        buildLabelsFromActions(jsonForm.views.edit.actions, 'edit', moduleId);
      }

      if(jsonForm.fields){
        buildLabelsFromFields(jsonForm.fields, moduleId, jsonForm.dataSource.key.toLowerCase()); 
      }
      
      return jsonForm;
    }

    function buildLabelsFromTitle(title, moduleId, lang){
      var key = generateKey('title');
      saveLabel(title, key, moduleId);
      return key;
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

          saveLabel(value, key, moduleId);
        }
      });
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

          saveLabel(value, key, moduleId);
        }
      });

      return actions;
    }

    function buildLabelsFromFields(fields, moduleId, dataSourcekey){
      fields.forEach(function(field, index){
        var key = 'label.'.concat(dataSourcekey).concat('.');
        key = key.concat(field.collumnName || (field.meta.bind && field.meta.bind.toLowerCase()) || ('field-'.concat(index)) );
        saveLabel(field.label, key, moduleId);
        field.label = key; 

        if (field.meta.placeholder) {
          var keyPlaceholder = key.concat('.').concat('placeholder');
          saveLabel(field.meta.placeholder, keyPlaceholder, moduleId);
          field.meta.placeholder = keyPlaceholder;
        }

        if(field.meta.help){
          var keyHelp = key.concat('help');
          saveLabel(field.meta.help, keyHelp, moduleId);
          field.meta.help = keyHelp;
        }

        delete field.collumnName;
      });

      return fields;

      function buildLabelsOptions(fieldName, options){
        options.forEach(function(item, index){
          if(!$l10n.hasLabel(item.label)){
            saveLabel(item.value, item.label, moduleId); 
          }
        });
      }
    }

    function isKeyLabel(label){
      return $l10n.getLabel(label);
    }

    function translateLabels(form){
      form.label = translateTitle(form.label);

      if (form.views.edit.breadcrumb) {
        translateBreadcrumb(form.views.edit.breadcrumb);
      }

      if(form.views.edit.actions){
        translateActions(form.views.edit.actions);
      }

      if(form.fields){
        translateFields(form.fields);
      }

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
      return breadcrumb;
    }

    function translateActions(actions){
      actions.forEach(function(action, index){
        action.label = $l10n.translate(action.label);
      }); 

      return actions;
    }

    function translateFields(fields){
      fields.forEach(function(field, index){
        field.label = $l10n.translate(field.label);

        if (field.meta.placeholder) {
          field.meta.placeholder = $l10n.translate(field.meta.placeholder);
        }
        
        if(field.meta.help){
          field.meta.help = $l10n.translate(field.meta.help);
        }
      });

      return fields;
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