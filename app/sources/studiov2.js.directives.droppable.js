/*
 * Directive Droppable
 * studiov2.js.directives.droppable
 * 
 */
/*global require module Java logging scriptContext angular*/

(function() {
  
  angular
    .module('studio-v2')
    .directive('droppable', droppable);
  
  function droppable() {
      
      function link(scope, element){
        var el = element[0];
        
        el.draggable = true;
        
        el.addEventListener('dragover', onDragOver);
        el.addEventListener('dragEnter', onDragEnter, false);
        el.addEventListener('dragLeave', onDragLeave, false);
        el.addEventListener('drop', onDrop, false);
        
        function onDragOver(event){
          event.preventDefault && event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
          this.classList.add('dragOver');
          
          return false;
        }
        
        function onDragEnter(event){
          this.classList.add('dragOver');
          return false;
        }
        
        function onDrop(event){
          event.stopPropagation && event.stopPropagation();
          var item = 'test';
          
          this.classList.remove('dragOver');
            this.innerText = (item);
            
            return false;
        }
        
        
        function onDragLeave(event){
          this.classList.remove('dragOver');
          return false;
        }
      }
      
      return {
        link: link
      }
  }
  

})();