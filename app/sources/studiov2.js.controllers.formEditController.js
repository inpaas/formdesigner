/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
 
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);

  FormEditController.$inject = [
    "$scope", "$rootScope", "$q", "$state", "jsonFormService", "httpService", "labelsService", 
    "$l10n", "$uibModal", "dragulaService", "Notification"
  ];
  
  function FormEditController($scope, $rootScope, $q, $state, jsonFormService, httpService, labelsService, $l10n, $uibModal, dragulaService, Notification) {
    var ctrl = this,
        jsonModel,
        idForm = $state.params.id,
        idModuleForm;

    angular.extend(ctrl, {
      addedButtons: {edit: {}, list: {}},
      onComponents: true,
      data: {},
      form: {},
      sections: [],
      actions: [],
      activate: activate,
      addButton: addButton,
      saveEditField: saveEditField,
      addField: addField,
      setTypeField: setTypeField,
      editField: editField,
      cancelEditField: cancelEditField,
      addSection: addSection,
      addNewSection: addNewSection,
      setNewSection: setNewSection,
      selectSection: selectSection,
      cancelNewSection: cancelNewSection,
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
    setCurrentViewFlag();
    getWatchers();
    settingsDragNDrop();

    function init() {
      getJsonForm(idForm, 0)
        .then(function(response){
          ctrl.jsonModel = angular.copy(response);
          idModuleForm = response.moduleId;
          getModuleForm(idModuleForm);

          if (response.firstConfig) {
            showConfigForm();
          }

          buildMainSection(ctrl.jsonModel);
          buildFields(ctrl.jsonModel.fields);
          mapAddedButtons(ctrl.jsonModel.views.list.actions, 'list');
          mapAddedButtons(ctrl.jsonModel.views.edit.actions, 'edit');
          getDependents();

          if (ctrl.jsonModel.dataSource.key) {
            //Atualmente o id é ignorado mas mesmo assim retorna a entity certa?
            getEntitiesByModule(ctrl.jsonModel.dataSource.moduleId)
              .then(function(response){
                getFieldsByEntity(ctrl.jsonModel.dataSource.key).then(function(response){
                  linkColumnNameToFields();
                });
              });
          }
        });
    }

    function getJsonForm(id){
      if (id) {
        return httpService.getForm(id, 0); 
      }else{
        return jsonFormService.getFormTemplate();
      }
    }

    function buildMainSection(formModel) {
      //Talvez seja melhor já iniciar a aplicação com a main section
      if (!formModel.fields.length) {
        return false; 
      }

      ctrl.sections.push({
        columns: formModel.views.edit.columns,
        fields: [], 
        label: formModel.views.edit.label,
        displayLabel: true,
        type: 'main'
      });
    } 

    function buildFields(fields) {
      if (!fields.length) {
        return false; 
      }

      fields.forEach(function(field, index){
        if (field.meta.type != 'include') {
          field.id = index;
          ctrl.sections[0].fields.push(field);
        } 
      });
    }

    function linkColumnNameToFields(){
      if(!ctrl.jsonModel.fields.length){return;}

      ctrl.data.entityFields.forEach(function(entityField){
        ctrl.sections[0].fields.forEach(function(field){
          if (entityField.alias == field.meta.bind) {
            field.columnName = entityField.alias;
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

    function addButton(actionName, position) {
      var button = {
        action : actionName,
        view : ctrl.currentView
      };

      if (actionName.indexOf('custom') != -1) {
        button.btCustom = true;
        button.label = "Custom";
      }

      setAddedButton(button, ctrl.currentView);

      if(position){
        ctrl.jsonModel.views[ctrl.currentView].actions.splice(position, 0, button);
      }else{
        ctrl.jsonModel.views[ctrl.currentView].actions.push(button);
      }

      ctrl.editBt = button;
      showConfigBt();
    }

    function editButton(view, index, actionName) {
      var action;

      action = angular.copy(ctrl.jsonModel.views[view].actions[index]); 
      action.index = index;

      if (action.visible) {
        angular.extend(action, setDisplayConfigForEdit(action.visible, 'visibilityType', 'visibilityExpression'));
      }

      if (action.event) {
        action.event = action.event;
      }

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

    function getDependents() {
      ctrl.data.dependents = [
        // "Arquivos",
        // "Atividades Abertas",
        // "Ativos",
        // "Casos",
        // "Contratos",
        // "Contatos",
        // "Grupos"
      ]; 
    };
    
    function addNewSection() {
      showNewSectionConfig(); 
      ctrl.onNewSection = true;
      ctrl.newSection = {};
    } 

    function setNewSection() {
      // Formatar o jsonForm (se não tiver nenhuma é a principal mas se tiver é um include do mesmo data source)
      // setar na view a nova section
      // Mostrar o components no sidebar
      var newSection = angular.copy(ctrl.newSection);

      newSection.fields = [];
      newSection.id = 'section-'.concat(ctrl.sections.length);
      newSection.type = 'main';

      if(ctrl.sections.length){
        newSection.type = 'include';
        newSection.meta = {};
        newSection.include = {};
        addFieldInclude(newSection);
      }

      ctrl.sections.push(newSection);
      selectSection(ctrl.sections.length - 1);
      showComponents();
    }

    function addFieldInclude(field){
      ctrl.jsonModel.fields.push(field);
    }

    function cancelNewSection() {
      showComponents();
      //Rever ao editar uma seção
      angular.extend(ctrl.newSection, {});
    }
    
    function setTypeField(type, fieldEdit) {
      fieldEdit = fieldEdit || ctrl.fieldEdit;
      fieldEdit.meta.type = type;

      switch (type){
        case 'checkbox':
        case 'select':
          findDomains();
          fieldEdit.dataSource = {};

        case 'currency':
        case 'date':
          getFormatsPattern();
      }

      getAppsForField(); 

      showEditField();

      function findDomains(){
        if(fieldEdit.rawEntityField.domains){
          fieldEdit.dataSourceType = 'D';
          fieldEdit.options = fieldEdit.rawEntityField.domains;
        }     
      }
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

    function setModuleEntity(idModule){
      var result;

      ctrl.apps && ctrl.apps.forEach(function(app, index){
        if (app.modules) {
          app.modules.forEach(function(mod, index){
            if (mod.id == idModule) {
              ctrl.moduleEntity = mod;
              result = true;
            }
          });
        }
      });

      return result;
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

      fieldEdit.columnName = fieldEdit.customField? fieldEdit.meta.bind : fieldEdit.rawEntityField.name.toLowerCase();
      delete fieldEdit.rawEntityField;

      if (angular.isUndefined(fieldEdit.id)){
        addNewField();
      }else{
        var index = fieldEdit.id;
        ctrl.sectionSelected.fields[index] = fieldEdit;
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
          delete model.options;
          break; 

        case 'S':
          model.dataSource.key = model.dataSource.sourceKey;
          model.dataSource.method = model.dataSource.sourceMethod;
          delete model.options;
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
      field.views.edit = field.edit? {} : undefined;
      field.views.list = field.list? {} : undefined;
      field.views.filter = field.filter? {}: undefined;
    }

    function addNewField() {
      var newField = angular.copy(ctrl.fieldEdit);

      newField.id = ctrl.sectionSelected.fields.length;
      if (ctrl.sectionSelected.columns != '1' && !ctrl.sectionSelected.fields.length) {
        newField.position = 'left'; 
      }
      ctrl.sectionSelected.fields.push(newField);
    } 

    function setSectionSelected() {
      ctrl.sectionSelected = ctrl.sections[0]; 
    } 

    function addSection(){}
 
    function addField(entityField) {
      var fieldEdit = {
            meta: {},
            views: {}
          }

      if(entityField){
        fieldEdit.meta.bind = entityField.alias;
        fieldEdit.meta.maxLength = entityField.size;
        fieldEdit.rawEntityField = angular.copy(entityField);
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

    function editField(formField, index) {
      formField = angular.copy(formField);

      if(ctrl.onBindBreadcrumb){
        bindFieldOnBreadcrumb(formField.meta.bind);
        return;
      }
      
      ctrl.currentEntity.attributes.forEach(function(entityField, index){
        if(entityField.alias === formField.meta.bind){
          formField.rawEntityField = entityField;
        }
      });

      formField.filter = !!formField.views.filter;
      formField.list = !!formField.views.list;
      formField.edit = !!formField.views.edit;

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

        setModuleEntity(formField.dataSource.moduleId);
        getQueries(formField.dataSource.key);

      }else if(formField.meta.options){
        formField.rawEntityField.domains? formField.dataSourceType = 'D' : formField.dataSourcetype = 'O';
      }

      if (!ctrl.sectionSelected) {
        autoSelectSection(); 
      }

      if (formField.meta.type.match(/date/g)) {
        getFormatsPattern();
      }
      
      ctrl.fieldEdit = formField;
      showEditField();
    }

    function autoSelectSection(){
      ctrl.sectionSelected = ctrl.sections[0];
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
    
    function selectSection(index) {
      console.log('select section')
      if (ctrl.sectionSelected == ctrl.sections[index]) {
        return false;
      }

      if (ctrl.sectionSelected) {
        ctrl.sectionSelected.onNewField = false;
      } 

      ctrl.sectionSelected = ctrl.sections[index];
    }

    function cancelEditField() {
      showComponents();
      if (ctrl.sectionSelected) {
        ctrl.sectionSelected.onNewField = false;
      }
      ctrl.fieldEdit = {};
    }

    function removeField(index) {
      if (!ctrl.sectionSelected) {
        autoSelectSection();
      }

      ctrl.sectionSelected.fields.splice(index, 1);
    }

    function saveForm() {
      updateFieldsOnJsonModel(ctrl.sections);
      labelsService.buildLabels(angular.copy(ctrl.jsonModel), idModuleForm);

      if(idForm) {
        httpService.saveEditForm(jsonFormService.getFormWithLabels(), idForm, idModuleForm).then(function success(response){
          Notification.success('Formulário salvo com sucesso');
        }, function error(response){
          Notification.error('O formulário não pode ser salvo. \n'.concat( $l10n.translate(response.data.message) ));
        });
      }else{
        httpService.saveNewForm(jsonFormService.getFormWithLabels(), idModuleForm).then(function(response){
          Notification.success('Formulário salvo com sucesso');
          var state = $state.current.name.replace('new', 'edit');
          idForm = response.data.id;
          $state.go(state, {id: idForm}).then(function(){
            setCurrentViewFlag();
          });
        }, function error(response){
          Notification.error('O formulário não pode ser salvo. \n'.concat( $l10n.translate(response.data.message) ));
        });
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

    function updateFieldsOnJsonModel(sections) {
      setFields(ctrl.jsonModel);

      function setFields(form){
        if (!ctrl.sections.length) { return false; }

        form.fields.length = 0;

        ctrl.sections[0].fields.forEach(function(item, index){
          var clone = angular.copy(item);

          delete clone.id;
          delete clone.templateType;
          form.fields.push(clone);
        });
      }
    }
    
    function showEditField() {
      ctrl.onEditField = true;
      ctrl.onNewSection = false;
      ctrl.onTypeField = false;
      ctrl.onComponents = false;
    }

    function showComponents() {
      ctrl.onComponents = true;
      ctrl.onNewSection = false;  
      ctrl.onNewField = false;
      ctrl.onTypeField = false;
      ctrl.onEditField = false;
      ctrl.onCreateButton = false;
    }

    function showNewSectionConfig() {
      ctrl.onNewSection = true; 
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

    function getModuleEntity(id, model) {
      httpService.getModule(id).then(function(response) {
        ctrl.moduleEntity = response.data;
        ctrl.entities = response.data['data-sources'];
        if (model) {
          model.moduleId = response.data.id;
        }
      }); 

      getPermissions(id);
    }

    function getModuleForm(id) {
      httpService.getModule(id).then(function(response) {
        ctrl.moduleForm = response.data;
        ctrl.templates = response.data.templates;

        if(ctrl.configForm && !ctrl.configForm.key){
          ctrl.configForm.key = ctrl.moduleForm.key;
        }

      }); 
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

    function getSources(){
      ctrl.moduleEntitySources = [];
      angular.forEach(ctrl.moduleEntity.sources, function(source, key){
        source.forEach(function(item, index){
          ctrl.moduleEntitySources.push(item);
        });
      });
    }

    function saveConfigForm() {
      angular.extend(ctrl.jsonModel, ctrl.configForm);
      jsonFormService.editConfigForm(ctrl.configForm);

      if (ctrl.jsonModel.firstConfig) {
        delete ctrl.jsonModel.firstConfig;
        setBreadcrumb();
      }

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

    function goToList() {
      var promise; 

      updateFieldsOnJsonModel();

      if (idForm) {
        promise = $state.go('^.edit-view-list', {id: idForm});
      }else{
        promise = $state.go('forms.new-view-list');
      }

      promise.then(function(){
        setCurrentViewFlag();
      });
    }

    function goToEdit() {
      var promise;

      if(idForm){
        promise = $state.go('^.edit-view-edit', {id: idForm});
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
        buildFields(ctrl.jsonModel.fields);
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
          ctrl.fieldEdit.dataSource? ctrl.fieldEdit.dataSource : ctrl.fieldEdit.dataSource = {}
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
        copy: true,
        copySortSource: true
      });

      $scope.$on('buttons-edit.drop', function (e, el) {
        el.addClass('ng-hide');
        var positionDOM = angular.element('.page-actions').find('.btn').index(el);
        var btType = el.attr('id').split('btn-').pop();
        console.log(positionDOM)
        addButton(btType, positionDOM);
      });

      $scope.$on('2col-bag.drop', function(e, el){
        setPositionField();
      });

      $scope.$on('3col-bag.drop', function(e, el){
        setPositionField();
      });

      function setPositionField(){
        var position = el.parent().attr('id').split('-').pop();
        el.scope().$parent.field.position = position;
      }
    }

    function codeView(){
      var url = 'https://studio-v2.inpaas.com/forms/inpaas.devstudio.forms.CreateFormv2/'.concat(idForm);
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
      var url = '/forms-v2/'.concat(ctrl.jsonModel.key);
      window.open(url);
    }

  };
})();