(function(){
  angular
  .module('studio-v2')
  .controller('ConfigDisplayController', ConfigDisplayController)
  
  ConfigDisplayController.$inject = ['$uibModalInstance', 'expression', 'formFields', 'typeConfig']; 

  function ConfigDisplayController($uibModalInstance, expression, formFields, typeConfig){
    var $ctrl = this;
    $ctrl.formFields = formFields;
    $ctrl.key;
    $ctrl.value;
    $ctrl.typeConfig = typeConfig;

    if (typeConfig == 'map') {
      $ctrl.expression = (expression && objToArray(expression)) || [];

    }else if (typeConfig == 'options'){
      $ctrl.expression = expression? expression.forEach(function(item, index){
                            item.key = item.label;
                          }) : [];
    }else{
      $ctrl.expression = expression;
    }


    function objToArray(obj) {
      var arr = [];

      for(key in obj){
        var singleObject = {}
        singleObject.key = key;
        singleObject.value = obj[key];

        arr.push(singleObject);
      };

      return arr;
    }

    function arrayToObj(_array) {
      var map = {};

      _array.forEach(function(item, index){
        map[item.key] = item.value;
      });

      return map;
    }


    $ctrl.ok = function () {
      var result = angular.copy($ctrl.expression);

      if (typeConfig == 'map') {
        result = arrayToObj(result);
        if($ctrl.key && $ctrl.value){
          result[$ctrl.key] = $ctrl.value;
        }
      }else if(typeConfig == 'options'){
        result.forEach(function(item, index){
          item.label = item.key;
        });
      }

      $uibModalInstance.close(result);
    };

    $ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
