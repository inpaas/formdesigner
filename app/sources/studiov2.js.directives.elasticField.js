/*
 * Elastic Field
 * studiov2.js.directives.elasticField
 * 
 */
/*global angular require module Java logging scriptContext*/

(function(){
  angular
    .module('studio-v2')
    .directive('elasticField', elasticField);

  function elasticField() {
    function link(scope, elem, attrs){
      elem.on('keypress', elasticfield);

      function elasticfield(){
        var elem = angular.element(this);
        elem.width( elem.width() + 10 );
      }
    }    

    return{
      link: link
    }   
  }

})();