angular
.module('studio-v2')
.service('FieldValidationTime', FieldValidationTime)


function FieldValidationTime() {
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
      case 'time_formatType':
        validateFormat(field);
      break;

      case 'time_minTime':
        validateMinTime(field);
      break;

      case 'time_maxTime':
        validateMaxTime(field);
      break;
    }
  }

  function validateAllConfig(field) {
    validateFormat(field);
    validateMinTime(field);
    validateMaxTime(field);
  }

  function validateFormat(field){
    if(field.meta.format){
      field.error.time_formatType = false;

    }else{
      field.error.time_formatType = true;
    }
  }


  function validateMinTime(field){
    if(field.meta.minTime == undefined || !field.meta.minTime){
      field.error.time_minTime = field.error.time_minTimeInvalid = false;
      return;
    }

    var minTime = buildMomentTime(field.meta.minTime),
        maxTime;

    if(field.meta.maxTime){
      maxTime = buildMomentTime(field.meta.maxTime);
    }

    field.error.time_minTimeInvalid = minTime.isInvalid;

    if(maxTime && !maxTime.isInvalid && !minTime.isInvalid){
      field.error.time_minTime = (minTime.valueOf() > maxTime.valueOf());
      field.error.time_minTimeInvalid = false;
    }
  }

  function validateMaxTime(field){
    if(field.meta.maxTime == undefined || !field.meta.maxTime){
      field.error.time_maxTime = field.error.time_maxTimeInvalid = false;
      return;
    }

    var maxTime = buildMomentTime(field.meta.maxTime),
        minTime;

    if(field.meta.minTime){
      minTime = buildMomentTime(field.meta.minTime); 
    }

    field.error.time_maxTimeInvalid = maxTime.isInvalid;

    if(minTime && !minTime.isInvalid && !maxTime.isInvalid){
      field.error.time_maxTime = (maxTime.valueOf() < minTime.valueOf());
      field.error.time_maxTimeInvalid = false;
    }    
  }

  function buildMomentTime(value){
    var time = moment(),
        valueSplitted = value.replace(/\s/g, '').split(':'),
        hour = valueSplitted[0],
        min = valueSplitted[1],
        sec = valueSplitted[2];

    if(parseInt(hour) > 23 || parseInt(min) > 59 || parseInt(sec) > 59){
      time.isInvalid = true;
      return time;
    }

    time.hour(hour);
    time.minutes(min);
    time.seconds(sec);

    return time;
  }
}
