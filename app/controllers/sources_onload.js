(function(){
  angular
    .module('studio-v2') 
    .controller('sourcesOnloadController', sourcesOnloadController);

  function sourcesOnloadController($uibModalInstance, sources){
    var ctrl = this;

    ctrl.sources = sources;

    function ok(){
      if(ctrl.sourceKey && ctrl.functionName){
        ctrl.sources.push({
          sourceKey: ctrl.sourceKey, 
          functionName: ctrl.functionName
        });
      }

      $uibModalInstance.close(ctrl.sources);
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    ctrl.ok = ok;
    ctrl.cancel = cancel;
  }
})();