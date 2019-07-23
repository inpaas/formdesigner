(function(){
  angular
    .module('studio-v2')
    .service('labelsService', labelsService);
    
  labelsService.$inject = ['$http', '$filter', '$l10n', 'AUDIT_FIELDS', 'ACTIONS'];

  function labelsService($http, $filter, $l10n, AUDIT_FIELDS, ACTIONS){
      var labelsNamespace = "",
          labels = [];

    function saveLabels(labels, idModule){
      var url = '/api/studio/modules/'.concat(idModule).concat('/labels/').concat(getLanguageUser());

      return $http({
          url: url,
          method: 'post',
          data: labels
        }).then(function(){
          angular.forEach(labels, function(labelValue, labelKey){
            $l10n.editLabel(labelKey, labelValue);
          });
        }, onError);
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

    function buildLabels(jsonForm, moduleId){
      var labels,
          labelsToSave = {};

      setLabelsNamespace(jsonForm.key);

      labels = buildLabelsFromTitle(jsonForm);
      angular.extend(labelsToSave, labels);

      if (jsonForm.views.edit.breadcrumb.length) {
        labels = buildLabelsFromBreadcrumb(jsonForm.views.edit.breadcrumb, jsonForm.dataSource.key, moduleId);  
        angular.extend(labelsToSave, labels);
      }
      
      if(jsonForm.views.edit.actions){
        labels = buildLabelsFromActions(jsonForm.views.edit.actions, jsonForm.key);
        angular.extend(labelsToSave, labels);
      }

      if(jsonForm.fields){
        labels = buildLabelsFromFields(jsonForm.fields, jsonForm.dataSource.key.toLowerCase(), jsonForm.key); 
        angular.extend(labelsToSave, labels);
      }

      saveLabels(labelsToSave, moduleId);

      delete jsonForm.prevModuleId; 
      return jsonForm;
    }

    function buildLabelsFromTitle(jsonForm){
      var key = generateKey('title'),
          value = jsonForm.label,
          label = {};

      jsonForm.label = key.toLowerCase();
      label[key] = value || null;

      return label;
    }

    function buildLabelsFromBreadcrumb(breadcrumb, entityName){
      var value = breadcrumb[0].path,
          key = 'label.'.concat(entityName.toLowerCase()).concat('.path'),
          label = {};

      breadcrumb[0].path = key.toLowerCase();
      label[key] = value || null;

      return label;
    }

    function buildLabelsFromActions(actions, formId){
      var labels = {};

      actions.forEach(function(action){
        var defaultAction = ACTIONS.find((a)=> a.action == action.action);
        var translatedLabel = defaultAction? $l10n.translate(defaultAction.label) : action.label;

        if (action.label != translatedLabel) {
          var key = 'label.'.concat(formId, '.action.'),
            value = action.label;

          if(action.action == 'custom' || action.action == 'dynamic_buttons'){
            key = key.concat(action.name);

          }else{
            key = key.concat(action.action);
          }

          action.label = key.toLowerCase();
          labels[key] = value || null;

        }else{
          action.label = defaultAction.label;
        }
      });

      return labels;
    }

    function buildLabelsFromFields(fields, entityName, formKey){
      var labels = {};

      fields.forEach(function(field, index){
        var key = '', value = field.label;

        if(field.auditField){
          var auditField = AUDIT_FIELDS.filter(
            function(auditField){
              return auditField.name == field.auditName; 
            }
          )[0];

          if($l10n.translate(auditField.label).toLowerCase() != value.toLowerCase()){
            key = 'label.'.concat( entityName, '.', auditField.label.split('.')[1] );
            field.label = key.toLowerCase(); 
            labels[key] = value || null;
          }

        }else {

          if(field.colllumnName || field.meta.bind){
            key = 'label.'.concat(entityName).concat('.');
            key = key.concat(field.collumnName || (field.meta.bind && field.meta.bind.toLowerCase()));

          }else{
            key = 'label.'.concat(formKey).concat('.').concat(field.name);
          }

          field.label = key.toLowerCase(); 
          labels[key] = value || null;
        }

        if(field.meta.type == 'button' && field.meta.buttonLabel){
          var buttonKey = key.concat('.buttonlabel').toLowerCase(),
            buttonValue = field.meta.buttonLabel;

          labels[buttonKey] = buttonValue;
          field.meta.buttonLabel = buttonKey;
        }
        
        if (field.meta.placeholder) {
          var keyPlaceholder = key.concat('.placeholder').toLowerCase();
          labels[keyPlaceholder] = field.meta.placeholder;
          field.meta.placeholder = keyPlaceholder;
        }

        if(field.meta.help){
          var keyHelp = key.concat('help').toLowerCase();
          labels[keyHelp] = field.meta.help;
          field.meta.help = keyHelp;
        }

        delete field.collumnName;
      });

      return labels;
    }

    function isKeyLabel(label){
      return $l10n.getLabel(label) != label;
    }

    function translateLabels(form){
      form.label = translateTitle(form.label);

      if(form.views.edit.actions.length){
        translateActions(form.views.edit.actions);
      }

      if(form.fields.length){
        translateFields(form.fields);
      }

      if(form.views.edit.breadcrumb.length){
        translateBreadcrumb(form.views.edit.breadcrumb);
      }
      
      return form;
    }

    function translateBreadcrumb(breadcrumb){
      breadcrumb[0].path = $l10n.translate(breadcrumb[0].path);
    };

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

        if(field.meta.type == 'button'){
          field.meta.buttonLabel = $l10n.translate(field.meta.buttonLabel);
        }
      });

      return fields;
    }
    
    return{
      buildLabels: buildLabels,
      translateLabels: translateLabels
    }
  }

  function onError(response){
    Notification.error({message: $l10n.translate(response.error || response.message), delay: null});
  }
})();