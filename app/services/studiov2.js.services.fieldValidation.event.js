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

    if(field.hasButton && (field.buttonEvent && !field.buttonEvent.icon)){
      field.error.event_bt_icon = true;
    }else{
      field.error.event_bt_icon = false; 
    }
  }
}