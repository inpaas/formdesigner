/*
 * Directive Draggable
 * studiov2.js.directives.draggable
 * 
 */
/*global require module Java logging scriptContext angular*/

(function() {
  
  angular
    .module('studio-v2')
    .directive('draggable', draggable);
  
  function draggable() {
      
      function link(scope, element){
        var el = element[0];
        
        el.draggable = true;
        el.addEventListener('dragstart', onDragstart);
        el.addEventListener('dragEnd', onDragEnd, false);
        
        function onDragstart(event){
          event.dataTransfer.effectAllowed = 'move';
          var datalist = event.dataTransfer.items;

          datalist.add(this.innerHTML, 'text/html');
          datalist.add(this.id, 'text/plain');
          this.classList.add('onDrag');
          
          return false;
        }
        
        function onDragEnd(event){
          this.classList.remove('onDrag');
          
          return false;
        }

      }
      
      return {
        link: link,
        dragCallback: '='
      }
  }
  

})();