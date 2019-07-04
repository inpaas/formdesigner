(function(){ 
  angular
  .module('studio-v2')
  .controller('ConfigDependencies', ConfigDependencies);

ConfigDependencies.$inject = ['$uibModalInstance', 'fieldsEntityFinder', 'fieldsReference',  'fieldsEntityForm', 'dependencies'];

function ConfigDependencies($uibModalInstance, fieldsEntityFinder, fieldsReference, fieldsEntityForm, dependencies){
  var ctrl = this;
  var newDep = {
    bindForm: '',
    bindRef: ''
  };

  ctrl.dependencies = dependencies || [];
  ctrl.newDep = angular.copy(newDep);
  ctrl.ok = ok;
  ctrl.cancel = $uibModalInstance.dismiss;

  ctrl.fieldsEntityFinder = fieldsEntityFinder;
  ctrl.fieldsEntityForm = fieldsEntityForm;

  ctrl.addDependencies = function(){
    ctrl.dependencies.push(angular.copy(ctrl.newDep));
    ctrl.newDep = newDep;
  };

  function ok(){
    if(ctrl.newDep.bindForm && ctrl.newDep.bindRef){
      ctrl.dependencies.push(ctrl.newDep);
    }

    ctrl.dependencies.forEach(function(dep){
      fieldsReference.forEach(function(field){
        if(field.field == dep.fieldName){
          dep.fieldAlias = field.alias;
        }
      });
    });

    $uibModalInstance.close(ctrl.dependencies);
  }

}

})()