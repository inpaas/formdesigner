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
        jsonModel,
        idForm = $state.params.id,
        idModuleForm;

    angular.extend(ctrl, {
      addedButtons: {edit: {}, list: {}},
      actions: ACTIONS,
      onComponents: true,
      data: {},
      form: {},
      sections: [],
      activate: activate,
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
      formPreview: formPreview
    });

    init();
    getApps();
    setCurrentViewFlag();
    getWatchers();
    settingsDragNDrop();

    function init() {
      getJsonForm(idForm, 0)
        .then(function(response){
          jsonFormService.setJsonForm(response);
          ctrl.jsonModel = angular.copy(response);
          idModuleForm = response.moduleId;

          getModuleForm(idModuleForm);
          buildMainSection(ctrl.jsonModel);
          mapAddedButtons(ctrl.jsonModel.views.list.actions, 'list');
          mapAddedButtons(ctrl.jsonModel.views.edit.actions, 'edit');

          if (ctrl.jsonModel.dataSource.key) {
            getEntitiesByModule(ctrl.jsonModel.dataSource.moduleId)
              .then(function(response){
                getFieldsByEntity(ctrl.jsonModel.dataSource.key).then(function(response){
                  linkColumnNameToFields();
                });
              });
          }else{
            showConfigForm();
          }
        });
    }

    function getJsonForm(id){
      if (id) {
        return httpService.getMasterForm(id, 0); 
      }else{
        return jsonFormService.getFormTemplate();
      }
    }

    function buildMainSection(form) {
      ctrl.sections.push({
        columns: form.views.edit.columns,
        fields: setFieldsToMainSection(form.fields),
        label: form.views.edit.label,
        type: 'main'
      });

      form.fields.forEach(function(field, index){
        if (field.meta.type == 'include') {
          field.type = 'include';
          ctrl.sections.push(field);
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

    function activate(permissions) {
      ctrl.ready = true;
      ctrl.data["permissions"] = permissions;
    };

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
      var section = {
            fields : [],
            newInclude: true,
            id: 'section-'.concat(ctrl.sections.length),
            type : 'include',
            meta: {
              type: 'include'
            },
            include: {
              idModuleForm: idModuleForm,
              multivalue: false,
              key : 'include-'.concat(new Date().getTime()),
              link: {},
              pagination: {
                type: 'front',
                countPerPage: 10
              }
            },
            views: {
              edit: {}
            }
          };

      ctrl.onNewSection = true;
      ctrl.currentSection = section;
      showConfigSection(); 
    } 

    function saveSection() {
      var currentSection = angular.copy(ctrl.currentSection);

      if (currentSection.type == 'include' && currentSection.finder.key) {
        currentSection.finder.dependencies = ['id'];         
        
        currentSection.finder.title = $l10n.translate(currentSection.finder.key);
      }

      if (!angular.isUndefined(ctrl.currentSection.index)) {
        angular.extend(ctrl.sections[ctrl.currentSection.index], ctrl.currentSection);
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
      ctrl.sectionSelected = ctrl.sections[0];
    }

    function editFirstSection(){
      ctrl.currentSection = ctrl.sections[0];
    }

    function editSection(index) {
      ctrl.currentSection = ctrl.sections[index];
      ctrl.currentSection.index = index;
      showConfigSection();
    }

    function selectSection(index){
      ctrl.sectionSelected = ctrl.sections[index];
    }

    function setTypeField(type, fieldEdit) {
      fieldEdit = fieldEdit || ctrl.fieldEdit;
      fieldEdit.meta.type = type;

      switch (type){
        case 'currency':
        case 'date':
          getFormatsPattern();
      }

      getAppsForField(); 
      showEditField();

    } 

    function getFormatsPattern(){
      httpService.getFormats().then(function(response){
        ctrl.formatsPattern = angular.copy(response.data);
      });
    }

    function getAppsForField(){
      getApps().then(function(apps){
        var id;
        if (ctrl.fieldEdit.dataSource && ctrl.fieldEdit.dataSource.moduleId) {
          id = ctrl.fieldEdit.dataSource.moduleId;
        }else{
          id = ctrl.jsonModel.idModuleForm;
        }

        getModuleEntity(id, ctrl.fieldEdit);
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
      var fieldEdit = ctrl.fieldEdit;

      setNameField(fieldEdit);
      setViewsField(fieldEdit);

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

      if (fieldEdit.label != fieldEdit.rawEntityField.translatedName) {
        fieldEdit.rawEntityField.translatedName = fieldEdit.label;
      }

      delete fieldEdit.rawEntityField;

      if (angular.isUndefined(fieldEdit.index)){
        addNewField();
      }else{
        ctrl.sectionSelected.fields[fieldEdit.index] = fieldEdit;
      }
      
      ctrl.sectionSelected.onNewField = false;

      ctrl.fieldEdit = {};
      showComponents();
    }

    function configDataSource(model){
      switch(model.dataSourceType){
        case 'O':
        case 'D':
          delete model.dataSource;
          break;

        case 'E':
          model.dataSource.type = model.dataSourceType;
          break; 

        case 'S':
          model.dataSource.key = model.dataSource.sourceKey;
          model.dataSource.method = model.dataSource.sourceMethod;
          delete model.dataSource.sourceKey; 
          delete model.dataSource.sourceMethod;
          break;
      }

      delete model.dataSourceType;
    } 

    function setNameField(field) {
      field.name = 'input'.concat(field.meta.bind);
    } 

    function setViewsField(field) {
      field.views.edit = {};
    }

    function addNewField() {
      var newField = angular.copy(ctrl.fieldEdit);

      newField.id = ctrl.sectionSelected.fields.length;
      if (ctrl.sectionSelected.columns != '1' && !ctrl.sectionSelected.fields.length) {
        newField.position = 'left'; 
      }

      ctrl.sectionSelected.fields.push(newField);
    } 

    function addField(entityField) {
      var fieldEdit = {
            meta: {},
            views: {}
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

      if(ctrl.currentView == 'edit') {
        addFieldOnViewEdit();
        showTypeFields();
      }else{
        addFieldOnViewList();
      }

      ctrl.fieldEdit = angular.copy(fieldEdit);

      function addFieldOnViewEdit(bind){
        if(!ctrl.sectionSelected){
          autoSelectSection();
        }
        ctrl.sectionSelected.onNewField = true;
      }

      function addFieldOnViewList(bind){
        showEditField();
      }
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

      if (entityField.type == 'Char' && entityField.size == 1 && entityField.domains.length) {
        fieldEdit.meta.checked =  'Y';
        fieldEdit.meta.unchecked = 'N';
        setTypeField('checkbox', fieldEdit);
      }

    }

    function editField($event, formField, index, section) {
      formField = angular.copy(formField);
      formField.index = index;

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

      if (!ctrl.apps) {
        getAppsForField();
      }

      if(formField.dataSource){
        formField.dataSourceType = formField.dataSource.type;
        formField.dataSource.sourceMethod = formField.dataSource.method;
        formField.dataSource.sourceKey = formField.dataSource.key;

        ctrl.moduleEntity = getModuleFromApps(formField.dataSource.moduleId);
        getQueries(formField.dataSource.key);

      }else if(formField.meta.type.match('checkbox') || formField.meta.type.match('select') ){
        formField.rawEntityField.domains? formField.dataSourceType = 'D' : formField.dataSourcetype = 'O';
      }

      if (formField.finder) {
        getFinders(formField.finder.entityName);
        getFinder(formField.finder.entityName, formField.finder.key);
        ctrl.moduleEntity = getModuleFromApps(formField.finder.moduleId);
        filterSelectFields(formField);
      }

      ctrl.sectionSelected = section;

      if (formField.meta.type.match(/date/g)) {
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
      ctrl.sectionSelected.onNewField = false;
      ctrl.fieldEdit = {};
    }

    function removeField(index) {
      if (!ctrl.sectionSelected) {
        autoSelectSection();
      }

      var field = ctrl.sectionSelected.fields.splice(index, 1);

      if (field[0].name == ctrl.fieldEdit.name) {
        showComponents();
      }
    }

    function saveForm() {
      //TODO: Rever isso com a mudança para includes de finder
      // setFormsForNewIncludes(ctrl.sections).then(function(){
      //   setFieldsOnMainForm(ctrl.jsonModel, ctrl.sections);
      // }).then(function(){
      //   setFieldsOnMainForm(ctrl.jsonModel, ctrl.sections);
      //   var forms = jsonFormService.getFormsWithLabels();
      //   angular.forEach(forms, save);
      // });

      setFieldsOnMainForm(ctrl.jsonModel, ctrl.sections);
      labelsService.buildLabels(angular.copy(ctrl.jsonModel), idModuleForm);
      var form = jsonFormService.getFormWithLabels();
      save(form);

      function save(form){
        if(form.id) {
          httpService.saveEditForm(form, form.id, idModuleForm).then(function success(response){
            Notification.success('Formulário salvo com sucesso');
          }, function error(response){
            Notification.error('O formulário não pode ser salvo. \n'.concat( $l10n.translate(response.data.message) ));
          });
        }else{
          httpService.saveNewForm(form, idModuleForm)
            .then(function(response){
              return httpService.saveEditForm(form, response.data.id, idModuleForm).then(function(response){
                ctrl.jsonModel.id = response.data.id;
                jsonFormService.editIdForm(response.data.id);
                Notification.success('Formulário salvo com sucesso');
                goToEdit(response.data.id, false);
              });
          }, function error(response){
            Notification.error('O formulário não pode ser salvo. \n'.concat( $l10n.translate(response.data.message) ));
          });
        }
      }
    }

    function deleteForm(){
      var confirm = window.confirm('Tem certeza?');

      confirm && httpService.deleteForm(idForm, idModuleForm).then(function(response){
        ctrl.configForm = {};
        ctrl.moduleForm = {};
        Notification.success('Formulário deletado')
        $state.go('forms.new-view-edit');
      }); 
    }

    function setFormsForNewIncludes(sections){
      var deferred = $q.defer(),
          promises = [];

      function callback(section, form, response){
        section.include.idForm = form.id = Number(response.data.id);
        setFieldsOnForm(section, form);
        jsonFormService.storeForms(form); 
      }

      sections.filter(function(section){ return section.newInclude; })
              .forEach(function(section){
                var form = jsonFormService.setNewForm(section.include.key),
                    thenFn = callback.bind(null, section, form),
                    promise = httpService.saveNewForm(form, section.include.idModuleForm).then(thenFn);

                promises.push(promise);
              });

      $q.all(promises).then(function(response){
          deferred.resolve();
        });

      return deferred.promise;
    }

    function setFieldsOnForm(section, form){
      section.fields.forEach(function(field){
        var _field = angular.copy(field);
        delete _field.id;
        delete _field.templateType;
        form.fields.push(_field);
      });
    }

    function setFieldsOnMainForm(form, sections){
      form.fields.length = 0;
      sections.forEach(function(section, index){
        if (section.type == 'main') {
          setFieldsOnForm(section, form);
        }else{
          var field = angular.copy(section);
          delete field.fields;
          form.fields.push(field);
        }
      });
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
      ctrl.onEdit = false;
      ctrl.onComponents = false;
      ctrl.onEditField = false; 
    }
    
    function showConfigBt() {
      ctrl.onCreateButton = true;
      ctrl.onComponents = false;
    }

    function showConfigForm() {
      ctrl.configForm = {
        key: ctrl.jsonModel.key,
        label: ctrl.jsonModel.label, 
        dataSource: ctrl.jsonModel.dataSource,
        module: ctrl.jsonModel.module,
        template: ctrl.jsonModel.template,
        description: ctrl.jsonModel.description
      };

      getPermissions(idModuleForm);

      getApps().then(function(response){
        ctrl.apps.forEach(function(app, index){
          if (app.modules) {
            app.modules.forEach(function(mod, index){
              if (mod.id == idModuleForm) {
                ctrl.moduleForm = mod;
              }

              if (mod.id == ctrl.configForm.dataSource.moduleId) {
                ctrl.moduleEntity = mod;
              }
            });  
          }
        });
      });

      ctrl.onConfigForm = true;
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
      httpService.getFinders(entityName).then(function(response){
        ctrl.finders = response.data;
      });
    }

    function getFinder(entityName, finderName){
      httpService.getFinder(entityName, finderName).then(function(response){
        ctrl.finder = response.data; 
      });
    }

    function getModuleEntity(idModule, model) {
      httpService.getModule(idModule).then(function(response) {
        ctrl.moduleEntity = response.data;
        ctrl.entities = response.data['data-sources'];
        if (model) {
          model.moduleId = response.data.id;
        }
      }); 

      //TODO: Tirar essa chamada daqui
      getPermissions(idModule);
    }

    function getModuleForm(idModule) {
      httpService.getModule(idModule).then(function(response) {
        ctrl.moduleForm = response.data;
        ctrl.templates = response.data.templates;

        if(ctrl.configForm && !ctrl.configForm.key){
          ctrl.configForm.key = ctrl.moduleForm.key;
        }

      }); 
    }
    function getModule(idModule){
      return httpService.getModule(idModule);
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

      return httpService.getFieldsByEntity(entityId).then(function(response) {
        ctrl.currentEntity = response.data;
        ctrl.data.entityFields = response.data.attributes;

        ctrl.data.entityFields.forEach(function(field, index){
          if (field.primaryKey) {
            jsonFormService.setKeyToDetails(field.alias);
          } 
          var label = 'label.'.concat(ctrl.jsonModel.dataSource.key).concat('.').concat(field.name).toLowerCase();
          field.translatedName = $l10n.hasLabel(label)? $l10n.translate(label) : field.alias;
        });
      });
    }

    function getQueries(entityName){
      var entityId;

      ctrl.entities.forEach(function(entity, index){
        if (entity.name == entityName) {
          entityId = entity.id;
        } 
      });

      httpService.getFieldsByEntity(entityId).then(function(response) {
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

    function saveConfigForm() {
      if (!ctrl.jsonModel.views.edit.breadcrumb.length) {
        setBreadcrumb();
      }

      angular.extend(ctrl.jsonModel, ctrl.configForm);
      jsonFormService.editConfigForm(ctrl.configForm);

      if(ctrl.configForm.dataSource.type == 'E' && ctrl.configForm.dataSource.key){
        getFieldsByEntity(ctrl.configForm.dataSource.key);
      }
      
      idModuleForm = ctrl.moduleForm.id;
      ctrl.onConfigForm = false;
      ctrl.moduleEntity = {};
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

        buildMainSection(ctrl.jsonModel);
        setBreadcrumb();
      });
    }

    function fieldHasFilterView(field, index, array){
      return field.views.filter;
    }

    function selectDataSourceType(){
      switch(ctrl.fieldEdit.dataSourceType){
        case 'S':
          getSources();
          break;

        case 'E':
          ctrl.fieldEdit.dataSource? ctrl.fieldEdit.dataSource : ctrl.fieldEdit.dataSource = {finder: {}};
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

      $scope.$on('buttons-edit.drop-model', function(e, el){
        mapAddedButtons(ctrl.jsonModel.views.edit.actions, 'edit');          
      });

      $scope.$on('2col-bag.drop', function(e, el){
        setPositionField(el);
      });

      $scope.$on('3col-bag.drop', function(e, el){
        setPositionField(el);
      });

      function setPositionField(el){
        var position = el.parent().attr('id').split('-').pop();
        el.scope().$parent.field.position = position;
      }
    }

    function codeView(){
      var url = '/forms/inpaas.devstudio.forms.CreateFormv2/'.concat(idForm);
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

      ctrl.sections.forEach(function(section){
        selectFields = selectFields.concat(section.fields.filter(getSelectField));
      });

      if (getSelectField(fieldEdit)) {
        selectFields.push(fieldEdit);
      }

      ctrl.selectFields = selectFields;

      function getSelectField(field){
        return field.meta.type == 'select';
      }
    }

  };
})();