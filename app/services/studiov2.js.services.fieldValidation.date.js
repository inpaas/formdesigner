angular
  .module('studio-v2')
  .service('FieldValidationDate', FieldValidationDate)

function FieldValidationDate(){
  this.validate = validate;

  function validate(field, config){
    if(config){
      validateConfig(field, config);
    }else{
      validateAllConfig(field);
    }
  }
  function validateConfig(field, config){
    switch(config){
      case 'date_formatType':
        validateFormat(field);
      break;

      case 'minDate':
        validateMinDate(field);
      break;

      case 'maxDate':
        validateMaxDate(field);
      break;
    }
  }

  function validateAllConfig(field){
    validateFormat(field);
    validateMinDate(field);
    validateMaxDate(field);
  }

  function validateFormat(field){
    field.error.date_formatType = !field.meta.format;
  }

  function validateMinDate(field){
    var minDate = moment(field.meta.minDate, field.meta.formatjs),
        maxDate = moment(field.meta.maxDate, field.meta.formatjs);

    if (field.meta.minDate && !minDate.isValid()){
      return field.error.date_minDate_invalid = true;
    }else{
      field.error.date_minDate_invalid = false;
    }

    if((field.meta.maxDate && maxDate.isValid()) && (field.meta.minDate && minDate.valueOf() > maxDate.valueOf())){
      field.error.date_minDate = true;
    }else{
      field.error.date_minDate = false;
    }
  }

  function validateMaxDate(field){
    var minDate = moment(field.meta.minDate, field.meta.formatjs),
        maxDate = moment(field.meta.maxDate, field.meta.formatjs);

    if (field.meta.maxDate && !maxDate.isValid()){
      return field.error.date_maxDate_invalid = true;
    }else{
      field.error.date_maxDate_invalid = false;
    }

    if((field.meta.maxDate && maxDate.isValid()) && (field.meta.minDate && maxDate.valueOf() < minDate.valueOf())){
      field.error.date_maxDate = true;
    }else{
      field.error.date_maxDate = false;
    }
  }
}