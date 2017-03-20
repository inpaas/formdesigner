/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
 
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);

  FormEditController.$inject = ["$scope", "$rootScope", "$q", "$state", "jsonFormService", "httpService", "labelsService", "$l10n"];
  
  function FormEditController($scope, $rootScope, $q, $state, jsonFormService, httpService, labelsService, $l10n) {
    var ctrl = this,
        jsonModel,
        idForm = $state.params.id,
        idModule = window.location.hash.split('module=')[1];

    angular.extend(ctrl, {
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
      addMapToBt: addMapToBt,
      cancelCreateButton: cancelCreateButton,
      removeBt: removeBt,
      addCustomButton: addCustomButton,
      showComponents: showComponents, 
      saveForm: saveForm,
      showConfigForm: showConfigForm,
      saveConfigForm: saveConfigForm,
      cancelConfigForm: cancelConfigForm,
      saveVisibleMap: saveVisibleMap,
      addVisibleMap: addVisibleMap,
      editVisibleMap: editVisibleMap,
      removeVisibleMap: removeVisibleMap,
      getEntitiesByModule: getEntitiesByModule,
      getFieldsByEntity: getFieldsByEntity,
      getModule: getModule,
      goToList: goToList,
      goToEdit: goToEdit,
      generateForm: generateForm,
      removeField: removeField,
      bindFieldOnBreadcrumb: bindFieldOnBreadcrumb,
      enableSelectFieldToBreadcrumb: enableSelectFieldToBreadcrumb,
      currentEntity: {}
    });    

    init(); 
    getWatchers();

    function init() {
      getJsonForm(idForm)
        .then(function(response){
          ctrl.jsonModel = angular.copy(response);

          if ($state.is('forms.new-view-edit') && !ctrl.jsonModel.dataSource.key) {
            showConfigForm(true);
          }

          buildMainSection(ctrl.jsonModel);
          buildFields(ctrl.jsonModel.fields);
          getDependents();

          if (ctrl.jsonModel.dataSource.key) {
            getEntitiesByModule(idModule).then(function(response){
              getFieldsByEntity(ctrl.jsonModel.dataSource.key);
            });
          }
        }).then(function(){
          if (window.location.hash.match('module')){
            var moduleId = window.location.hash.split('?module=').pop();
            getModule(moduleId);
          }
        })
        .then(function(){
          getPermissions(idModule);
        });
    }

    function getJsonForm(id){
      if (id) {
        return httpService.getForm(id); 
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

    function addButton(view, actionName) {
      editButton(view, undefined, actionName);   
    }

    function addCustomButton() {
      editButton('', undefined, 'custom');
    }

    function editButton(view, index, actionName) {
      var action;

      if (!angular.isUndefined(index)) {
        action = ctrl.jsonModel.views[view].actions[index]; 
        action.btCustom = (action.action.indexOf('custom') != -1);
        action.index = index;
        action.mapExpression = [];

        if (action.visible) {
          action.visibility = true;
          action.visibilityType = action.visible.type;

          if (action.visible.type == 'map') {
            angular.forEach(action.visible.expression, function(value, key){
              action.mapExpression.push({prop: key, value: value});
            });

          }else if(action.visible.type == 'function'){
            action.fnExpression = action.visible.expression;
          }else{
            action.booleanExpression = action.visible.expression;
          }
        }

        if (action.event) {
          editBt.setEvent = true;
        }

      }else{
        action.action = actionName;
        action.mapExpression = [];
        action.btCustom = (actionName.indexOf('custom') != -1);
      }

      action.view = view;
      ctrl.editBt = action;
      showConfigBt();
    } 

    function saveEditButton() {
      var clone = angular.copy(ctrl.editBt), 
          action = {};

      action.name = clone.name || clone.label.toLowerCase().replace(/\s/g, '-');

      setVisibilityConfig();
      setEventConfig();
      
      if (!angular.isUndefined(clone.index)) {
        var bt = ctrl.jsonModel.views[clone.view].actions[clone.index];
        angular.extend(bt, clone);
      }else{
        ctrl.jsonModel.views[clone.view].actions.push(clone); 
      }

      showComponents();

      function setVisibilityConfig() {
        if (clone.visibility && clone.visibilityType === 'map') {
          action.visible = {
            type: 'map',
            expression: {}
          };

          clone.mapExpression.forEach(function(item, index){
            angular.extend(action.visible.expression, item);
          });

        }else if(clone.visibility && clone.visibilityType === 'function'){
          action.visible = {
            type: 'function',
            expression: clone.fnExpression
          };
        };
      }

      function setEventConfig() {
        if (clone.setEvent) {
          action.event = {
            method: clone.method,
            sourceKey: clone.sourceKey
          }
        }
      }

    }

    function addMapToBt(name, value) {
      var expression = {};
      expression[name] = value;
      ctrl.editBt.map.push(expression);
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
          break;
        case 'select':
          setTypeSelect();
          break;
      }

      showEditField();

      function setTypeCheckbox(){
        if(ctrl.fieldEdit.rawEntityField.domains){
          ctrl.fieldEdit.dataSourceType = 'D';
        }else{
          findReferences(ctrl.fieldEdit);
        }
      }

      function setTypeSelect(){
        if(ctrl.fieldEdit.rawEntityField.domains){
          ctrl.fieldEdit.meta.options = ctrl.fieldEdit.rawEntityField.domains;
        }else{
          findReferences(fieldForm);
        }
      }
    } 

    function findReferences(fieldForm){
      ctrl.currentEntity.references.forEach(function(ref, index){
        if (ref.field === fieldForm.entityName) {
          fieldForm.dataSource = {
            type: 'E',
            key: ref.entity
          }
          fieldForm.dataSourceType = 'E';
        }
      });
    }

    function saveEditField(){
      if (!ctrl.sections.length) { return false; }

      setRequiredModel(ctrl.fieldEdit);
      setDisabledModel(ctrl.fieldEdit);
      setFilterModel(ctrl.fieldEdit);
      setViewsField(ctrl.fieldEdit);
      setNameField(ctrl.fieldEdit);

      if (angular.isUndefined(ctrl.fieldEdit.id)){
        addNewField();
      }

      delete ctrl.fieldEdit.rawEntityField;
      ctrl.sectionSelected.onNewField = false;
      ctrl.fieldEdit = {};
      showComponents();
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

    function setRequiredModel(field){
      if (!field.hasOwnProperty('required')) { return false; }

      
      // field.meta.required = {
      //   type: field.requiredType,
      //   expression: field.requiredExpression
      // };

      field.meta.required = {
        type: 'boolean',
        expression: true
      }
    } 

    function setDisabledModel(field){
      if (!field.hasOwnProperty('disabled')) { return false; }

      // field.meta.disabled = {
      //   type: field.disabledType,
      //   expression: field.disabledExpression
      // }

      field.meta.disabled = {
        type: 'boolean',
        expression: field.disabled
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
              bind: bind
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
      labelsService.buildLabels(angular.copy(ctrl.jsonModel), ctrl.module.id, ctrl.module.key);

      if(idForm) {
        httpService.saveEditForm(jsonFormService.getFormWithLabels(), idForm, idModule);
      }else{
        httpService.saveNewForm(jsonFormService.getFormWithLabels(), idModule).then(function(response){
          var state = $state.current.name.replace('new', 'edit');
          $state.go(state, {id: response.data.id});
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

    function removeBt(view, index) {
      ctrl.jsonModel.views[view].actions.splice(index, 1);
    }

    function showConfigForm(firstConfig) {
      ctrl.configForm = {
        label: ctrl.jsonModel.label, 
        dataSource: ctrl.jsonModel.dataSource,
        module: ctrl.jsonModel.module,
        template: ctrl.jsonModel.template,
        description: ctrl.jsonModel.description
      };

      httpService.getApps().then(function(response){
        ctrl.apps = response.data;
      });
      
      ctrl.onConfigForm = true;   
      ctrl.firstConfig = firstConfig;
    }

    function getModule(id) {
      httpService.getModule(id).then(function(response) {
        ctrl.module = response.data;
        ctrl.entities = response.data['data-sources'];
        idModule = id;
      }); 

      getPermissions(id);
    }

    function getEntitiesByModule(idModule) {
      return httpService.getEntities(idModule).then(function(response) {
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

      ctrl.configForm.dataSource.entityId = entityId;

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

    function saveConfigForm() {
      angular.extend(ctrl.jsonModel, ctrl.configForm);
      jsonFormService.editConfigForm(ctrl.configForm);

      if (ctrl.firstConfig) {
        setBreadcrumb();
      }

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

    function editField(formField, index) {
      if(ctrl.onBindBreadcrumb){
        bindFieldOnBreadcrumb(formField.meta.bind);
        return;
      }
      
      ctrl.currentEntity.attributes.forEach(function(entityField, index){
        if(entityField.alias === formField.meta.bind){
          formField.rawEntityField = entityField;
        }
      });

      ctrl.fieldEdit = formField;
      showEditField();
    }

    function saveVisibleMap() {
      if (angular.isUndefined(ctrl.mapEdit.index)){
        ctrl.editBt.mapExpression.push(ctrl.mapEdit);
      } 

      cancelEditVisibleMap();
    }

    function editVisibleMap(map, index) {
      ctrl.mapEdit = map;
      ctrl.mapEdit.index = index; 
    } 

    function cancelEditVisibleMap() {
      ctrl.mapEdit = false;
    }

    function addVisibleMap() {
      ctrl.mapEdit = {newMap: true};
    }

    function removeVisibleMap() {
      ctrl.editBt.mapExpression.splice(1, ctrl.mapEdit.index);
      cancelEditVisibleMap();
    }

    function buildBreadcrumb() {
      if (!ctrl.jsonModel.views.edit.breadcrumb.length && !idForm) {
        var breadcrumb = ctrl.jsonModel.views.edit.breadcrumb;

        breadcrumb.push({label: ctrl.module.title}); 
        breadcrumb.push({divisor: '>'});
        breadcrumb.push({label: ctrl.jsonModel.label});
        breadcrumb.push({divisor: '>'});
        breadcrumb.push({label: 'Recurso Id'});
      }
    }

    function goToList() {
      updateFieldsOnJsonModel();
      if (idForm) {
        $state.go('^.edit-view-list', {id: idForm});
      }else{
        $state.go('forms.new-view-list');
      }
    }

    function goToEdit() {
      if(idForm){
        $state.go('^.edit-view-edit', {id: idForm});
      }else{
        $state.go('forms.new-view-edit');
      }
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
      breadcrumb.push({label: ctrl.module.title});
      breadcrumb.push({divisor: '>', firstDivisor: true});
      breadcrumb.push({label: ctrl.configForm.dataSource.key});

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
  };
})();