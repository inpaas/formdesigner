(function(){
  angular
    .module('studio-v2') 
    .controller('sourcesOnloadController', sourcesOnloadController);

  function sourcesOnloadController($uibModalInstance, type, sources){
    var ctrl = this;

    ctrl.sources = sources;

    if(type == 'onclose' && !sources.length){
      ctrl.sources = [{}];
    }

    function ok(){
      if(ctrl.sourceKey && ctrl.functionName){
        ctrl.sources.push({
          sourceKey: ctrl.sourceKey, 
          functionName: ctrl.functionName
        });
      }

      if(ctrl.sources.length == 1 && !ctrl.sources[0].sourceKey){
        ctrl.sources = [];
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