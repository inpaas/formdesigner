/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
    
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);
    
  FormEditController.$inject = ["$scope", "jsonForm"];
  
  function FormEditController($scope, jsonForm) {
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
      cancelEditField: cancelEditField,
      addSection: addSection,
      addNewSection: addNewSection,
      setNewSection: setNewSection,
      selectSection: selectSection,
      cancelNewSection: cancelNewSection,
      showTypeFields: showTypeFields,
      showComponents: showComponents, 
      saveForm: saveForm,
      CreateButton: CreateButton
    });
    
    jsonForm.getJsonForm().then(function(response){
      jsonModel = response.data;

      buildMainSection(jsonModel);
      buildFields(jsonModel.fields);
    });

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
    
    function addSection(){}
    
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
      ctrl.newSection.fields = [];
      ctrl.newSection.id = 'section-'.concat(ctrl.sections.length);
      ctrl.sections.push(angular.copy(ctrl.newSection));
      selectSection(ctrl.sections.length - 1);
      showComponents();
    }

    function cancelNewSection() {
      showComponents();
      angular.extend(ctrl.newSection, {});
    }
    
    function addButton(event, data){}
    
    function saveEditField(){
      if (!ctrl.sections.length) { return false; }

      if (!ctrl.fieldEdit.id) {
        addNewField();
      }

      ctrl.sectionSelected.onNewField = false;
      ctrl.fieldEdit = {};
      showComponents();
    }
    
    function addNewField() {
      var newField = angular.copy(ctrl.fieldEdit);

      newField.id = ctrl.sectionSelected.fields.length;
      ctrl.sectionSelected.fields.push(newField);
      jsonModel.fields.push(newField);
    } 

    function setSectionSelected() {
      ctrl.sectionSelected = ctrl.sections[0]; 
    } 

    function addSection(){}
 
    function setFieldEdit(type) {
      ctrl.fieldEdit = {
        type: type,
        templateType: ('/forms/studiov2.forms.fields.' + type),
        meta: {}
      }

      showEditField();
    }

    function selectSection(index) {
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
       
      console.log(jsonModel);
    }

    function showEditField() {
      ctrl.onEditField = true;
      ctrl.onNewSection = false;
      ctrl.onTypeField = false;

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
      ctrl.onTypeField = true; 
      ctrl.onComponents = false;
      ctrl.onEditField = false; 
    }
    
    function CreateButton() {
      ctrl.onComponents = false;
      ctrl.onCreateButton = true;
    }

    //call functions
    getFieldsEntitys();
    getDependents();
  };
})();