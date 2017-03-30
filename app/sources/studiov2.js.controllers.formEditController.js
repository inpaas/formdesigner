/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
 
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);

  FormEditController.$inject = [
    "$scope", "$rootScope", "$q", "$state", "jsonFormService", "httpService", "labelsService", 
    "$l10n", "$uibModal", "dragulaService"
    ];
  
  function FormEditController($scope, $rootScope, $q, $state, jsonFormService, httpService, labelsService, $l10n, $uibModal, dragulaService) {
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
      getQueries: getQueries
    });    

    init(); 
    setCurrentViewFlag();
    getWatchers();
    settingsDragNDrop();

    function init() {
      getJsonForm(idForm, 0)
        .then(function(response){
          ctrl.jsonModel = angular.copy(response);
          idModuleForm = response.idModuleForm;

          if ($state.is('forms.new-view-edit') && !ctrl.jsonModel.dataSource.key) {
            showConfigForm(true);
          }

          buildMainSection(ctrl.jsonModel);
          buildFields(ctrl.jsonModel.fields);
          mapAddedButtons(ctrl.jsonModel.views.list.actions, 'list');
          mapAddedButtons(ctrl.jsonModel.views.edit.actions, 'edit');
          getDependents();

          if (ctrl.jsonModel.dataSource.key) {
            //Atualmente o id é ignorado mas mesmo assim retorna a entity certa?
            getEntitiesByModule(ctrl.jsonModel.dataSource.moduleId).then(function(response){
              getFieldsByEntity(ctrl.jsonModel.dataSource.key);
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

    function addButton(actionName) {
      var button = {
        action : actionName,
        mapExpression : [],
        btCustom : (actionName.indexOf('custom') != -1),
        view : ctrl.currentView
      };

      setAddedButton(button, ctrl.currentView);

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
    
    function setTypeField(type) {
      ctrl.fieldEdit.meta.type = type;

      switch (type){
        case 'checkbox':
          setTypeCheckbox();
          ctrl.fieldEdit.dataSource = {};
          break;

        case 'select':
          setTypeSelect();
          ctrl.fieldEdit.dataSource = {};
          break;
      }

      getAppsForField(); 

      showEditField();

      function setTypeCheckbox(){
        if(ctrl.fieldEdit.rawEntityField.domains){
          ctrl.fieldEdit.dataSource.type = 'D';
          ctrl.fieldEdit.options = ctrl.fieldEdit.rawEntityField.domains;
        }else{
          // findReferences(ctrl.fieldEdit);
        }
      }

      function setTypeSelect(){
        if(ctrl.fieldEdit.rawEntityField.domains){
          ctrl.fieldEdit.dataSource.type = 'D';
          ctrl.fieldEdit.options = ctrl.fieldEdit.rawEntityField.domains;
        }else{
          // findReferences(ctrl.fieldEdit);
        }
      }
    } 

    function getAppsForField(){
      getApps().then(function(apps){
        if (ctrl.fieldEdit.dataSource && ctrl.fieldEdit.dataSource.moduleId) {
          var id = ctrl.fieldEdit.moduleId;
          setModuleEntity(id);
        }
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

      setNameField(ctrl.fieldEdit);
      setFilterModel(ctrl.fieldEdit);
      setViewsField(ctrl.fieldEdit);

      if (ctrl.fieldEdit.visibilityType) {
        ctrl.fieldEdit.meta.visible = setDisplayConfig(ctrl.fieldEdit.visibilityType, ctrl.fieldEdit.visibilityExpression);
        delete ctrl.fieldEdit.visibilityType;
        delete ctrl.fieldEdit.visibilityExpression;
      }

      if (ctrl.fieldEdit.requiredType) {
        ctrl.fieldEdit.meta.required = setDisplayConfig(ctrl.fieldEdit.requiredType, ctrl.fieldEdit.requiredExpression);
        delete ctrl.fieldEdit.requiredType;
        delete ctrl.fieldEdit.requiredExpression;
      }

      if (ctrl.fieldEdit.disabledType) {
        ctrl.fieldEdit.meta.disabled = setDisplayConfig(ctrl.fieldEdit.disabledType, ctrl.fieldEdit.disabledExpression);
        delete ctrl.fieldEdit.disabledType;
        delete ctrl.fieldEdit.disabledExpression;
      }

      if(ctrl.fieldEdit.meta.type == 'checkbox' || ctrl.fieldEdit.meta.type == 'select'){
        configDataSource(ctrl.fieldEdit.meta);
      }
      
      delete ctrl.fieldEdit.rawEntityField;
      ctrl.sectionSelected.onNewField = false;

      if (angular.isUndefined(ctrl.fieldEdit.id)){
        addNewField();
      }else{
        var index = ctrl.fieldEdit.id;
        var field =  ctrl.jsonModel.fields[index];
        angular.extend(field, ctrl.fieldEdit);
      }

      ctrl.fieldEdit = {};
      showComponents();
    }

    function configDataSource(model){
      switch(model.dataSource.type){
        case ('D' || 'M'):
          delete model.dataSource;
          break;
        case 'E':
          delete model.options;
          break;
        case 'S':
          delete model.options;
          break;
      }
    } 

    function setNameField(field) {
      field.name = 'input'.concat(field.meta.bind);
    } 

    function setViewsField(field) {
      field.views.edit = {};
      
      if (field.viewList) {
        field.views.list = {};
      }
    }

    function setFilterModel(field) {
      if (!field.hasOwnProperty('filter')) { return false; }

      field.views.filter = {};

      if (!ctrl.jsonModel.views.filter) {
        ctrl.jsonModel.views.filter = {};
      }

    }

    function addNewField() {
      var newField = angular.copy(ctrl.fieldEdit);

      newField.id = ctrl.sectionSelected.fields.length;
      ctrl.sectionSelected.fields.push(newField);
    } 

    function setSectionSelected() {
      ctrl.sectionSelected = ctrl.sections[0]; 
    } 

    function addSection(){}
 
    function addField(entityField) {
      var bind = entityField.alias,
          fieldEdit = {
            meta: {
              bind: bind,
              maxLength: entityField.size
            },
            views: {},
            rawEntityField: angular.copy(entityField)
          }

      ctrl.fieldEdit = angular.copy(fieldEdit);

      if($state.current.url.match('view-edit')) {
        addFieldOnViewEdit(bind);
      }else{
        addFieldOnViewList(bind);
      }

      function addFieldOnViewEdit(bind){
        if (!ctrl.sections.length || (bind && findFieldOnJson(bind))){
          return false;
        }

        if(!ctrl.sectionSelected){
          autoSelectSection();
        }

        showTypeFields();

        ctrl.sectionSelected.onNewField = true;
      }

      function addFieldOnViewList(bind){
        showEditField();
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

      if(formField.dataSource && formField.dataSource.moduleId){
        setModuleEntity(formField.dataSource.moduleId);
        getQueries(formField.dataSource.key);
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
        httpService.saveEditForm(jsonFormService.getFormWithLabels(), idForm, idModuleForm);
      }else{
        httpService.saveNewForm(jsonFormService.getFormWithLabels(), idModuleForm).then(function(response){
          var state = $state.current.name.replace('new', 'edit');
          $state.go(state, {id: response.data.id}).then(function(){
            setCurrentViewFlag()
          });
        });
      }
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

    function showConfigForm(firstConfig) {
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
      ctrl.firstConfig = firstConfig;
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
        model.moduleId = response.data.id;
      }); 

      getPermissions(id);
    }

    function getModuleForm(id) {
      httpService.getModule(id).then(function(response) {
        ctrl.moduleForm = response.data;
        ctrl.templates = response.data.templates;
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

      httpService.getFieldsByEntity(entityId).then(function(response) {
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

    function saveConfigForm() {
      angular.extend(ctrl.jsonModel, ctrl.configForm);
      jsonFormService.editConfigForm(ctrl.configForm);

      if (ctrl.firstConfig) {
        setBreadcrumb();
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
      var view = $state.current.name.match('view-edit')? 'edit' : 'list';
      ctrl.jsonModel.views[view].breadcrumb[indexBreadcrumb] = {bind: fieldBind};
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

      $scope
      .$on('buttons-edit.drop', function (e, el) {
        
      });
    }
  };
})();