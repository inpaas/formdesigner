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
            scope.breadcrumb[i].firstDivisor = true; 
            divisorType = scope.breadcrumb[i].divisor;
            break;
          }
        }

        if (!divisorType) {
          divisorType = '>';
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
        var last = scope.breadcrumb[scope.breadcrumb.length - 1];

        if (!last || last.divisor) {
          addLabel();
        }else if (last.label) { 
          addDivisor(); 
          addLabel();
        }

      }

      function addDivisor(){
        scope.breadcrumb.push({divisor: divisorType});
        setFirstDivisor(); 
      }

      function addLabel() {
        scope.breadcrumb.push({label: ' '});
      }
      
      function setIcon(){
        scope.breadcrumb.push({icon: 'fa fa-home'});
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