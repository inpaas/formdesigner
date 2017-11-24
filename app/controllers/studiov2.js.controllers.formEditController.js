/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);

  FormEditController.$inject = [
    //Constants
    'ACTIONS', 'TIME_FORMAT_PATTERNS', 'ICONS', 'FILE_EXTENSIONS', 'AUDIT_FIELDS',
    //Services
    '$scope', '$q', '$state', 'jsonFormService', 'httpService', 'labelsService', 
    '$l10n', '$uibModal', 'dragulaService', 'Notification', 'fieldIconsService'
  ];
 
 function FormEditController(ACTIONS, TIME_FORMAT_PATTERNS, ICONS, FILE_EXTENSIONS, AUDIT_FIELDS, $scope, $q, $state, jsonFormService, httpService, labelsService, $l10n, $uibModal, dragulaService, Notification, fieldIconsService) {
    var ctrl = this,
        idForm = $state.params.id;

    setCurrentViewFlag();
    settingsDragNDrop();

    getApps().then(function(){
      getJsonForm(idForm, 0)
        .then(function(response){
          var jsonModel = angular.copy(response);

          if(!jsonModel.moduleKey && jsonModel.moduleId) {
            jsonModel.moduleKey = getModuleKeyById(jsonModel.moduleId);
            delete jsonModel.moduleId;
          } 

          if (!jsonModel.dataSource.moduleKey && jsonModel.dataSource.moduleKey) {
            jsonModel.dataSource.moduleKey = getModuleKeyById(jsonModel.dataSource.moduleId || response.data.moduleId);
            delete jsonModel.dataSource.moduleId;
          }

          getPermissions(getModuleKeyById(jsonModel.dataSource.moduleId));
          buildSections(jsonModel);
          mapAddedButtons(jsonModel.views.edit.actions, 'edit');

          if (jsonModel.dataSource.key) {
            setBreadcrumb(jsonModel.views.edit.breadcrumb, jsonModel.dataSource.key);
            getEntitiesByModule(getModuleIdByKey(jsonModel.dataSource.moduleKey) || jsonModel.dataSource.moduleId)
              .then(function(response){
                getFieldsByEntity(jsonModel.dataSource.key).then(function(response){
                  linkColumnNameToFields(jsonModel.fields);
                });
              });

          }else{
            showConfigForm(jsonModel);
          }

          ctrl.jsonModel = jsonModel;
        });
    });

    function getJsonForm(id){
      if (id) {
        return httpService.getForm(id, 0); 
      }else{
        var deferred = $q.defer();
        deferred.resolve(jsonFormService.getFormTemplate());
        return deferred.promise;
      }
    }

    function buildSections(form) {
      var section = {
        fields: setFieldsToMainSection(form.fields),
        label: form.views.edit.label,
        type: 'main',
        views: form.views,
        fieldsCol1: [],
        fieldsCol2: [],
        fieldsCol3: []
      };

      ctrl.sections.push(section);

      form.fields.forEach(function(field, index){
        if (field.meta.type == 'include') {
          field.fieldsCol1 = [];
          field.fieldsCol2 = [];
          field.fieldsCol3 = [];

          if(field.finder && field.finder.key && !field.finder.relatedFinders){
            field.finder.relatedFinders = [{title: field.finder.title, key: field.finder.key}];
          }

          ctrl.sections.push(field);
        }
      });

      ctrl.sections.forEach(function(section, index){
        if (section.moduleId) {
          section.moduleKey = getModuleKeyById(section.moduleId);
        }

        if (section.fields) {
          section.fields.forEach(function(field, index){
            field.views.edit.size = section.views.edit.collumns == 3? 8 : (field.views.edit.size || 5);

            switch(field.views.edit.position) {
              case undefined:
              case 1:
                section.fieldsCol1.push(field);
                break;

              case 2:
                section.fieldsCol2.push(field);
                break;

              case 3:
                section.fieldsCol3.push(field);
            }
          });
        }
      });
    } 

    function setFieldsToMainSection(fields) {
      return fields.filter(function(field, index){
        if (field.meta.type != 'include') {
          return field;
        } 
      });
    }

    function linkColumnNameToFields(fields){
      if(!fields.length){return;}

      ctrl.entityForm.attributes.forEach(function(entityField){
        ctrl.sections[0].fields.forEach(function(field){
          if (!field.auditField && entityField.alias == field.meta.bind) {
            field.collumnName = entityField.name.toLowerCase();
          }
        });
      });
    }

    function mapAddedButtons(buttons, view){
      buttons.forEach(function(button, index){
        setAddedButton(button, view);
      });
    }

    function setAddedButton(button, view){
      ctrl.addedButtons[view][button.action] = true;
    }

    function unsetAddedButton(button, view){
      ctrl.addedButtons[view][button.action] = false;
    }

    function addButton(actionName, position, label) {
      var button = {
        action : actionName,
        view : ctrl.currentView,
        label: label
      };

      if (actionName.match(/(custom)|(modal)/g)) {
        button.btCustom = true; 
      }

      setAddedButton(button, ctrl.currentView);

      if(typeof position === 'number'){
        ctrl.jsonModel.views[ctrl.currentView].actions.splice(position, 0, button);
      }else{
        ctrl.jsonModel.views[ctrl.currentView].actions.push(button);
      }

      if(actionName == 'modal'){
        angular.extend(button, {
          onClose: {
            event: {},
            updateParentForm: {}
          }
        });
      }

      ctrl.editBt = button;
      showConfigBt();
    }

    function editButton(view, index, actionName) {
      var action;

      action = angular.copy(ctrl.jsonModel.views[ctrl.currentView].actions[index]); 
      action.index = index;

      if (action.visible) {
        angular.extend(action, setDisplayConfigForEdit(action.visible, 'visibilityType', 'visibilityExpression'));
      }

      action.label = $l10n.translate(action.label);
      ctrl.editBt = action;
      showConfigBt();
    } 

    function saveEditButton() {
      var clone = angular.copy(ctrl.editBt), 
          action = {
            label: clone.label,
            notDisplayLabel: !!clone.notDisplayLabel,
            name: clone.name || clone.label.toLowerCase().replace(/\s/g, '-'),
            visible: setDisplayConfig(clone.visibilityType, clone.visibilityExpression),
            event: setEventConfig(), 
            saveAndStay: clone.saveAndStay
          };

      if (!angular.isUndefined(clone.index)) {
        var bt = ctrl.jsonModel.views[ctrl.currentView].actions[clone.index];
        angular.extend(bt, action);
      }else{
        ctrl.jsonModel.views[ctrl.currentView].actions.push(action); 
      }

      ctrl.editBt = {};
      showComponents();
      
      function setEventConfig() {
        if (clone.setEvent) {
          action.event = {
            method: clone.method,
            sourceKey: clone.sourceKey
          }
        }
      }
    }

    function removeBt(view, index) {
      var bt = ctrl.jsonModel.views[ctrl.currentView].actions.splice(index, 1)[0];

      if (bt.action != 'custom') {
        unsetAddedButton(bt, ctrl.currentView);
      }

      if(bt.name == ctrl.editBt.name){
        showComponents();
      }
    }

    function addMapToBt(name, value) {
      var expression = {};
      expression[name] = value;
      ctrl.editBt.map.push(expression);
    }

    function openModalForConfig(model, modelKey, typeConfig){
      var typeFunctionTemplateUrl = "/forms/studiov2.forms.config-function",
          typeMapTemplateUrl = "/forms/studiov2.forms.config-map";

      var uibModalInstance = $uibModal.open({
        templateUrl: typeConfig == 'function'? typeFunctionTemplateUrl : typeMapTemplateUrl,
        controller: 'ConfigDisplayController',
        controllerAs: "$ctrl",
        resolve: {
          typeConfig: function(){return typeConfig},
          expression: function(){
            var value;

            if ((angular.isObject(model[modelKey]) && typeConfig == 'function') || (angular.isString(model[modelKey]) && typeConfig == 'map')){
              value = '';
            }else{
              value = model[modelKey];
            }

            return value;
          },
          formFields: function(){
            var fields = [];

            ctrl.sections.forEach(function(section, index){
              if(section.type == 'main' || section.isSameDataSource){
                fields = fields.concat(section.fields);
              }
            });

            return fields;
          }
        }
      });

      uibModalInstance.result.then(function(result){
        model[modelKey] = result;
      });
    }
    
    function addNewSection() {
      ctrl.onNewSection = true;
      ctrl.currentSection = {
        type: 'include',
        name: 'include-'.concat(ctrl.sections.length), 
        id: 'section-'.concat(ctrl.sections.length),
        meta: {type: 'include'},
        isSameDataSource: true,
        fieldsCol1: [],
        fieldsCol2: [],
        fieldsCol3: [],
        fields: [],
        views: {
          edit: {
            layout: 'horizontal'
          }
        }
      };

      ctrl.moduleEntity = {};
      showConfigSection();
    } 

    function saveSection() {
      var currentSection = angular.copy(ctrl.currentSection),
          dependencies = {};

      if (currentSection.includeType == 'list') {
        
        if(ctrl.moduleEntity && ctrl.moduleEntity.key){
          currentSection.finder.moduleKey = ctrl.moduleEntity.key;
        } 

        if (currentSection.dependenciesKeys && currentSection.dependenciesKeys.length) {
          currentSection.dependenciesKeys.forEach(function(key){ 
            var entitySectionField = currentSection.entity.attributes.filter(function(attr){return attr.name == key; })[0];
            dependencies[entitySectionField.alias] = 'id';
          });

          currentSection.finder.dependencies = dependencies;
        }

      }else if(currentSection.isSameDataSource){
        currentSection.includeType = 'edit';

        if(!currentSection.jsonForm){
          var jsonForm = jsonFormService.getFormTemplate();
          jsonForm.key = ctrl.jsonModel.key.concat('.form-include-').concat( (new Date().getTime()) ),
          jsonForm.label = currentSection.label;
          jsonForm.dataSource = ctrl.jsonModel.dataSource;
          jsonForm.moduleKey = ctrl.jsonModel.moduleKey;
          currentSection.include = {
            key: jsonForm.key,
            moduleKey: ctrl.jsonModel.moduleKey
          }
          currentSection.jsonForm = jsonForm;
        }

        angular.extend(currentSection.jsonForm.views.edit, currentSection.views.edit);

      }else if(currentSection.includeType == 'edit'){
        ctrl.entityForms.forEach(function(form, index){
          if(form.key == currentSection.include.key) {
            currentSection.include = form;
          }
        }); 

      }else if(currentSection.includeType == 'templateCustom'){
        currentSection.include.moduleKey = ctrl.moduleEntity.key;
      }

      if (currentSection.visibilityType) {
        currentSection.meta.visible = setDisplayConfig(currentSection.visibilityType, currentSection.visibilityExpression);
        delete currentSection.visibilityType;
        delete currentSection.visibilityExpression;
      }

      if (currentSection.disabledType) {
        currentSection.meta.disabled = setDisplayConfig(currentSection.disabledType, currentSection.disabledExpression);
        delete currentSection.disabledType;
        delete currentSection.disabledExpression;
      }

      !currentSection.onload && (delete currentSection.views.edit.onload);
      !currentSection.onsubmit && (delete currentSection.views.edit.onsubmit);
      !currentSection.onchange && (delete currentSection.views.edit.onchange);

      if(currentSection.type == 'main'){
        angular.extend(ctrl.jsonModel.views, currentSection.views);
      }

      delete currentSection.onload;
      delete currentSection.onsubmit;
      delete currentSection.onchange;

      switch(currentSection.views.edit.collumns) {
        case 1:
          currentSection.fieldsCol1 = currentSection.fieldsCol1.concat(currentSection.fieldsCol2);
          currentSection.fieldsCol1 = currentSection.fieldsCol1.concat(currentSection.fieldsCol3);
          currentSection.fieldsCol2.length = 0;
          currentSection.fieldsCol3.length = 0;
        case 2:
          currentSection.fieldsCol2 = currentSection.fieldsCol3.concat(currentSection.fieldsCol3);
          currentSection.fieldsCol3.length = 0;
      }


      if (!angular.isUndefined(currentSection.index)) {
        angular.extend(ctrl.sections[currentSection.index], currentSection);
      }else{
       ctrl.sections.push(currentSection);
      }

      if (ctrl.sections.length == 1) {
        ctrl.jsonModel.views.edit.label = currentSection.label;
      }

      showComponents();
    }

    function addFieldInclude(field){
      ctrl.jsonModel.fields.push(field);
    }

    function cancelEditSection() {
      showComponents();
      ctrl.currentSection = {};
    }
    
    function autoSelectSection(){
      selectSection(0);
    }

    function moveSection(index, targetIndex){
      ctrl.sections.splice(targetIndex, 0, ctrl.sections.splice(index, 1)[0]);
    }

    function editSection(index) {
      var currentSection = angular.copy(ctrl.sections[index]);
      currentSection.index = index;

      if(currentSection.includeType == 'list' ) {
        if(currentSection.finder.moduleKey || currentSection.finder.moduleId){
          getModuleEntity(getModuleIdByKey(currentSection.finder.moduleKey) || currentSection.finder.moduleId, currentSection.finder);
        }

        setFinder(currentSection.finder.entityName, currentSection, true).then(function(){ 
          var dependenciesKeys = [];

          angular.forEach(currentSection.finder.dependencies, function(value, key){
            var field = currentSection.entity.attributes.filter(function(field){return field.alias == key; })[0];

            if (field) {
              dependenciesKeys.push(field.name);
            }
          });

          currentSection.dependenciesKeys = dependenciesKeys;
          ctrl.currentSection = currentSection;
          showConfigSection();
        });

        return;
      }

      if(currentSection.includeType == 'edit' && !currentSection.isSameDataSource){
        getEntityFormsByBind(currentSection.meta.bind);
      }

      if(currentSection.includeType == 'templateCustom'){
        getModuleTemplates(getModuleIdByKey(currentSection.include.moduleKey));
      }

      if(currentSection.meta && currentSection.meta.visible) {
        angular.extend(currentSection, setDisplayConfigForEdit(currentSection.meta.visible, 'visibilityType', 'visibilityExpression'));
      }

      if(currentSection.meta && currentSection.meta.disabled) {
        angular.extend(currentSection, setDisplayConfigForEdit(currentSection.meta.disabled, 'disabledType', 'disabledExpression'));
      }

      if(!currentSection.views.edit.collumns) {
        currentSection.views.edit.collumns = 1; 
      }

      if(currentSection.views.edit.onload){
        currentSection.onload = true;
      }

      if(currentSection.views.edit.onsubmit){
        currentSection.onsubmit = true;
      }

      if(currentSection.views.edit.onchange){
        currentSection.onchange = true;
      }

      if(!currentSection.views.edit.layout){
        currentSection.views.edit.layout = 'horizontal';
      }

      if(currentSection.views.edit.sources && currentSection.views.edit.sources.js && angular.isString(currentSection.views.edit.sources.js)){
        var sources = [currentSection.views.edit.sources.js]; 
        currentSection.views.edit.sources.js = sources; 
      }

      ctrl.currentSection = currentSection;
      showConfigSection();
    }

    function getFinderTitleByKey(finders, key){
      var finder = finders.filter(function(f){ 
        return f.key == key;
      })[0];
      
      return finder.title;
    }

    function getReferences(entity){
      var references = [];

      entity.references && entity.references.forEach(function(ref, index){
        if(ctrl.entityForm.name == ref.entity){ 
          references.push(ref.fieldReference || ref.field);
        }
      });

      return references;
    };

    function getEntityAndSetReferences(entityName, model){
      getFinders(model.finder.entityName).then(function(){
        if ((ctrl.finders && ctrl.finders.length == 1)) {
          model && (model.finder.key = ctrl.finders[0].key);
        }
      });

      return httpService.getEntityByKey(model.finder.entityName).then(function(response){
        model.entity = response.data;
        model.references = getReferences(response.data);
        return model.entity;
      });
    }

    function selectSection(index){
      ctrl.sectionSelectedIndex = index;
    }

    function setTypeField(type, fieldEdit) {
      fieldEdit = fieldEdit || ctrl.fieldEdit;
      fieldEdit.meta.type = type;

      switch (type){
        case 'currency':
        case 'date':
          getFormatsPattern();
          break;

        case 'select': 
          var reference = [];
          filterSelectFields(fieldEdit);
          fieldEdit.rawEntityField && (reference = findReferences(fieldEdit));

          if (fieldEdit.rawEntityField && fieldEdit.rawEntityField.domains) {
            fieldEdit.dataSourceType = 'D';
            fieldEdit.meta.options = angular.copy(fieldEdit.rawEntityField.domains); 

          }else if(reference.length){
            fieldEdit.dataSourceType = 'E';
            ctrl.moduleEntity = getModuleEntity(getModuleIdByKey(ctrl.jsonModel.moduleKey));

            fieldEdit.finder = {
              entityName: reference[0].entity
            }

            getFinders(reference[0].entity)
              .then(function(){
                if ((ctrl.finders && ctrl.finders.length == 1)) {
                  fieldEdit.finder.key = ctrl.finders[0].key;
                  fieldEdit.finder.entityName = reference[0].entity;
                }
              })
              .then(function(){
                getFinder(fieldEdit.finder.entityName, fieldEdit.finder.key).then(function(finder){
                  if(finder.fields.length == 1){
                    fieldEdit.finder.fieldIndex = 0; 
                  }
                });
              });

          }else{
            fieldEdit.dataSourceType = 'O';
            fieldEdit.meta.options = [];
          }
          break;

        case 'checkbox':
          fieldEdit.requiredType = 'false';
          fieldEdit.requiredExpression = false;

          if (fieldEdit.rawEntityField.type == 'Char' && fieldEdit.rawEntityField.size == 1) {
            if (!fieldEdit.rawEntityField.domains) {
              fieldEdit.dataSourceType = 'O';
              fieldEdit.meta.checked =  'Y';
              fieldEdit.meta.unchecked = 'N';
            }else{
              fieldEdit.dataSourceType = 'D';
              fieldEdit.meta.checked =  'Y';
              fieldEdit.meta.unchecked = 'N';
            }
          }
          break;
          case 'file': 
            fieldEdit.FILE_EXTENSIONS = FILE_EXTENSIONS;
          break;
      }

      showEditField();
    } 

    function getFormatsPattern(){
      httpService.getFormats().then(function(response){
        ctrl.formatsPattern = angular.copy(response.data);
      });
    }

    function getModuleFromApps(idModule){
      var module = {};

      ctrl.apps && ctrl.apps.forEach(function(app, index){
        if (app.modules) {
          app.modules.forEach(function(mod, index){
            if (mod.id == idModule) {
              module = mod;
            }
          });
        }
      });

      return module;
    }

    function findReferences(fieldForm){
      return ctrl.entityForm.references.filter(function(ref, index){
        return ref.field.toLowerCase() === fieldForm.rawEntityField.name.toLowerCase();
      });
    }

    function saveEditField(){
      if (!ctrl.sections.length) { return false; }

      var fieldEdit = ctrl.fieldEdit,
          section = ctrl.sections[ctrl.sectionSelectedIndex]; 

      setNameField(fieldEdit);

      if (fieldEdit.visibilityType) {
        fieldEdit.meta.visible = setDisplayConfig(fieldEdit.visibilityType, fieldEdit.visibilityExpression);
        delete fieldEdit.visibilityType;
        delete fieldEdit.visibilityExpression;
      }

      if (fieldEdit.requiredType) {
        fieldEdit.meta.required = setDisplayConfig(fieldEdit.requiredType, fieldEdit.requiredExpression);
        delete fieldEdit.requiredType;
        delete fieldEdit.requiredExpression;
      }

      if (fieldEdit.disabledType) {
        fieldEdit.meta.disabled = setDisplayConfig(fieldEdit.disabledType, fieldEdit.disabledExpression);
        delete fieldEdit.disabledType;
        delete fieldEdit.disabledExpression;
      }

      if(fieldEdit.dataSourceType){
        configDataSource(fieldEdit);
      }

      if (fieldEdit.rawEntityField && fieldEdit.rawEntityField.translatedName != fieldEdit.label) {
        fieldEdit.rawEntityField.translatedName = fieldEdit.label;
      }

      if(fieldEdit.meta.minDate){
        fieldEdit.meta.minDate = moment(fieldEdit.meta.minDate, $l10n.translate(fieldEdit.meta.format.concat('.formatjs')) ).format('YYYY-MM-DD HH:mm:ss');
      }

      if(fieldEdit.meta.maxDate){
        fieldEdit.meta.maxDate = moment(fieldEdit.meta.maxDate, $l10n.translate(fieldEdit.meta.format.concat('.formatjs')) ).format('YYYY-MM-DD HH:mm:ss');
      }

      if(fieldEdit.minCount){
        fieldEdit.min.minCount = parseNumber(fieldEdit.minCount);
      }

      if(fieldEdit.maxCount){
        fieldEdit.meta.maxCount = parseNumber(fieldEdit.maxCount);
      }

      if (angular.isUndefined(fieldEdit.index)){
        addNewField();

      }else if(fieldEdit.col == 1){
        section.fieldsCol1[fieldEdit.index] = fieldEdit;

      }else if(fieldEdit.col == 2){
        section.fieldsCol2[fieldEdit.index] = fieldEdit;

      }else{
        section.fieldsCol3[fieldEdit.index] = fieldEdit;
      }

      if(!fieldEdit.hasButton){
        delete fieldEdit.buttonEvent;
      }

      if(fieldEdit.meta.type == 'file'){
        fieldEdit.meta.extensions = '';
        var mimetypes = [];

        fieldEdit.FILE_EXTENSIONS.types.forEach(function(ext){
          if(fieldEdit.fileTypes.indexOf(ext.name) != -1){
            mimetypes = mimetypes.concat(ext.mimetypes);
          }
        });

        fieldEdit.meta.extensions = mimetypes.join(',');

        if(fieldEdit.othersExtensions){
          var extensions = fieldEdit.othersExtensions.replace(/\./g, '').split(','); 

          extensions.forEach(function(extName){
            fieldEdit.FILE_EXTENSIONS.extensions.forEach(function(extension){
              if(extension.name == extName){
                fieldEdit.meta.extensions.concat(extension.name);
              }
            });
          });
        }

        fieldEdit.meta.extensions.concat(fieldEdit.othersExtensions || '');
        delete fieldEdit.FILE_EXTENSIONS;
      }
      
      if(fieldEdit.bindDependencies && fieldEdit.bindDependencies.length){
        var dependencies = [],
            hasBindRefs = fieldEdit.bindReferences && fieldEdit.bindReferences.length;

        fieldEdit.bindDependencies.forEach(function(bindDep){
          var map = hasBindRefs? fieldEdit.bindReferences.filter(filterBindRef.bind(null, bindDep)) : null;

          if(map){
            dependencies = dependencies.concat(map);
          }else{
            dependencies.push(bindDep);
          }
        });

        fieldEdit.finder.dependencies = dependencies;

        function filterBindRef(bindDep, bindRef){
          return bindRef.bindForm == bindDep;
        }
      } 

      delete fieldEdit.rawEntityField;
      delete fieldEdit.col;

      ctrl.fieldEdit = {};
      showComponents();
    }

    function getReferenceFk(binds, field){
      var depReferences = [],
          field = field || ctrl.fieldEdit;

      binds.forEach(function(bindDep){
        var referenceOfField = ctrl.entityForm.references.filter(function(ref){ return ref.field == field.rawEntityField.name})[0],
            //A entity do finder pode ou não ter FK com a entity do form
            entityFinder = ctrl.entityForm.entitiesReference[referenceOfField.entity.toLowerCase()],
            dependenceField = ctrl.selectFields.filter(function(field){ return field.meta.bind == bindDep})[0],
            dependences = [];

        if(!dependenceField || !dependenceField.finder){ return }

        entityFinder.references.forEach(function(ref){ 
          if(ref.entity == dependenceField.finder.entityName){ 
            var aliasRef = [];

            entityFinder.attributes.forEach(function(attr){ 
              if(attr.name == ref.field) {
                var refMap = {
                  fk: dependenceField.label.concat(' (').concat(attr.alias).concat(')'),
                  bindForm: dependenceField.meta.bind,
                  bindRef: attr.alias
                };

                aliasRef.push(refMap);
              }
            });

            depReferences = depReferences.concat(aliasRef);
          }
        });
      });

      ctrl.depReferences = depReferences;
    };

    function configDataSource(model){
      switch(model.dataSourceType){
        case 'O':
        case 'D':
          delete model.serviceSource;
          delete model.finder;
          break;

        case 'E':
          model.finder.moduleKey = ctrl.moduleEntity.key;
          delete model.serviceSource;
          break; 

        case 'S':
          delete model.finder;
          delete model.options;
          break;
      }
    } 

    function setNameField(field)  {
      if(field.meta.bind){
        field.name = 'input'.concat(field.meta.bind.replace(/\./g, ''));
      }else{
        field.name = 'input'.concat( (new Date().getTime()) );
      }
    } 

    function addNewField() {
      if (!ctrl.sectionSelectedIndex) {
        autoSelectSection();
      }

      var sectionSelected = ctrl.sections[ctrl.sectionSelectedIndex],
          newField = angular.copy(ctrl.fieldEdit);

      newField.views.edit.size = sectionSelected.views.edit.collumns == 3? 8 : (newField.views.edit.size || 5);

      newField.id = sectionSelected.fields.length;
      sectionSelected.fieldsCol1.push(newField);
    } 

    function addField(entityField) {
      var fieldEdit = {
            meta: {},
            views: {
              edit:{
                position: 1,
                size: '5'
              }
            }
          };

      fieldEdit.label = entityField.translatedName || entityField.alias;

      if(entityField){
        fieldEdit.meta.bind = entityField.alias;

        if(entityField.auditField){
          fieldEdit.auditField = true;

        }else{
          fieldEdit.meta.maxLength = (entityField.size > 0) ? entityField.size : '';
          fieldEdit.meta.defaultValue = entityField.defaultValue;
          fieldEdit.rawEntityField = angular.copy(entityField);
          fieldEdit.collumnName = entityField.name.toLowerCase();
        }

        setConfigFieldDefault(entityField, fieldEdit);
      }else{
        fieldEdit.customField = true;
      }

      if(!ctrl.sectionSelectedIndex){
        autoSelectSection();
      }

      ctrl.fieldEdit = angular.copy(fieldEdit);

      showTypeFields();
    }

    function setConfigFieldDefault(entityField, fieldEdit){
      fieldEdit.visibilityType = 'true';
      fieldEdit.visibilityExpression = true;
      fieldEdit.requiredType = entityField.required? 'true' : 'false';
      fieldEdit.requiredExpression = entityField.required? true : false; 
      
      if(entityField.auditField){
        fieldEdit.views.edit.readOnly = true;
      }else{
        fieldEdit.disabledType = 'false';
        fieldEdit.disabledExpression = false;
      }

      if(entityField.alias == 'id' && entityField.primaryKey){
        fieldEdit.viewList = true;
        fieldEdit.requiredType = 'false';
        fieldEdit.requiredExpression = false;
        fieldEdit.disabledType = 'true';
        fieldEdit.disabledExpression  = true;
        setTypeField('number', fieldEdit);
      }
    }

    function editField(_formField, index, section) {
      if(section.fieldsCol1.indexOf(_formField) != -1){
        _formField.col = 1;
      }else if(section.fieldsCol2.indexOf(_formField) != -1){
        _formField.col = 2;
      }else{
        _formField.col = 3;
      };

      var formField = angular.copy(_formField),
          sectionIndex = ctrl.sections.indexOf(section);

      formField.index = index;

      if(!formField.views.edit.size){
        formField.views.edit.size = '5';
      }else{
        formField.views.edit.size = formField.views.edit.size.toString(); 
      }

      if (!section.views.edit.collumns){
        section.views.edit.collumns = 1; 
      }
      
      ctrl.entityForm.attributes.forEach(function(entityField, index){
        if(entityField.alias === formField.meta.bind){
          formField.rawEntityField = entityField;
        }
      });

      if (formField.meta.visible) {
        angular.extend(formField, setDisplayConfigForEdit(formField.meta.visible, 'visibilityType', 'visibilityExpression'));
      }

      if (formField.meta.required) {
        angular.extend(formField, setDisplayConfigForEdit(formField.meta.required, 'requiredType', 'requiredExpression'));
      }

      if (formField.meta.disabled) {
        angular.extend(formField, setDisplayConfigForEdit(formField.meta.disabled, 'disabledType', 'disabledExpression'));
      }

      if (formField.finder) {
        getFinders(formField.finder.entityName);
        getFinder(formField.finder.entityName, formField.finder.key);
        filterSelectFields(formField);
        ctrl.moduleEntity = getModuleFromApps(getModuleIdByKey(formField.finder.moduleKey) || formField.finder.moduleId);
        formField.dataSourceType = 'E';

        if(formField.finder.dependencies){
          var bindDependencies = [],
              bindReferences = [];

          formField.finder.dependencies.forEach(function(dep){
            if(angular.isObject(dep)){
              bindReferences.push(dep);
              bindDependencies.push(dep.bindForm);
            }else{
              bindDependencies.push(dep);
            }
          }); 

          getReferenceFk(bindDependencies, formField);
          formField.bindDependencies = bindDependencies;
          formField.bindReferences = bindReferences;
        }

      }else if(formField.serviceSource){
        getSources(getModuleIdByKey(formField.serviceSource.moduleKey));
        filterSelectFields(formField);
        ctrl.moduleEntity = getModuleFromApps(getModuleIdByKey(formField.serviceSource.moduleKey) || formField.serviceSource.moduleId);
        formField.dataSourceType = 'S';

      }else if(formField.meta.type.match('checkbox') || formField.meta.type.match('select') ){
        formField.rawEntityField && formField.rawEntityField.domains? formField.dataSourceType = 'D' : formField.dataSourceType = 'O';
      }
      
      if(formField.meta.minDate){
        formField.meta.minDate = moment(formField.meta.minDate).format($l10n.translate(formField.meta.format.concat('.formatjs')));
      } 

      if(formField.meta.maxDate){
        formField.meta.maxDate = moment(formField.meta.maxDate).format($l10n.translate(formField.meta.format.concat('.formatjs')));
      }

      ctrl.sectionSelectedIndex = sectionIndex;

      if (formField.meta.type.match(/(date)/g) || formField.meta.type == 'currency') {
        getFormatsPattern();
      }

      if(formField.fileTypes && formField.fileTypes.length){
        formField.FILE_EXTENSIONS = FILE_EXTENSIONS;

        formField.FILE_EXTENSIONS.types.forEach(function(ext){
          if(formField.fileTypes.indexOf(ext.name) != -1){
            ext.checked = true;
          }
        });
      }

      ctrl.fieldEdit = formField;
      showEditField();
    }
     
    function cancelEditField() {
      showComponents();
      ctrl.fieldEdit = {};
    }

    function removeField(field, section) {
      if (section.fieldsCol1.indexOf(field) != -1){
        section.fieldsCol1.splice(section.fieldsCol1.indexOf(field), 1);
      
      }else if(section.fieldsCol2.indexOf(field) != -1){
        section.fieldsCol2.splice(section.fieldsCol2.indexOf(field), 1);

      }else {
        section.fieldsCol3.splice(section.fieldsCol3.indexOf(field), 1);
      }

      if (ctrl.fieldEdit && ctrl.fieldEdit.name == field.name) {
        showComponents();
      }
    }

    function removeSection(index){
      ctrl.sections.splice(index, 1);
      showComponents();
    }

    function saveForm(){
      if(ctrl.sections.length == 1){
        setFieldsOnMainForm(ctrl.jsonModel, ctrl.sections);
        setFieldsIncludes(ctrl.jsonModel, ctrl.sections.slice(1, ctrl.sections.length));
        ctrl.jsonModel.views.edit.breadcrumb = setBreadcrumbOnForm(); 
        var form = labelsService.buildLabels(angular.copy(ctrl.jsonModel), getModuleIdByKey(ctrl.jsonModel.moduleKey) || ctrl.jsonModel.moduleId);
        save(form);

      }else{
        saveIncludeForms().then(function(responses){
          setFieldsOnMainForm(ctrl.jsonModel, ctrl.sections);
          setFieldsIncludes(ctrl.jsonModel, ctrl.sections.slice(1, ctrl.sections.length));
          ctrl.jsonModel.views.edit.breadcrumb = setBreadcrumbOnForm(); 
          var form = labelsService.buildLabels(angular.copy(ctrl.jsonModel), getModuleIdByKey(ctrl.jsonModel.moduleKey) || ctrl.jsonModel.moduleId);
          save(form);
        });
      }
    }

    function save(form){
      if(form.id) {
        httpService.saveEditForm(form, form.id, getModuleIdByKey(ctrl.jsonModel.moduleKey) || ctrl.jsonModel.moduleId).then(function success(response){
          Notification.success('Formulário salvo com sucesso');
        }, function error(response){
          Notification.error('O formulário não pode ser salvo. \n'.concat( $l10n.translate(response.data.message) ));
        });
      }else{
        httpService.saveNewForm(form, getModuleIdByKey(ctrl.jsonModel.moduleKey) || ctrl.jsonModel.moduleId)
          .then(function(response){
            return httpService.saveEditForm(form, response.data.id, getModuleIdByKey(ctrl.jsonModel.moduleKey)|| ctrl.jsonModel.moduleId).then(function(response){
              Notification.success('Formulário salvo com sucesso');
              goToEdit(response.data.id, false);
            });
        }, function error(response){
          Notification.error('O formulário não pode ser salvo. \n'.concat( $l10n.translate(response.data.message) ));
        });
      }
    }

    function deleteForm(){
      var confirm = window.confirm('Tem certeza?');

      confirm && httpService.deleteForm(idForm, getModuleIdByKey(ctrl.jsonModel.moduleKey) || ctrl.jsonModel.moduleId).then(function(response){
        ctrl.configForm = {};
        ctrl.moduleForm = {};

        Notification.success('Formulário deletado');
        $state.go('forms.new-view-edit');
      }); 
    }

    function setFieldsIncludes(form, sections){
      sections.forEach(function(section){
        var field = angular.copy(section);

        delete field.fields;
        delete field.newInclude;
        delete field.jsonForm;
        delete field.type;
        delete field.fieldsCol1;
        delete field.fieldsCol2;
        delete field.fieldsCol3;
        delete field.rawEntityField;
        delete field.referencesChild;
        delete field.references;
        delete field.dependenciesKeys;
        delete field.entity;

        if(field.finder && field.finder.relatedFinders && field.finder.relatedFinders.length == 1){
          var finder = field.finder.relatedFinders[0];
          angular.extend(field.finder, {key : finder.key, title: finder.title});
          delete field.finder.relatedFinders;
        }

        form.fields.push(field);
      });
    }

    function saveIncludeForms(){
      var promises = [];
      
      ctrl.sections.forEach(function(section){
        if (section.jsonForm) {
          var form = section.jsonForm;

          form.fields.length = 0;
          form.label = section.label;
          form.moduleKey = ctrl.jsonModel.moduleKey
          form.include = true;
          angular.extend(form.views.edit, section.views.edit);
          form.views.edit.collumns = section.views.edit.collumns;
          setFieldsOnForm(section, form);

          form = labelsService.buildLabels(angular.copy(form), getModuleIdByKey(form.moduleKey) || form.moduleId); 

          if(form.id){
            var p = httpService.saveEditForm(form, form.id, getModuleIdByKey(form.moduleKey) || form.moduleId); 
            promises.push(p);
          }else{
            var p = httpService.saveNewForm(form, getModuleIdByKey(form.moduleKey)).then(function(response){
                      section.jsonForm.id = form.id = response.data.id;
                      return form;
                    }).then(function(form){
                      return httpService.saveEditForm(form, form.id, getModuleIdByKey(form.moduleKey) || form.moduleId); 
                    });

            promises.push(p);
          }
        }
      });

      return $q.all(promises);
    }

    function setFieldsOnMainForm(form, sections){
      form.fields.length = 0;

      sections.forEach(function(section, index){
        if (section.type == 'main') { 
          setFieldsOnForm(section, form);
        }
      });
    }

    function setFieldsOnForm(section, form){
      section.fieldsCol1 && section.fieldsCol1.forEach(setPositionField.bind(this, 1));
      section.fieldsCol2 && section.fieldsCol2.forEach(setPositionField.bind(this, 2));
      section.fieldsCol3 && section.fieldsCol3.forEach(setPositionField.bind(this, 3));

      function setPositionField(position, field){
        field.views.edit.position = position;
        delete field.rawEntityField;
        form.fields.push(field);
      };
    }
    
    function showEditField() {
      ctrl.onEditField = true;
      ctrl.onEditSection = false;
      ctrl.onTypeField = false;
      ctrl.onComponents = false;
    }

    function showComponents() {
      ctrl.onComponents = true;
      ctrl.onEditSection = false;  
      ctrl.onNewSection = false;  
      ctrl.onNewField = false;
      ctrl.onTypeField = false;
      ctrl.onEditField = false;
      ctrl.onCreateButton = false;
    }

    function showConfigSection() {
      ctrl.onEditSection = true; 
      ctrl.onComponents = false;
      ctrl.onTypeField = false; 
    } 

    function showTypeFields() {
      ctrl.onTypeField = true; 
      ctrl.onNewField = true;
      ctrl.onEdit = false;
      ctrl.onComponents = false;
      ctrl.onEditField = false; 
    }
    
    function showConfigBt() {
      ctrl.onCreateButton = true;
      ctrl.onComponents = false;
    }

    function getApps(){
      return httpService.getApps().then(function(response){
        ctrl.apps = response.data; 
      });
    }

    function getModuleForms(idModule, model){
      getModule(idModule).then(function(response){
        model.title = response.data.title;
        model.forms = [];

        angular.forEach(response.data.forms, function(forms, keyNamespace){
          forms.forEach(function(item, index){ 
            item.type == 'v2' && model.forms.push(item);
          });
        });

      });
    }

    function getFinders(entityName){
      return httpService.getFinders(entityName).then(function(response){

        var finders = response.data.filter(function(f){ return f.entityFinder}),
            key = 'finder.'.concat(entityName.toLowerCase()).concat('.default'),
            title = $l10n.translate('label.finder.allrecords');

        if(!finders.filter(function(f){ return f.key == key;}).length){
          finders.push({key: key, title: title, entityFinder: true});
        }

        ctrl.finders = finders;
        return response;
      });
    }

    function getFinder(entityName, finderKey){
      return httpService.getFinder(entityName, finderKey).then(function(response){
        ctrl.finder = response.data;

        return response.data;
      });
    }

    function getModuleEntity(idModule, model) {
      httpService.getModule(idModule).then(function(response) {
        ctrl.moduleEntity = response.data;
        ctrl.entities = response.data['data-sources'];

        if (model) {
          model.moduleKey = response.data.key;
        }
      }); 

      getPermissions(idModule);
    }

    function getModuleForm(idModule) {
      httpService.getModule(idModule).then(function(response) {
        ctrl.moduleForm = response.data;
        ctrl.templates = response.data.templates;

        getPermissions(idModule);
      }); 

    }

    function getModule(idModule){
      return httpService.getModule(idModule);
    }

    function getModuleIdByKey(key){
      var id;

      ctrl.apps.forEach(function(app){
        app.modules.forEach(function(mod){
          if (mod.key == key) {
            id = mod.id;
          }
        });
      });

      return id;
    }

    function getModuleKeyById(id){
      var key;

      ctrl.apps.forEach(function(app){
        app.modules.forEach(function(mod){
          if (mod.id == id) {
            key = mod.key;
          }
        });
      });

      return key; 
    }

    function getEntitiesByModule(idModuleForm) {
      return httpService.getEntities(idModuleForm).then(function(response) {
        ctrl.entities = response.data;
        return response;
      });
    }

    function getFieldsByEntity(entityName){
      var entityId;

      ctrl.entities.forEach(function(entity, index){
        if (entity.name == entityName) {
          entityId = entity.id;
        } 
      });

      return httpService.getEntity(entityId || entityName).then(function(response) {
        var entity = response.data;
        entity.entitiesReference = {};

        entity.references.forEach(function(ref, index){
          var titleEntityReference = $l10n.translate( 'label.'.concat( ref.entity.toLowerCase() ) ),
              titleFieldReference = $l10n.translate( 'label.'.concat( ref.entity.toLowerCase() ).concat('.'.concat(ref.field.toLowerCase()) ));

          ref.label = titleFieldReference.concat(' (').concat(titleEntityReference).concat(')');

          getEntity(ref.entity).then(callback.bind(null, ref));

          function callback(ref, entity){
            ctrl.entityForm.entitiesReference[ref.entity.toLowerCase()] = entity;
          };
        });

        entity.attributes = entity.attributes.concat(AUDIT_FIELDS);

        entity.attributes.forEach(function(field, index){
          field.icon = fieldIconsService.setIconForTypeField(field);

          if(field.auditField){
            field.translatedName = $l10n.translate(field.label);
          }else{
            var label = 'label.'.concat(ctrl.jsonModel.dataSource.key).concat('.').concat(field.name).toLowerCase();
            field.translatedName = $l10n.translate(label);
          }
        });

        ctrl.entityForm = entity;
      });
    }

    function getEntityForms(entityName){
      var entityId = ctrl.entities.filter(function(e){return e.name === entityName; })[0].id;

      return httpService.getEntity(entityId).then(function(response){
        ctrl.entityForms = response.data.forms.filter(function(form){ return form.type == 'v2'});
      }); 
    }

    function getEntityFormsByBind(bind){
      var ref = ctrl.entityForm.references.filter(function(ref){ return ref.alias == bind})[0];
      getEntityForms(ref.entity);
    }

    function getEntity(entityName){
      return httpService.getEntity(entityName).then(function(response){return response.data});
    }

    function setFinder(entityName, model, isSection){
      return getEntity(entityName).then(function(entity){
              model.entity = entity;
              model.references = getReferences(entity);
              ctrl.entityForms = entity.forms.filter(function(form){ return form.type == 'v2'});

            }).then(function(){
              getFinders(model.finder.entityName).then(function(){

                if ((ctrl.finders && ctrl.finders.length == 1)) {
                  var finder = ctrl.finders[0];

                  if(isSection){
                    model && (model.finder.relatedFinders = [{title: finder.title, key: finder.key}]);
                  }else{
                    model && (model.finder.key = finder.key);
                    getFinder(model.finder.entityName, finder.key);
                  }
                }

                if(isSection){
                  ctrl.finders.forEach(function(finder, index){
                    if(model.finder.relatedFinders && model.finder.relatedFinders.filter(function(f){ return f.key == finder.key}).length){
                      finder.checked = true; 
                    } 
                  });
                }

              });
            });
    }

    function setFinderForField(entityName, model){
      setFinder(entityName, model, false).then(function(){

      });
    }

    function selectEntityFinder(entityName, model, isSection){
      if(!entityName){return};
      model.finder && model.finder.relatedFinders && (model.finder.relatedFinders.length = 0);
      setFinder(entityName, model, isSection);
    }

    function selectDataSourcetype(type){
      switch(type){
        case 'S':
          !ctrl.fieldEdit.serviceSource && (ctrl.fieldEdit.serviceSource = {});
          if(ctrl.moduleEntity && Object.keys(ctrl.moduleEntity).length){
            getSources(getModuleIdByKey(ctrl.moduleEntity.key), ctrl.fieldEdit.serviceSource);
          };
          filterSelectFields(ctrl.fieldEdit);
          break;
      }
    }

    function getModuleTemplates(moduleId){
      getModule(moduleId).then(function(response){
        ctrl.moduleEntity = response.data;
      });
    }

    function getSources(idModule, model){
      ctrl.moduleEntity = getModuleFromApps(idModule);
      model? model.moduleKey = ctrl.moduleEntity.key : false;

      getModule(idModule).then(function(response){
        var moduleEntitySources = [];

        angular.forEach(response.data.sources, function(source, key){
          moduleEntitySources = moduleEntitySources.concat(source);
        });

        ctrl.moduleEntitySources = moduleEntitySources;
      });
    }

    function showConfigForm(form) {
      var configForm = {
        key: form.key,
        label: form.label, 
        dataSource: form.dataSource,
        moduleKey: form.moduleKey,
        template: form.template,
        permissions: form.permissions,
        description: form.description
      };

      ctrl.apps.forEach(function(app, index){
        if (app.modules) {
          app.modules.forEach(function(mod, index){
            if (mod.key == form.moduleKey || mod.id == form.moduleId) {
              ctrl.moduleForm = mod;
              configForm.moduleKey = mod.key;
            }

            if (mod.key == form.dataSource.moduleKey || mod.id == form.dataSource.moduleId) {
              ctrl.moduleEntity = mod;
              configForm.dataSource.moduleKey = mod.key;
            }
          });  
        }
      });

      if(ctrl.moduleEntity){
        getPermissions(ctrl.moduleEntity.id);
        getEntitiesByModule(ctrl.moduleEntity.id);
      }

      delete form.moduleId;
      delete form.dataSource.moduleId;

      ctrl.configForm = configForm;
      ctrl.onConfigForm = true;
    }

    function saveConfigForm() {
      getFieldsByEntity(ctrl.configForm.dataSource.key);
      setBreadcrumb(ctrl.jsonModel.views.edit.breadcrumb, ctrl.configForm.dataSource.key);

      if(ctrl.configForm.permissions){
        ctrl.jsonModel.permissionId = ctrl.permissions.filter(function(p){ return p.key == ctrl.jsonModel.permissions})[0].id;
      }
      
      ctrl.moduleForm.key && (ctrl.configForm.moduleKey = ctrl.moduleForm.key);
      ctrl.moduleForm.key && (ctrl.configForm.dataSource.moduleKey = ctrl.moduleEntity.key);

      angular.extend(ctrl.jsonModel, ctrl.configForm);
      ctrl.onConfigForm = false;
    }

    function cancelConfigForm() {
      ctrl.configForm = {};
      ctrl.onConfigForm = false; 
    }

    function cancelCreateButton() {
      angular.extend(ctrl.editBt, {});
      showComponents();
    }

    function setDisplayConfig(type, expression) {
      if ( (!type && !expression) || type == 'default') {return undefined}

      var config;

      if (type == 'map' || type == 'function') {
        config = {
          type: type,
          expression: expression
        };
      }else{
        config = {
          "type": "boolean",
          "expression": type == 'true'? true : false
        }
      }
      return config;
    }

    function setDisplayConfigForEdit(config, keyType, keyExpression) {
      var result = {};

      if (!config) {return result};

      if (config.type == 'boolean') {
        result[keyType] = config.expression.toString();
      }else{
        result[keyType] = config.type;
        result[keyExpression]= config.expression;
      }

      return result;
    }

    function goToList(forceReload) {
      var promise; 

      if (idForm) {
        promise = $state.go('^.edit-view-list', {id: idForm}, {reload: forceReload});
      }else{
        promise = $state.go('forms.new-view-list', {});
      }

      promise.then(function(){
        setCurrentViewFlag();
      });
    }

    function goToEdit(idForm, forceReload) {
      var promise;

      if(idForm){
        promise = $state.go('^.edit-view-edit', {id: idForm}, {reload: forceReload});
      }else{
        promise = $state.go('forms.new-view-edit');
      }

      promise.then(function(){
        setCurrentViewFlag();
      });
    }

    function generateForm() {
      if (ctrl.jsonModel.fields.length) {
        var confirm = window.confirm('Ao gerar um novo formulário, o atual será apagado. Deseja realmente fazer isto?');   
      }

      if (ctrl.jsonModel.fields.length && !confirm) {
        return false; 
      }

      httpService.generateForm(ctrl.configForm.dataSource.entityId).then(function(form){
        ctrl.jsonModel = form;
        ctrl.onConfigForm = false;

        buildSections(ctrl.jsonModel);
      });
    }

    function setBreadcrumb(formBreadcrumb, entityName) {
      if(!entityName){return}

      var path = $l10n.translate('label.'.concat(entityName.toLowerCase()).concat('.path')),
          breadcrumb = {};

      if(formBreadcrumb.length){
        breadcrumb.path = formBreadcrumb[0].path;
        breadcrumb.bind = formBreadcrumb[1] && formBreadcrumb[1].bind? formBreadcrumb[1].bind : '';
      }else{
        breadcrumb.path = path;
        breadcrumb.bind = '';
      }

      ctrl.breadcrumb = breadcrumb;
    }

    function setBreadcrumbOnForm(){
      var bind = {bind: ctrl.breadcrumb.bind},
          path = {path: ctrl.breadcrumb.path};

      return [path, bind]; 
    }

    function getPermissions(moduleId){
      httpService.getPermissions(moduleId).then(function(response){
        ctrl.permissions = angular.copy(response.data); 
      });
    }

    function setCurrentViewFlag(){
      var view = $state.current.name.match('view-edit')? 'edit' : 'list';
      ctrl.currentView = view;
    }

    function settingsDragNDrop(){
      dragulaService.options($scope, 'buttons-edit', {
        copySortSource: true,
        copy: function(el, container){
          return container.id == 'buttons-component';
        },
        revertOnSpill: true
      });

      dragulaService.options($scope, '1col-bag', {
        copySortSource: true
      });

      $scope.$on('buttons-edit.drop-model', function(e, el){
        mapAddedButtons(ctrl.jsonModel.views.edit.actions, 'edit');          
      });
    }

    function codeView(){
      var url = '/forms/inpaas.devstudio.forms.CreateFormv2/'.concat(ctrl.jsonModel.id);
      window.open(url);
    }

    function completeKeyForm(){
      if(idForm){return}
      ctrl.configForm.key = ctrl.moduleForm.key.concat('.').concat(sanitizeKeyForm(ctrl.configForm.label));
    }

    function sanitizeKeyForm(string){
      string = Helpers.replaceAccentChars(string);
      string = Helpers.removeSpace(string);
      string = Helpers.removeSpecialChars(string);
      return string.toLowerCase();
    }

    function formPreview(){
      var url = '/forms-v2/'.concat(ctrl.jsonModel.key).concat('/'),
          href = window.location.href;

      if(href.indexOf('embed=true') != -1){
        var resourceId = href.split('row-id=').pop();
        resourceId = resourceId != 'undefined'? resourceId : 'new';

        window.location = url.concat(resourceId);
      }else{
        window.open(url.concat('new'));
      }
    }

    function filterSelectFields(fieldEdit){
      var selectFields = [];

      ctrl.sections.forEach(function(section){
        selectFields = selectFields.concat(section.fieldsCol1.filter(getSelectField));
        selectFields = selectFields.concat(section.fieldsCol2.filter(getSelectField));
        selectFields = selectFields.concat(section.fieldsCol3.filter(getSelectField));
      });

      ctrl.selectFields = selectFields;

      function getSelectField(field){
        return field.meta.type == 'select' && field.meta.bind != fieldEdit.meta.bind;
      } 
    }

    function openFormTab(includeSection){
      if (window.parent.fn_open_form_tab) {
        window.parent.fn_open_form_tab(includeSection.id, includeSection.name, 'v2');
      }else{
        window.open('/forms/studiov2.forms.main#/forms/'.concat(includeSection.id));
      }
    }

    function selectFinder(finder){
      !ctrl.currentSection.finder.relatedFinders && (ctrl.currentSection.finder.relatedFinders = []);

      if(finder.checked){
        ctrl.currentSection.finder.relatedFinders.push({key: finder.key, title: finder.title});
      }else{
        ctrl.currentSection.finder.relatedFinders.forEach(function(_finder, index){
          if(_finder.key == finder.key && _finder.title == finder.title){
            ctrl.currentSection.finder.relatedFinders.splice(index, 1);
          }
        });
      }
    }

    function selectExtension(fileType){
      !ctrl.fieldEdit.fileTypes && (ctrl.fieldEdit.fileTypes = []);

      if(fileType.checked){
        ctrl.fieldEdit.fileTypes.push(fileType.name);
      }else{
        ctrl.fieldEdit.fileTypes.forEach(function(name, index){
          if(name == fileType.name){
            ctrl.fieldEdit.fileTypes.splice(index, 1);
          }
        });
      }
    }

    function showSourcesJs(){
      var modalInstance = $uibModal.open({
        templateUrl: 'sources.html',
        controller: 'sourcesController',
        controllerAs: 'ctrl',
        resolve: {
          sources: function(){
            var sources = ctrl.currentSection.views.edit.sources;
            return (sources && sources.js? sources.js : ['']);
          }
        }
      }); 

      modalInstance.result.then(function(result){
        angular.extend(ctrl.currentSection.views.edit, {sources: {js: result}});
      });
    }

    function parseNumber(str){
      str = (str + '').replace(/[^\d,.-]/g, '')    // just digits, separators and sign
      var sign = str.charAt(0) === '-' ? '-' : '+' // store sign
      var minor = str.match(/[.,](\d+)$/)          // filter decimals
      str = str.replace(/[.,]\d*$/, '').replace(/\D/g, '')      // remove decimals and any integer separator
      return Number(sign + str + (minor ? '.' + minor[1] : '')) // build number
    } 

    angular.extend(ctrl, {
      TIME_FORMAT_PATTERNS: TIME_FORMAT_PATTERNS,
      ICONS: ICONS,
      ACTIONS: ACTIONS,
      addedButtons: {edit: {}, list: {}},
      onComponents: true,
      sections: [],
      addButton: addButton,
      saveEditField: saveEditField,
      addField: addField,
      setTypeField: setTypeField,
      editField: editField,
      cancelEditField: cancelEditField,
      addNewSection: addNewSection,
      saveSection: saveSection,
      editSection: editSection,
      selectSection: selectSection,
      cancelEditSection: cancelEditSection,
      showTypeFields: showTypeFields,
      showConfigBt: showConfigBt,
      editButton: editButton,
      saveEditButton: saveEditButton,
      openModalForConfig: openModalForConfig,
      addMapToBt: addMapToBt,
      cancelCreateButton: cancelCreateButton,
      removeBt: removeBt,
      showComponents: showComponents, 
      saveForm: saveForm,
      showConfigForm: showConfigForm,
      saveConfigForm: saveConfigForm,
      cancelConfigForm: cancelConfigForm,
      getEntitiesByModule: getEntitiesByModule,
      getFieldsByEntity: getFieldsByEntity,
      getModuleEntity: getModuleEntity,
      getModuleForm: getModuleForm,
      getModuleForms: getModuleForms,
      getModuleFromApps: getModuleFromApps,
      getFinders: getFinders,
      getFinder: getFinder,
      getSources: getSources,
      getEntityForms: getEntityForms,
      getEntity: getEntity,
      goToList: goToList,
      goToEdit: goToEdit,
      generateForm: generateForm,
      removeField: removeField,
      codeView: codeView,
      completeKeyForm: completeKeyForm,
      sanitizeKeyForm: sanitizeKeyForm,
      deleteForm: deleteForm,
      formPreview: formPreview,
      removeSection: removeSection,
      getEntityAndSetReferences: getEntityAndSetReferences,
      getEntityFormsByBind: getEntityFormsByBind,
      openFormTab: openFormTab,
      moveSection: moveSection, 
      getModuleTemplates: getModuleTemplates,
      selectEntityFinder: selectEntityFinder,
      selectFinder: selectFinder,
      setFinder: setFinder,
      setFinderForField: setFinderForField,
      selectDataSourcetype: selectDataSourcetype,
      selectExtension: selectExtension,
      showSourcesJs: showSourcesJs,
      getReferenceFk: getReferenceFk
    }); 
  };
})();