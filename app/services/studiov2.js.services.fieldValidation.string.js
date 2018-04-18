angular
  .module('studio-v2')
  .service('FieldValidationString', FieldValidationString);

function FieldValidationString(){
  this.validate = validate;

  function validate(field, config) {
    if(config){
      validateConfig(field, config);
    }else{
      validateAllConfig(field);
    }
  }

  function validateConfig(field, config) {
    switch(config){
      case 'regexp':
      validateRegexp(field);
    }
  }

  function validateAllConfig(field) {
    validateRegexp(field);
  }

  function validateRegexp(field){
    if(_.get(field, 'meta.pattern.regexp') != undefined && _.get(field, 'meta.pattern.regexp').length){
      try{
        new RegExp(field.meta.pattern.regexp);
        field.error.regexp = false;
      }catch(e){
        field.error.regexp = true;
      }
    }
  }
}