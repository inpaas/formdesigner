/*eslint-env browser */
/*globals moment angular jQuery debounce*/
(function( $ ){
    
  angular
    .module("studio-v2")
    .controller("FormEditController", FormEditController);
    
  FormEditController.$inject = ["$scope", "jsonForm"];
  
  function FormEditController($scope, jsonForm) {
    var ctrl = this;
    
    angular.extend(ctrl, {
      activate: activate,
      addButton: addButton,
      addField: addField,
      addSection: addSection,
      formModel: jsonForm.getJsonForm(),
      addNewSection: addNewSection,
      data: {}
    });
    
    function activate(permissions) {
      ctrl.ready = true;
      ctrl.data["permissions"] = permissions;
    };
    
    function addButton(event, data){}
    
    function addField(){}
    
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
      ctrl.onNewSection = true; 
    } 

    //call functions
    getFieldsEntitys();
    getDependents();
    };

  
})(jQuery);