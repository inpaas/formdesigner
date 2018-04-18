angular
  .module('studio-v2')
  .service('FieldValidationCheckbox', FieldValidationCheckbox);

function FieldValidationCheckbox(FieldValidationDataSource){
  this.validate = validate;
  
  function validate(field, config){
    if(config){
      validateConfig(field, config);
    }else{
      validateAllConfig(field); 
    }
  }
  
  function validateConfig(field, config) {
    switch (config){
      case 'checkbox_options':
        validateOptions(field);
      break;
    }
  }
  
  function validateAllConfig(field) {
    if((!field.meta.checked || !field.meta.unchecked)){
      field.error.checkbox_options = true; 
    }else{
      field.error.checkbox_options = false;
    }
  }

  function validateOptions(field) {
    if((field.meta.checked && field.meta.unchecked) ||
      (!field.meta.checked && !field.meta.unchecked)){

      field.error.checkbox_options = false; 
    }
  }
}