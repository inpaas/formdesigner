(function() {
  angular
    .module("studio-v2")
    .service("jsonFormService", jsonFormService);
  
  jsonFormService.$inject = ["$q", "$filter", 'JSONMODEL'];
  
  function jsonFormService($q, $filter, JSONMODEL){
    var forms = {};

    function setJsonForm(_form){
      form = _form;
    }

    function getFormTemplate(){
      var form = angular.copy(JSONMODEL);
      return form;
    }
   
    return {
      getFormTemplate: getFormTemplate,
      setJsonForm: setJsonForm,
    };
  }
})();