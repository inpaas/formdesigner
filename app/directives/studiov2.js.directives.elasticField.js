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
      elem.attr('style', 'width: '.concat(attrs.elasticField).concat('px') );
      elem.on('keydown', elasticfield);

      function elasticfield(){
        if(this.value.length > 1){
          var width = ((this.value.length + 1) * 8);
          this.style.width = width + 'px';
        }else{
          this.style.width = 130 + 'px';
        }
      }
    }    

    return{
      link: link
    }   
  }

})();