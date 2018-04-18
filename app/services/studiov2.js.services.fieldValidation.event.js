angular
  .module('studio-v2')
  .service('FieldValidationEvent', FieldValidationEvent);

function FieldValidationEvent(FieldValidationDataSource){
  this.validate = validate;
  
  function validate(field, config){
    if(config){
      validateConfig(field, config);
    }else{
      validateAllConfig(field);
    }
  }

  function validateConfig(field, config){
   if(field.sourceKey && field.functionName ||
      (!field.sourceKey && !field.functionName)){
      field.error.field_event = false;
    }
  }

  function validateAllConfig(field){
    if((!field.sourceKey && field.functionName) ||
        (field.sourceKey && !field.functionName)){
      field.error.field_event = true;

    }else{
      field.error.field_event = false;
    }
  }
}
