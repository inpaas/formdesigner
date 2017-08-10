/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);

  FormEditController.$inject = [
    "$scope", "$rootScope", "$q", "$state", "jsonFormService", "httpService", "labelsService", 
    "$l10n", "$uibModal", "dragulaService", "Notification", "ACTIONS"
  ];
 
 function FormEditController($scope, $rootScope, $q, $state, jsonFormService, httpService, labelsService, $l10n, $uibModal, dragulaService, Notification, ACTIONS) {
    var ctrl = this,
        idForm = $state.params.id;

    setCurrentViewFlag();
    getWatchers();
    settingsDragNDrop();

    getApps().then(function(){
      getJsonForm(idForm, 0)
        .then(function(response){
          ctrl.jsonModel = angular.copy(response);

          if(!ctrl.jsonModel.moduleKey) {
            ctrl.jsonModel.moduleKey = getModuleKeyById(ctrl.jsonModel.moduleId);               
            delete ctrl.jsonModel.moduleId;
          } 

          if (!ctrl.jsonModel.dataSource.moduleKey) {
            ctrl.jsonModel.dataSource.moduleKey = getModuleKeyById(ctrl.jsonModel.dataSource.moduleId || response.data.moduleId);
            delete ctrl.jsonModel.dataSource.moduleId;
          }

          buildSections(ctrl.jsonModel);
          mapAddedButtons(ctrl.jsonModel.views.edit.actions, 'edit');

          if (ctrl.jsonModel.dataSource.key) {
            getEntitiesByModule(getModuleIdByKey(ctrl.jsonModel.dataSource.moduleKey) || ctrl.jsonModel.dataSource.moduleId)
              .then(function(response){
                getFieldsByEntity(ctrl.jsonModel.dataSource.key).then(function(response){
                  linkColumnNameToFields();
                });
              });
          }else{
            showConfigForm(ctrl.jsonModel);
          }
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
      ctrl.sections.push({
        fields: setFieldsToMainSection(form.fields),
        label: form.views.edit.label,
        type: 'main',
        views: form.views,
        fieldsCol1: [],
        fieldsCol2: [],
        fieldsCol3: []
      });

      form.fields.forEach(function(field, index){
        if (field.meta.type == 'include') {
          field.fieldsCol1 = [];
          field.fieldsCol2 = [];
          field.fieldsCol3 = [];

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

    function linkColumnNameToFields(){
      if(!ctrl.jsonModel.fields.length){return;}

      ctrl.data.entityFields.forEach(function(entityField){
        ctrl.sections[0].fields.forEach(function(field){
          if (entityField.alias == field.meta.bind) {
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
            event: setEventConfig()
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

            if (angular.isObject(model[modelKey]) && typeConfig == 'function') {
              value = '';
            }else{
              value = model[modelKey];
            }

            return value;
          },
          formFields: function(){return ctrl.jsonModel.fields}
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
          edit: {}
        }
      };

      showConfigSection();
    } 

    function saveSection() {
      var currentSection = angular.copy(ctrl.currentSection),
          dependencies = {};

      if (currentSection.includeType == 'list') {
        currentSection.finder.title = getFinderTitleByKey(currentSection.entity.finders, currentSection.finder.key);
        if (currentSection.dependenciesKeys && currentSection.dependenciesKeys.length) {
          currentSection.dependenciesKeys.forEach(function(key){ 
            var attr = currentSection.entity.attributes.filter(function(attr){return attr.name == key; })[0];
            var field = ctrl.data.entityFields.filter(function(field){return field.name == key; })[0];

            if (attr && field) {
              dependencies[attr.alias] = field.alias;
            } else{
              var entity = currentSection.referencesChild.filter(function(entity){ return entity.alias == ref.entity })[0];
              dependencies[attr.alias] = entity.attributes.filter(function(attr){ return attr.name == ref.field })[0].alias;
            }
          });

          delete currentSection.entity;
          delete currentSection.dependenciesKeys;
          delete currentSection.references;
          delete currentSection.referencesChild;

          currentSection.finder.dependencies = dependencies;
        }
      
      }else if(currentSection.isSameDataSource && !currentSection.jsonForm){
        currentSection.includeType = 'edit';

        var jsonForm = jsonFormService.getFormTemplate();
        jsonForm.key = ctrl.jsonModel.key.concat('.form-include-').concat( (new Date().getTime()) ),
        jsonForm.label = currentSection.label;
        jsonForm.dataSource = ctrl.jsonModel.dataSource;
        currentSection.jsonForm = jsonForm;
        currentSection.include = {
          key: jsonForm.key
        }

      }else if(currentSection.type == 'main'){
        ctrl.jsonModel.views.edit.collumns = currentSection.views.edit.collumns;
        ctrl.jsonModel.views.edit.onload = currentSection.onload? currentSection.views.edit.onload : undefined;
        ctrl.jsonModel.views.edit.onsubmit = currentSection.onsubmit? currentSection.views.edit.onsubmit: undefined;
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

      if(currentSection.type != 'main'){
        if (currentSection.meta.visible) {
          angular.extend(currentSection, setDisplayConfigForEdit(currentSection.meta.visible, 'visibilityType', 'visibilityExpression'));
        }

        if (currentSection.meta.disabled) {
          angular.extend(currentSection, setDisplayConfigForEdit(currentSection.meta.disabled, 'disabledType', 'disabledExpression'));
        }
      }
      

      if (currentSection.includeType == 'list' ) {
        getModuleEntity(getModuleIdByKey(currentSection.finder.moduleKey) || currentSection.finder.moduleId, currentSection.finder);
        getFinders(currentSection.finder.entityName);
        getEntityAndSetReferences(currentSection.finder.entityName, currentSection).then(function(entity){
          var dependencesKeys = [];

          angular.forEach(function(value, key){
            var field = ctrl.data.entityFields.filter(function(field){return field.name == value; })[0];

            if (field) {
              dependencesKeys.push(field.name);
            }
          });

          ctrl.currentSection = currentSection;
          showConfigSection();
        });
        return;
      }

      if(currentSection.includeType == 'edit' && !currentSection.isSameDataSource){
        getEntityFormsByBind(currentSection.meta.bind);
      }

      if (!currentSection.views.edit.collumns) {
        currentSection.views.edit.collumns = 1; 
      }

      if(currentSection.views.edit.onload){
        currentSection.onload = true;
      }

      if(currentSection.views.edit.onsubmit){
        currentSection.onsubmit = true;
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

    function getEntityAndSetReferences(entityName, model){
      return getEntity(entityName, model).then(function(entity){
        model.references = [];
        model.referencesChild = [];
        model.finder.formKey = entity.formKey;
        model.finder.formType = entity.formType;

        var key = entity.name.toLowerCase().concat('.all.active.desc'),
            title = $l10n.translate('label.finder.allrecords');

        entity.finders.push({key: key, title: title, entityFinder: true});

        if (model && entity) {
          entity.references.forEach(function(ref, index){
            model.references.push(ref.field);
            if (ref.entity != ctrl.jsonModel.dataSource.key) {
              getEntity(ref.entity).then(function(entity){
                model.referencesChild.push(entity);
              });
            }
          });
        }

        return entity;
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
          if (fieldEdit.rawEntityField.type == 'Char' && fieldEdit.rawEntityField.size == 1) {
            fieldEdit.dataSourceType = 'O';

            if (!fieldEdit.rawEntityField.domains) {
              fieldEdit.meta.options = {};
            }else{
              fieldEdit.meta.options = angular.copy(fieldEdit.rawEntityField.domains); 
            }

          }
          break;

        case 'checkbox':
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
      ctrl.currentEntity.references.forEach(function(ref, index){
        if (ref.field === ctrl.fieldEdit.rawEntityField.name) {
          ctrl.fieldEdit.dataSource = {
            type: 'E',
            key : ref.entity,
            moduleId: ctrl.currentEntity.id
          }
        }
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

      if (angular.isUndefined(fieldEdit.index)){
        addNewField();

      }else if(fieldEdit.col == 1){
        section.fieldsCol1[fieldEdit.index] = fieldEdit;

      }else if(fieldEdit.col == 2){
        section.fieldsCol2[fieldEdit.index] = fieldEdit;

      }else{
        section.fieldsCol3[fieldEdit.index] = fieldEdit;
      }

      delete fieldEdit.rawEntityField;
      delete fieldEdit.col;

      ctrl.fieldEdit = {};
      showComponents();
    }

    function configDataSource(model){
      switch(model.dataSourceType){
        case 'O':
        case 'D':
          delete model.dataSource;
          delete model.finder;
          break;

        case 'E':
          model.finder.moduleKey = ctrl.moduleEntity.key;
          delete model.dataSource;
          break; 

        case 'S':
          if (!model.dataSource) {
            model.dataSource = {};
          }
          model.dataSource.key = model.dataSource.sourceKey;
          model.dataSource.method = model.dataSource.sourceMethod;

          delete model.dataSource.sourceKey; 
          delete model.dataSource.sourceMethod;
          delete model.finder;
          break;
      }

      delete model.dataSourceType;
    } 

    function setNameField(field) {
      field.name = 'input'.concat(field.meta.bind);
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
        fieldEdit.meta.maxLength = entityField.size;
        fieldEdit.rawEntityField = angular.copy(entityField);
        fieldEdit.collumnName = entityField.name.toLowerCase();
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
      fieldEdit.disabledType = 'false';
      fieldEdit.disabledExpression = false;
      fieldEdit.requiredType = entityField.required? 'true' : 'false';
      fieldEdit.requiredExpression = entityField.required? true : false; 
      
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
      }

      if (!section.views.edit.collumns){
        section.views.edit.collumns = 1; 
      }

      if(ctrl.onBindBreadcrumb){
        bindFieldOnBreadcrumb(formField.meta.bind);
        return;
      }
      
      ctrl.currentEntity.attributes.forEach(function(entityField, index){
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

      }else if(formField.dataSource){
        getModuleEntity(getModuleIdByKey(formField.dataSource.moduleKey) || formField.dataSource.moduleId, formField);
        formField.dataSourceType = formField.dataSource.type;
        formField.dataSource.sourceMethod = formField.dataSource.method;
        formField.dataSource.sourceKey = formField.dataSource.key;
        formField.dataSourceType = 'E';
      }

      if(formField.meta.type.match('checkbox') || formField.meta.type.match('select') ){
        formField.rawEntityField.domains? formField.dataSourceType = 'D' : formField.dataSourcetype = 'O';
      }
      
      if(formField.meta.minDate){
        formField.meta.minDate = moment(formField.meta.minDate).format($l10n.translate(formField.meta.format.concat('.formatjs')));
      } 

      if(formField.meta.maxDate){
        formField.meta.maxDate = moment(formField.meta.maxDate).format($l10n.translate(formField.meta.format.concat('.formatjs')));
      }

      ctrl.sectionSelectedIndex = sectionIndex;

      if (formField.meta.type.match(/(date)/g)) {
        getFormatsPattern();
      }

      ctrl.fieldEdit = formField;

      showEditField();
    }

    function findFieldOnJson(bind){
      var field;

      ctrl.jsonModel.fields.forEach(function(item, index){
        if (item.meta.bind == bind) {
          field = item;
        }
      });

      return field;
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
        var form = labelsService.buildLabels(angular.copy(ctrl.jsonModel), getModuleIdByKey(ctrl.jsonModel.moduleKey) || ctrl.jsonModel.moduleId);
        save(form);

      }else{
        saveIncludeForms().then(function(responses){
          setFieldsOnMainForm(ctrl.jsonModel, ctrl.sections);
          setFieldsIncludes(ctrl.jsonModel, ctrl.sections.slice(1, ctrl.sections.length));
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
              ctrl.jsonModel.id = response.data.id;
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
        delete field.onload;
        delete field.onsubmit;

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
          form.views.edit.collumns = section.views.edit.collumns;
          setFieldsOnForm(section, form);
          form = labelsService.buildLabels(angular.copy(form), getModuleIdByKey(form.moduleKey) || form.moduleId); 

          if(form.id){
            var p = httpService.saveEditForm(form, form.id, getModuleIdByKey(form.moduleKey) || form.moduleId); 
            promises.push(p);
          }else{
            var p = httpService.saveNewForm(form, getModuleIdByKey(form.moduleKey)).then(function(response){
                      section.include.idForm = form.id = response.data.id;
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
        var finders = response.data.filter(function(f){ return f.entityFinder});

        if (!finders.length) {
          var key = 'finder.'.concat(entityName.toLowerCase()).concat('.default'),
              title = $l10n.translate('label.finder.allrecords');

          finders.push({key: key, title: title, entityFinder: true});
        }
        ctrl.finders = finders;

        return response;
      });
    }

    function getFinder(entityName, finderKey){
      return httpService.getFinder(entityName, finderKey).then(function(response){
        var finder = response.data;
        ctrl.finder = finder;
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
    }

    function getModuleForm(idModule) {
      httpService.getModule(idModule).then(function(response) {
        ctrl.moduleForm = response.data;
        ctrl.configForm.key = response.data.key;
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

      return httpService.getEntity(entityId).then(function(response) {
        ctrl.data.entityFields = response.data.attributes;
        ctrl.currentEntity = response.data;


        ctrl.currentEntity.references.forEach(function(ref, index){
          var titleEntityReference = $l10n.translate( 'label.'.concat( ref.entity.toLowerCase() ) );
          var titleFieldReference = $l10n.translate( 'label.'.concat( ref.entity.toLowerCase() ).concat('.'.concat(ref.field.toLowerCase()) ));

          ref.label = titleFieldReference.concat(' (').concat(titleEntityReference).concat(')');
        });

        ctrl.data.entityFields.forEach(function(field, index){
          var label = 'label.'.concat(ctrl.jsonModel.dataSource.key).concat('.').concat(field.name).toLowerCase();
          field.translatedName = $l10n.hasLabel(label)? $l10n.translate(label) : field.alias;
        });
      });
    }

    function getEntityForms(entityName){
      var entityId = ctrl.entities.filter(function(e){return e.name === entityName; })[0].id;

      httpService.getEntity(entityId).then(function(response){
        ctrl.entityForms = response.data.forms.filter(function(form){ return form.type == 'v2'});
      }); 
    }

    function getEntityFormsByBind(bind){
      var ref = ctrl.currentEntity.references.filter(function(ref){ return ref.alias == bind})[0];
      getEntityForms(ref.entity);
    }

    function getEntity(entityName, model, fragment){
      var entity = ctrl.entities.filter(function(e){return e.name === entityName; })[0];

      var id = (entity && entity.id)? entity.id : 0; 

      return httpService.getEntity(id).then(function(response){
        if (fragment) {
          model[fragment] = response.data[fragment]; 
        }else if(model){
          model.entity = response.data;
        }
        return response.data;
      }, function(){ return {}}); 
    }

    function getQueries(entityName){
      var entityId;

      ctrl.entities.forEach(function(entity, index){
        if (entity.name == entityName) {
          entityId = entity.id;
        } 
      });

      httpService.getEntity(entityId).then(function(response) {
        ctrl.currentQueries = response.data.queries;
      });
    }

    function getSources(idModule, model){
      if (idModule && model) {
        getModule(idModule).then(function(response){
          model.title = response.data.title;
          model.sources = [];

          angular.forEach(response.data.sources, function(source, key){
            source.forEach(function(item){ model.sources.push(item) });
          });
        });
        return;
      }

      ctrl.moduleEntitySources = [];
      angular.forEach(ctrl.moduleEntity.sources, function(source, key){
        source.forEach(function(item, index){
          ctrl.moduleEntitySources.push(item);
        });
      });
    }

    function showConfigForm(form) {
      var configForm = {
        key: form.key,
        label: form.label, 
        dataSource: form.dataSource,
        moduleKey: form.moduleKey,
        template: form.template,
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

      getEntitiesByModule(ctrl.moduleEntity.id);

      delete form.moduleId;
      delete form.dataSource.moduleId;

      ctrl.configForm = configForm;
      ctrl.onConfigForm = true;
    }

    function saveConfigForm() {
      if (!ctrl.jsonModel.views.edit.breadcrumb.length) {
        setBreadcrumb();
      }

      if(ctrl.configForm.dataSource.type == 'E' && ctrl.configForm.dataSource.key){
        getFieldsByEntity(ctrl.configForm.dataSource.key);
      }

      ctrl.jsonModel.moduleKey = ctrl.moduleForm.key;
      ctrl.jsonModel.dataSource.moduleKey = ctrl.moduleEntity.key;

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

    function buildBreadcrumb() {
      if (!ctrl.jsonModel.views.edit.breadcrumb.length && !idForm) {
        var breadcrumb = ctrl.jsonModel.views.edit.breadcrumb;

        breadcrumb.push({label: ctrl.moduleForm.title}); 
        breadcrumb.push({divisor: '>'});
        breadcrumb.push({label: ctrl.jsonModel.label});
        breadcrumb.push({divisor: '>'});
        breadcrumb.push({label: 'Recurso Id'});
      }
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
        setBreadcrumb();
      });
    }

    function selectDataSourceType(){
      switch(ctrl.fieldEdit.dataSourceType){
        case 'S':
          getSources();
          break;

        case 'E':
          ctrl.fieldEdit.finder = {};
          filterSelectFields(ctrl.fieldEdit);
      }
    }

    function setBreadcrumb() {
      var breadcrumb = [];

      breadcrumb.push({icon: 'fa fa-home'});
      breadcrumb.push({label: ctrl.moduleForm.title});
      breadcrumb.push({divisor: '>'});
      breadcrumb.push({label: ctrl.jsonModel.label});

      ctrl.jsonModel.views.edit.breadcrumb = angular.copy(breadcrumb);
      ctrl.jsonModel.views.list.breadcrumb = angular.copy(breadcrumb);
    }
    
    var indexBreadcrumb;
    function enableSelectFieldToBreadcrumb(index){
      ctrl.onBindBreadcrumb = true;
      indexBreadcrumb = index;
    }

    function bindFieldOnBreadcrumb(fieldBind){
      ctrl.jsonModel.views[ctrl.currentView].breadcrumb[indexBreadcrumb] = {bind: fieldBind};
      ctrl.onBindBreadcrumb = false;
    }
    
    function getWatchers(){
      $rootScope.$on('enableSelectFieldToBreadcrumb', function(event, indexBreadcrumb){
        enableSelectFieldToBreadcrumb(indexBreadcrumb);
      });
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
      var url = '/forms-v2/'.concat(ctrl.jsonModel.key).concat('/new');
      window.open(url);
    }

    function filterSelectFields(fieldEdit){
      var selectFields = [];

      if (fieldEdit.meta.type == 'select'){
        selectFields.push(fieldEdit);
      }

      ctrl.sections.forEach(function(section){
        if (section.fields) {
          selectFields = selectFields.concat(section.fields.filter(getSelectField));
        } 
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

    angular.extend(ctrl, {
      addedButtons: {edit: {}, list: {}},
      actions: ACTIONS,
      onComponents: true,
      data: {},
      form: {},
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
      bindFieldOnBreadcrumb: bindFieldOnBreadcrumb,
      enableSelectFieldToBreadcrumb: enableSelectFieldToBreadcrumb,
      currentEntity: {},
      getQueries: getQueries,
      selectDataSourceType: selectDataSourceType,
      codeView: codeView,
      completeKeyForm: completeKeyForm,
      sanitizeKeyForm: sanitizeKeyForm,
      deleteForm: deleteForm,
      formPreview: formPreview,
      removeSection: removeSection,
      getEntityAndSetReferences: getEntityAndSetReferences,
      getEntityFormsByBind: getEntityFormsByBind,
      openFormTab: openFormTab,
      moveSection: moveSection
    }); 
  };
})();