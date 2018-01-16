(function(){
  angular
    .module('studio-v2')
    .service('labelsService', labelsService);
    
  labelsService.$inject = ['$http', '$filter', '$l10n', '$q', 'jsonFormService', 'AUDIT_FIELDS'];

  function labelsService($http, $filter, $l10n, $q, jsonFormService, AUDIT_FIELDS){
    var _userLocale = getLanguageUser(),
        labelsNamespace = ""; 
        labels = [];

    function saveLabel(text, key, idModule, forceUpdate){
      if ((!forceUpdate && $l10n.translate(key) == text) || !text){
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
      var forceLabelUpdate = jsonForm.prevModuleId;
      setLabelsNamespace(jsonForm.key);

      jsonForm.label = buildLabelsFromTitle(jsonForm.label, moduleId);

      if (jsonForm.views.edit.breadcrumb.length) {
        buildLabelsFromBreadcrumb(jsonForm.views.edit.breadcrumb, jsonForm.dataSource.key, moduleId, forceLabelUpdate);  
      }
      
      if(jsonForm.views.edit.actions){
        buildLabelsFromActions(jsonForm.views.edit.actions, 'edit', moduleId, forceLabelUpdate);
      }

      if(jsonForm.fields){
        buildLabelsFromFields(jsonForm.fields, moduleId, jsonForm.dataSource.key.toLowerCase(), jsonForm.key, forceLabelUpdate); 
      }
      delete jsonForm.prevModuleId; 
      return jsonForm;
    }

    function buildLabelsFromTitle(title, moduleId, lang, forceUpdate){
      var key = generateKey('title');
      saveLabel(title, key, moduleId, forceUpdate);
      return key;
    }

    function buildLabelsFromBreadcrumb(breadcrumb, entityName, moduleId, forceUpdate){
      var value = breadcrumb = breadcrumb[0].path,
          key = 'label.'.concat(entityName.toLowerCase()).concat('.path');

      saveLabel(value, key, moduleId, forceUpdate);
    }

    function buildLabelsFromActions(actions, view, moduleId, forceUpdate){
      actions.forEach(function(action, index){
        if (action.label && !isKeyLabel(action.label)) {
          var key = generateKey('action-')
                    .concat(view)
                    .concat('-')
                    .concat('customAction')
                    .concat(index), 
              value = action.label;

          action.label = key;

          saveLabel(value, key, moduleId, forceUpdate);
        }
      });

      return actions;
    }

    function buildLabelsFromFields(fields, moduleId, entityName, formKey, forceUpdate){
      fields.forEach(function(field, index){
        var key;

        if(field.auditField){
          var auditField = AUDIT_FIELDS.filter(function(auditField){return auditField.alias == field.meta.bind})[0];

          if($l10n.translate(auditField.label).toLowerCase() != field.label.toLowerCase()){
            key = 'label.'.concat(entityName).concat('.');
            key = key.concat(auditField.label.split('.')[1]);
          }
        }else{
          if(field.colllumnName || field.meta.bind ){
            key = 'label.'.concat(entityName).concat('.');
            key = key.concat(field.collumnName || (field.meta.bind && field.meta.bind.toLowerCase()));
          }else{
            key = 'label.'.concat(formKey).concat('.').concat(field.name);
          }
        }

        if(field.label){
          saveLabel(field.label, key, moduleId, forceUpdate);
          field.label = key; 
        }
        
        if (field.meta.placeholder) {
          var keyPlaceholder = key.concat('.').concat('placeholder');
          saveLabel(field.meta.placeholder, keyPlaceholder, moduleId, forceUpdate);
          field.meta.placeholder = keyPlaceholder;
        }

        if(field.meta.help){
          var keyHelp = key.concat('help');
          saveLabel(field.meta.help, keyHelp, moduleId, forceUpdate);
          field.meta.help = keyHelp;
        }

        delete field.collumnName;
      });

      return fields;

      function buildLabelsOptions(fieldName, options, forceUpdate){
        options.forEach(function(item, index){
          if(!$l10n.hasLabel(item.label)){
            saveLabel(item.value, item.label, moduleId, forceUpdate); 
          }
        });
      }
    }

    function isKeyLabel(label){
      return $l10n.getLabel(label);
    }

    function translateLabels(form){
      form.label = translateTitle(form.label);

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