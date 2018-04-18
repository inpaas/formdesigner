(function() {
  angular
    .module("studio-v2")
    .service("jsonFormService", jsonFormService);
  
  jsonFormService.$inject = ["$q", "$filter", 'JSONMODEL'];
  
  function jsonFormService($q, $filter, JSONMODEL){
    var form = {},
        validations = {
          formKey: validate_formKey,
          datasource: validate_datasource
        }

    angular.extend(this, {
      validateConfigForm: validateConfigForm,
      validateAllConfigForm: validateAllConfigForm,
      getFormTemplate: getFormTemplate,
      setJsonForm: setJsonForm,
    }); 

    function setJsonForm(_form){
      form = _form;
    }

    function getFormTemplate(){
      var form = angular.copy(JSONMODEL);
      return form;
    }

    function validateConfigForm(configForm, validationKey){
      return validations[validationKey](configForm);
    }

    function validateAllConfigForm(configForm){
      validate_formKey(configForm);
      validate_datasource(configForm);
    }

    function validate_datasource(configForm){
      configForm.error.datasource = !configForm.dataSource.key;
    }

    function validate_formKey(configForm){
      configForm.error.key = !configForm.key;
    } 

  }
})();