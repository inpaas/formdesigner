/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
    
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);
    
  FormEditController.$inject = ["$scope", "$stateParams", "jsonForm"];
  
  function FormEditController($scope, $stateParams, jsonForm) {
    var ctrl = this, 
        jsonModel;

    angular.extend(ctrl, {
      onComponents: true,
      data: {},
      sections: [],
      activate: activate,
      addButton: addButton,
      saveEditField: saveEditField,
      setFieldEdit: setFieldEdit,
      editField: editField,
      cancelEditField: cancelEditField,
      addSection: addSection,
      addNewSection: addNewSection,
      setNewSection: setNewSection,
      selectSection: selectSection,
      cancelNewSection: cancelNewSection,
      showTypeFields: showTypeFields,
      createButton: createButton,
      cancelCreateButton: cancelCreateButton,
      showComponents: showComponents, 
      saveForm: saveForm
    });
    
    init(); 

    function init() {
      jsonForm.getJsonForm($stateParams.id).then(function(response){
        ctrl.jsonModel = jsonModel = response;

        buildMainSection(jsonModel);
        buildFields(jsonModel.fields);
      });
    }

    function buildMainSection(formModel) {
      //Talvez seja melhor já iniciar a aplicação com a main section
      if (!formModel.fields.length) {
        return false; 
      }

      ctrl.sections.push({
        templateCol: formModel.views.edit.templateCol,
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
    
    function addButton(event, data){}
    
    function getFieldsEntitys(){
      ctrl.data.entityFields = [
        "Codigo de Tratamento",
        "Nome/Razao Social",
        "Apelido",
        "Tipo de Pessoa",
        "Genero",
        "Codigo",
        "Tipo de Publico",
        "E-mail Alternativo",
        "Telefone Comercial"
      ];
    };

    function getDependents() {
      ctrl.data.dependents = [
        "Arquivos",
        "Atividades Abertas",
        "Ativos",
        "Casos",
        "Contratos",
        "Contatos",
        "Grupos"
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
      jsonModel.fields.push(field);
    }

    function cancelNewSection() {
      showComponents();
      //Rever ao editar uma seção
      angular.extend(ctrl.newSection, {});
    }
    
    function addButton(event, data){}
    
    function saveEditField(){
      if (!ctrl.sections.length) { return false; }

      setRequiredModel(ctrl.fieldEdit);
      setDisabledModel(ctrl.fieldEdit);
      setFilterModel(ctrl.fieldEdit);

      if (!ctrl.fieldEdit.id) {
        addNewField();
      }

      ctrl.sectionSelected.onNewField = false;
      ctrl.fieldEdit = {};
      showComponents();
    }
    
    function setRequiredModel(field){
      if (!field.required) { return false; }

      
      // field.meta.required = {
      //   type: field.requiredType,
      //   expression: field.requiredExpression
      // };

      field.meta.disabled = {
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

      if (!jsonModel.views.filter) {
        jsonModel.views.filter = {};
      }

    }

    function addNewField() {
      var newField = angular.copy(ctrl.fieldEdit);

      newField.id = ctrl.sectionSelected.fields.length;

      if (ctrl.sectionSelected.type == 'main') {
        jsonModel.fields.push(newField);
      }

      ctrl.sectionSelected.fields.push(newField);
    } 

    function setSectionSelected() {
      ctrl.sectionSelected = ctrl.sections[0]; 
    } 

    function addSection(){}
 
    function setFieldEdit(type) {
      ctrl.fieldEdit = {
        templateType: ('/forms/studiov2.forms.fields.' + type),
        meta: {
          type: type
        },
        views: {}
      }

      showEditField();
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
      jsonModel.key = jsonModel.label.replace(/\s/g, '-').toLowerCase();
    }

    function showEditField() {
      ctrl.onEditField = true;
      ctrl.onNewSection = false;
      ctrl.onTypeField = false;
      ctrl.onComponents = false;

      if (!ctrl.sectionSelected) {
        setSectionSelected();
      } 

      ctrl.sectionSelected.onNewField = true;
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
      ctrl.onEdit = false;
      ctrl.onTypeField = true; 
      ctrl.onComponents = false;
      ctrl.onEditField = false; 
    }
    
    function createButton() {
      ctrl.onComponents = false;
      ctrl.onCreateButton = true;
    }

    function cancelCreateButton() {
      showComponents();
      angular.extend(ctrl.createButton, {});
    }

    function editField(field, idx) {
      console.log(field);
      ctrl.fieldEdit = field;
      showEditField();
    }

    //call functions
    getFieldsEntitys();
    getDependents();
  };
})();