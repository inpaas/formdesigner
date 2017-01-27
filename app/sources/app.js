/*globals moment angular jQuery*/
(function() {
    var dependencies = [
      'ui.mask', 'ui.bootstrap', 'ngTable', 'ui-notification', 'ngFileUpload', 'ui.router',
      'angular-clipboard', 'ngSanitize', 'Localization', angularDragula(angular)
    ];

    angular
      .module('studio-v2', dependencies)
      .config(config)
      .run(run);

      function config(NotificationProvider, $stateProvider, $urlRouterProvider, $interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');

        $stateProvider
          .state('forms', {
            'url': '/forms',
            'controller': 'FormEditController',
            'controllerAs': 'ctrl',
            'templateUrl': '/forms/studiov2.forms.dashboard'
          })
          .state('forms.new-view-edit', {
            'url': '/new/view-edit',
            'views':{
              'sidebar': {
                'templateUrl': '/forms/studiov2.forms.sidebar.edit'
              },
              'view': { 
                'templateUrl': '/forms/studiov2.forms.view-edit'
              }
            }
          })
          .state('forms.new-view-list', {
            'url': '/new/view-list',
            'views':{
              'sidebar': {
                'templateUrl': '/forms/studiov2.forms.sidebar.edit'
              },
              'view': {
                'templateUrl': '/forms/studiov2.forms.view-list'
              }
            }
          })
          .state('forms.edit-form-edit', {
            'url': '/:id/view-edit',
            'views':{
              'sidebar': {
                'templateUrl': '/forms/studiov2.forms.sidebar.edit'
              },
              'view': {
                'templateUrl': '/forms/studiov2.forms.view-edit'
              }
            }
          })
          .state('forms.edit-form-list', {
            'url': '/:id/view-list',
            'views':{
              'sidebar': {
                'templateUrl': '/forms/studiov2.forms.sidebar.edit'
              },
              'view': {
                'templateUrl': '/forms/studiov2.forms.view-list'
              }
            }
          });

        $urlRouterProvider.otherwise('/forms/new/view-edit');

        // $locationProvider.html5Mode(true);
        
        NotificationProvider.setOptions({
          delay: 4000,
          startTop: 20,
          startRight: 10,
          verticalSpacing: 20,
          horizontalSpacing: 20,
          positionX: 'right',
          positionY: 'top'
        });
      }

      function run($locale, $filter) {
        $locale.NUMBER_FORMATS.DECIMAL_SEP = $filter('translate')('fieldformat.numeral.decimal_separator');
        $locale.NUMBER_FORMATS.GROUP_SEP = $filter('translate')('fieldformat.numeral.grouping_separator');
        $locale.NUMBER_FORMATS.CURRENCY_SYM = $filter('translate')('fieldformat.currency.symbol'); 
      }
})();
/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
 
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);
    
  FormEditController.$inject = ["$scope", "$q", "$state", "jsonForm", "httpService"];
  
  function FormEditController($scope, $q, $state, jsonForm, httpService) {
    var ctrl = this, 
        jsonModel;

    angular.extend(ctrl, {
      onComponents: true,
      data: {},
      sections: [],
      actions: [],
      activate: activate,
      addButton: addButton,
      saveEditField: saveEditField,
      setNewField: setNewField,
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
      getModule: getModule
    });
    
    init(); 

    function init() {
      getJsonForm()
        .then(function(response){
          ctrl.jsonModel = angular.copy(response);
          if (!$state.params.id) {
            showConfigForm();
          }
        })
        .then(function(response){
          buildMainSection(ctrl.jsonModel);
          buildFields(ctrl.jsonModel.fields);
          getDependents();
          getModule(5).then(function(response){
            buildBreadcrumb();
          });

          if (ctrl.jsonModel.dataSource.key) {
            getEntitiesByModule(5).then(function(response){
              getFieldsByEntity(ctrl.jsonModel.dataSource.key);
            });

          }

        });
    }

    function getJsonForm(){
      return jsonForm.getJsonForm($state.params.id);
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
      ctrl.fieldEdit.templateType = ('/forms/studiov2.forms.fields.' + type);
      showEditField();
    } 


    function saveEditField(){
      if (!ctrl.sections.length) { return false; }

      setRequiredModel(ctrl.fieldEdit);
      setDisabledModel(ctrl.fieldEdit);
      setFilterModel(ctrl.fieldEdit);
      setViewList(ctrl.fieldEdit);
      setNameField(ctrl.fieldEdit);

      if (angular.isUndefined(ctrl.fieldEdit.id)){
        addNewField();
      }

      ctrl.sectionSelected.onNewField = false;
      ctrl.fieldEdit = {};
      showComponents();
    }
    
    function setNameField(field) {
      field.name = 'input'.concat(field.label.replace(/\s/g, ''));
    } 

    function setViewList(field) {
      field.views.edit = {};
      
      if (field.viewList) {
        field.views.list = {};
      }    
    } 

    function setRequiredModel(field){
      if (!field.required) { return false; }

      
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
      if (!field.disabled) { return false; }

      // field.meta.disabled = {
      //   type: field.disabledType,
      //   expression: field.disabledExpression
      // }

      field.meta.disabled = {
        type: 'boolean',
        expression: true
      }

    }

    function setFilterModel(field) {
      if (!field.filter) { return false; }

      field.views.filter = {};

      if (!ctrl.jsonModel.views.filter) {
        ctrl.jsonModel.views.filter = {};
      }

    }

    function addNewField() {
      var newField = angular.copy(ctrl.fieldEdit);

      newField.id = ctrl.sectionSelected.fields.length;

      if (ctrl.sectionSelected.type == 'main') {
        ctrl.jsonModel.fields.push(newField);
      }

      ctrl.sectionSelected.fields.push(newField);
    } 

    function setSectionSelected() {
      ctrl.sectionSelected = ctrl.sections[0]; 
    } 

    function addSection(){}
 
    function setNewField(field) {
      if (!ctrl.sections.length) { return false; }

      if (ctrl.sections.length && !ctrl.sectionSelected) {
        setSectionSelected();
      }

      ctrl.fieldEdit = {
        meta: {},
        views: {}
      }

      if(field){
        ctrl.fieldEdit.meta.bind = field.alias; 
      }

      showTypeFields();

      ctrl.sectionSelected.onNewField = true;
    }

    function selectSection(index) {
      if (ctrl.sectionSelected === ctrl.sections[index]) {
        return false;
      }

      if (ctrl.sectionSelected) {
        ctrl.sectionSelected.onNewField = false;
      } 

      ctrl.sectionSelected = ctrl.sections[index];
    }

    function cancelEditField() {
      ctrl.sectionSelected.onNewField = false;
      showTypeFields();
    }

    function saveForm() {
      setJsonModel(ctrl.sections);
    }

    function setJsonModel(sections) {
      ctrl.jsonModel.key = ctrl.jsonModel.label.replace(/\s/g, '-').toLowerCase();
      console.log(JSON.stringify(ctrl.jsonModel));
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

    function showConfigForm() {
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
    }

    function getModule(id) {
      return httpService.getModule(id).then(function(response) {
        ctrl.module = response.data;
        ctrl.entities = response.data['data-sources'];
      }); 
    }

    function getEntitiesByModule(idModule) {
      return httpService.getEntities(idModule).then(function(response) {
        ctrl.entities = response.data;
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
        ctrl.data.entityFields = response.data.attributes;
      });
    }

    function saveConfigForm() {
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

    function editField(field, index) {
      ctrl.fieldEdit = field;
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
      if (!ctrl.jsonModel.views.edit.breadcrumb.length && !$state.params.id) {
        var breadcrumb = ctrl.jsonModel.views.edit.breadcrumb;

        breadcrumb.push({label: ctrl.module.title}); 
        breadcrumb.push({divisor: '>'});
        breadcrumb.push({label: ctrl.jsonModel.label});
        breadcrumb.push({divisor: '>'});
        breadcrumb.push({label: 'Recurso Id'});
      }
    }
  };
})();
(function(){
  angular
    .module('studio-v2') 
    .directive('breadcrumb', function(){
      var template = [
        '<ul class="breadcrumb">',
          '<li ng-repeat="breadcrumb">',
            '<span ng-bind="item.icon" ng-show="item.icon"></span>',
            '<span ng-bind="item.label" ng-show="item.label"></span>', 
            '<span ng-bind="item.divisor" ng-show="item.divisor"></span>', 
          '</li>',
        '</ul>'
      ].join('');

      function link(scope, elem, attrs){
      }

      return{
        link: link, 
        template: template,
        scope: {
          breadcrumb: '='
        }
      }
    });
});

/*
 * Directive Draggable
 * studiov2.js.directives.draggable
 * 
 */
/*global require module Java logging scriptContext angular*/

(function() {
  
  angular
    .module('studio-v2')
    .directive('draggable', draggable);
  
  function draggable() {
      
      function link(scope, element){
        var el = element[0];
        
        el.draggable = true;
        el.addEventListener('dragstart', onDragstart);
        el.addEventListener('dragEnd', onDragEnd, false);
        
        function onDragstart(event){
          event.dataTransfer.effectAllowed = 'move';
          var datalist = event.dataTransfer.items;

          datalist.add(this.innerHTML, 'text/html');
          datalist.add(this.id, 'text/plain');
          this.classList.add('onDrag');
          
          return false;
        }
        
        function onDragEnd(event){
          this.classList.remove('onDrag');
          
          return false;
        }

      }
      
      return {
        link: link,
        dragCallback: '='
      }
  }
  

})();
/*
 * Directive Droppable
 * studiov2.js.directives.droppable
 * 
 */
/*global require module Java logging scriptContext angular*/

(function() {
  
  angular
    .module('studio-v2')
    .directive('droppable', droppable);
  
  function droppable() {
      
      function link(scope, element){
        var el = element[0];
        
        el.draggable = true;
        
        el.addEventListener('dragover', onDragOver);
        el.addEventListener('dragEnter', onDragEnter, false);
        el.addEventListener('dragLeave', onDragLeave, false);
        el.addEventListener('drop', onDrop, false);
        
        function onDragOver(event){
          event.preventDefault && event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          this.classList.add('dragOver');
          
          return false;
        }
        
        function onDragEnter(event){
          this.classList.add('dragOver');
          return false;
        }
        
        function onDrop(event){
          event.stopPropagation && event.stopPropagation();
          this.classList.remove('dragOver');

          var dragSrcEl = document.getElementById(event.dataTransfer.getData('text/plain'));
          dragSrcEl.innerHTML = this.innerHTML;
          this.innerHTML = event.dataTransfer.getData('text/html');

          return false;
        }
        
        
        function onDragLeave(event){
          this.classList.remove('dragOver');
          return false;
        }
      }
      
      return {
        link: link,
        dropCallback: '='
      }
  }
  

})();
(function() {
  angular
    .module('studio-v2')
    .service('httpService', httpService);
  
  httpService.$inject = ['$q', '$http'];
  
  function httpService($q, $http){

    function getModule(id){
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/'.concat(id); 

      return $http({
        method: 'get',
        url: url
      });
    }

    function getApps() {
      var url = 'https://studio-v2.inpaas.com/api/studio/apps'; 

      return $http({
        method: 'get',
        url: url
      });
    }

    function getEntities(idModule) {
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/'
                  .concat(idModule)
                  .concat('/entities');

      return $http({
        method: 'get',
        url: url
      });
    }

    function getFieldsByEntity(id) {
      var url = 'https://studio-v2.inpaas.com/api/studio/entities/'.concat(id);

      return $http({
        method: 'get',
        url: url
      });
    }

    function getForm(id) {
      var url = 'https://studio-v2.inpaas.com/api/studio/modules/5/forms-v2/'.concat(id);

      return $http({
        method: 'get',
        url: url
      });
    }

    return {
      getModule: getModule,
      getApps: getApps,
      getEntities: getEntities,
      getFieldsByEntity: getFieldsByEntity,
      getForm: getForm
    }
  }

})();
/*
 * Json form model
 * studiov2.js.services.jsonjsonForm
 * 
 */
/*global require module Java logging scriptContext angular*/

(function() {
  angular
    .module('studio-v2')
    .service('jsonForm', jsonForm);
  
  jsonForm.$inject = ['$q', '$filter', 'httpService'];
  
  function jsonForm($q, $filter, httpService){
    var form = setJsonForm();
    
    function setJsonForm(){
      return resetJsonForm();
    }
    
    function editKeyForm(key) {
      form.key = key;
    }

    function editLabelForm(label) {
      form.label = label;
    }

    function editPagination(pagination) {
      angular.extend(jsonForm.pagination, pagination);
    }

    function editBreadcrumb() {
       
    } 

    function editDataSource() {
      
    }

    function editViews() {
      
    }

    function buildFields(sections, jsonModel) {
       
    }

    function getFieldsFromSection(section) {
      
    }

    function resetJsonForm(){
      return {
        'key': '', 
        'label': 'Form Title',
        'pagination': {
          'type': 'server',
          'countPerPage': 10 
        },
        'dataSource': {},
        'views': {
          'list': {
            'actions':[
              {
                'action': 'new',
                'name': 'new'
              }
            ],
            'breadcrumb': []
          },
          'edit': {
            'actions': [
              {
                'action': 'save',
                'label': $filter('translate')('button.save.title'),
                'name': 'save',
                'visible': {
                  'type': 'map',
                  'expression': {
                    'id': 23
                  }
                }              
              },
              {
                'action': 'savenew',
                'label': $filter('translate')('button.savenew.title'),
                'name': 'save_new', 
                'visible': {
                  'type': 'function', 
                  'expression': '(function (data){ console.log(data) })'
                }
              },
              {
                'action': 'duplicate',
                'label': $filter('translate')('button.duplicate.title'),
                'name': 'duplicate',
              },
              {
                'action': 'remove',
                'label': $filter('translate')('button.remove.title'),
                'name': 'remove'
              },
              {
                'action': 'cancel',
                'label': $filter('translate')('button.cancel.title'),
                'name': 'cancel'
              }
            ],
            'breadcrumb': []
          }
        },
        'fields': []
    };
  }
    
    function saveJsonForm(formId){
      
    }
    
    function getNewFormId() {
      var deferred = $q.defer();
      deferred.resolve(resetJsonForm());

      return deferred.promise;
    } 
       
    function getJsonForm(id){
      var promise;
      if (!id) {
        promise = getNewFormId();
      }else{
        promise = httpService.getForm(id).then(function(response) {
          var jsonModel = response.data;
          return JSON.parse(jsonModel.json);
        });
      }

      return promise;
    }
    
    function getActionsTypes() {
      return [
        'new',
        'list.remove',
        'list.view_edit',
        'list.custom',
        'list.modal',
        'modal',
        'custom',
        'cancel',
        'remove',
        'save',
        'save_new',
        'duplicate',
        'include.add',
        'include.row.edit'
      ]; 
    }

    return {
      editKeyForm: editKeyForm,
      editLabelForm: editLabelForm,
      editPagination: editPagination,
      editBreadcrumb: editBreadcrumb,
      editDataSource: editDataSource,
      editViews: editViews,
      buildFields: buildFields,
      saveJsonForm: saveJsonForm,
      getJsonForm: getJsonForm,
      getActionsTypes: getActionsTypes
    };
  }
})();