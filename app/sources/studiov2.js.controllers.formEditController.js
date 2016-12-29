/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function(){
    
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);
    
  FormEditController.$inject = ["$scope", "jsonForm"];
  
  function FormEditController($scope, jsonForm) {
    var ctrl = this;
    
    angular.extend(ctrl, {
      onComponents: true,
      data: {},
      sections: [],
      formModel: jsonForm.getJsonForm(),
      activate: activate,
      addButton: addButton,
      addFieldToSection: addFieldToSection,
      setFieldEdit: setFieldEdit,
      addSection: addSection,
      addNewSection: addNewSection,
      setNewSection: setNewSection,
      cancelNewSection: cancelNewSection,
      cancelAddField: cancelAddField,
      showTypeFields: showTypeFields,
      showComponents: showComponents
    });
    
    function activate(permissions) {
      ctrl.ready = true;
      ctrl.data["permissions"] = permissions;
    };
    
    function addButton(event, data){}
    
    function addFieldToSection(){
      ctrl.sections[0].fields.push(angular.copy(ctrl.fieldEdit));
      ctrl.fieldEdit = {};
      showComponents();
    }
    
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
      ctrl.sections.push(ctrl.newSection);
      showComponents();
    }

    function cancelNewSection() {
      showComponents();
      angular.extend(ctrl.newSection, {});
    }

    function setFieldEdit(type) {
      ctrl.fieldEdit = {
        type: type,
        templateType: ('/forms/studiov2.forms.fields.' + type),
        meta: {}
      }
      showEditField();
    }

    function cancelAddField() {
      showTypeFields();   
    }

    function showEditField() {
      ctrl.onEditField = true;
      ctrl.onNewSection = false;
      ctrl.onTypeField = false;
    }

    function showComponents() {
      ctrl.onComponents = true;
      ctrl.onNewSection = false;  
      ctrl.onNewField = false;
      ctrl.onTypeField = false;
      ctrl.onEditField = false;
    }

    function showNewSectionConfig() {
      ctrl.onNewSection = true; 
      ctrl.onComponents = false;
      ctrl.onTypeField = false; 
    } 

    function showTypeFields() {
      ctrl.onTypeField = true; 
      ctrl.onNewField = true;
      ctrl.onComponents = false;
      ctrl.onEditField = false;
    }

    //call functions
    getFieldsEntitys();
    getDependents();
  };
})();