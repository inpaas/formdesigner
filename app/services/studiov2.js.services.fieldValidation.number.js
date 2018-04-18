angular
.module('studio-v2')
.service('FieldValidationNumber', FieldValidationNumber)


function FieldValidationNumber() {
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
      case 'number_minCount':
        validateMinCount(field);
      break;

      case 'number_maxCount':
        validateMaxCount(field);
      break;
    }
  }

  function validateAllConfig(field) {
    validateMinCount(field);
    validateMaxCount(field);
  }

  function validateMinCount(field){
    var minCount = field.meta.minCount,
        maxCount = field.meta.maxCount;

    if(minCount == undefined || minCount == ''){
      field.error.number_minCount = false;
      return;
    }

    if(maxCount){
      field.error.number_minCount = (Number(minCount) > Number(maxCount));
    }
  }

  function validateMaxCount(field){
    var minCount = field.meta.minCount,
        maxCount = field.meta.maxCount;

    if(maxCount == undefined || maxCount == ''){
      field.error.maxCount = false;
      return;
    }

    if(minCount){
      field.error.number_maxCount = (Number(maxCount) < Number(minCount));
    }
  }
}
