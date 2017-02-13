(function(){
  angular
    .module('studio-v2') 
    .directive('breadcrumb', breadcrumb); 

  function breadcrumb(){
    function link(scope, elem, attrs){
      var divisorType;

      angular.extend(scope, {
        changeDivisor: changeDivisor,
        removeItem: removeItem,
        addItem: addItem
      });

      function changeDivisor(newDivisor){
        angular.forEach(scope.breadcrumb, function(item, index){
          if (item.divisor) {
            item.divisor = newDivisor;
            divisorType = newDivisor;
          }
        });
      }

      function setFirstDivisor() {
        for(var i = 0, length = scope.breadcrumb.length; i < length; i++){
          if (scope.breadcrumb[i].divisor) {
            scope.breadcrumb[i].firsDivisor = true; 
            break;
          }
        }
      }

      function removeItem(index){
        //Tira o label e o divisor
        if (index === (scope.breadcrumb.length - 1) ) {
          scope.breadcrumb.splice((index - 1), 2);
        }else{
          scope.breadcrumb.splice(index, 2);
        }
      }

      function addItem(){
        if (scope.breadcrumb.length > 1) {
          if (!divisorType){ setFirstDivisor(); }
          scope.breadcrumb.push({divisor: divisorType});
        }

        scope.breadcrumb.push({label: ' '});
      }

      setFirstDivisor();
    }

    return{
      link: link, 
      templateUrl: '/forms/studiov2.forms.breadcrumb',
      scope: {
        breadcrumb: '='
      }
    }
  };

})();