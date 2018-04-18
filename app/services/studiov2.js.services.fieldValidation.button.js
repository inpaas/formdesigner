angular
  .module('studio-v2')
  .service('FieldValidationButton', FieldValidationButton);

function FieldValidationButton() {
  this.validate = validate;

  function validate(field, config){
    if(config){
      validateConfig(field, config);

    }else{
      validateAllConfig(field);
    }
  }
  
  function validateConfig(field, config) {
    switch(config){
      case 'buttonLabel':
        validateLabel(field);
      break;

      case 'event':
        validateEvent(field);
      break;
    }
  }  

  function validateAllConfig(field){
    validateLabel(field);
    validateEvent(field);
  }

  function validateLabel(field) {
    field.error.button_buttonLabel = (!field.meta.buttonLabel && !field.meta.icon);
  }

  function validateEvent(field){
    if((!field.meta.controller && field.meta.functionName) ||
      (field.meta.controller && !field.meta.functionName) ||
      (!field.meta.controller && !field.meta.functionName)){

      field.error.button_event = true;
    }else{
      field.error.button_event = false;
    }
  }
}
