(function(){
  angular
    .module('studio-v2') 
    .controller('sourcesController', sourcesController);

  function sourcesController($uibModalInstance, sources){
    var ctrl = this;
    ctrl.sources = [];
    sources.forEach(function(source){
      ctrl.sources.push({key: source});
    });

    function ok(){
      var result = [];

      ctrl.sources.forEach(function(source){
        result.push(source.key);
      });

      $uibModalInstance.close(result);
    };

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    };

    ctrl.ok = ok;
    ctrl.cancel = cancel;
  }
})();