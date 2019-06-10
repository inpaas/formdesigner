(function(global){
  global
    .angular
    .module('studio-v2')
    .controller('ConfigLevelsController', ConfigLevelsController);

  ConfigLevelsController.$inject = ['$scope', 'levels', 'httpService'];

  function ConfigLevelsController($scope, levels, httpService){
    var me = this;

    me.levels = levels;

    if(!levels.length){
      me.levels.push({});

    }else{
      levels.forEach(function(level){
        if(level.type == 'E'){
          getEntity(level.finder.entityName, level);
          getFinder(level.finder.entityName, level.finder.key, level);
        }

        //scope pai
        var moduleid = $scope.ctrl.getModuleIdByKey(level.moduleKey);
        getModuleEntity(moduleid, level);
      });
    }


    function addLevel(){
      me.levels.push({});
    }

    function removeLevel(index){
      if(me.levels.length == 1){
        me.levels[0] = {}; 

      }else{
        me.levels.splice(index, 1);
      }
    }

    function getEntity(entityName, level){
      httpService.getEntity(entityName).then(function(response){
        level.entity = response.data;
      });
    }

    function getFinder(entityName, finderKey, level) {
      httpService.getFinder(entityName, finderKey).then(function(response){ 
        level.selectedFinder = response.data;
      });
    }

    function onChangeFinderField(level){
      level.entity.attributes.forEach(function(field, index){ 
        if(index == level.finder.fieldIndex){
          level.finder.fieldAlias = field.alias;
        }
      });
    }

    function getModuleEntity(idModule, model) {
      httpService.getModule(idModule).then(function(response) {
        model.moduleEntity = response.data;
        model.entities = response.data['data-sources'];
      });
    }

    function ok(){
      var levels = []; 
      me.levels.forEach(function(level){
        var _level = {};

        if(level.type == 'E' && level.finder.key && level.finder.entityName && level.finder.fieldAlias){
          _level.finder = level.finder;
          _level.bind = level.bind;

        }else if(level.sourceKey && level.functionName){
          _level.sourceKey = level.sourceKey;
          _level.unctionName = level.functionName;
        }

        _level.type = level.type;
        _level.bind = level.bind;
        _level.type = level.type;
        _level.moduleKey = level.moduleEntity.key;

        levels.push(_level);
      });

      $scope.$close(levels);
    }

    angular.extend(me, {
      addLevel: addLevel,
      removeLevel: removeLevel,
      getFinder: getFinder,
      getEntity: getEntity,
      setFieldBind: onChangeFinderField,
      ok: ok,
      getModuleEntity: getModuleEntity
    })
  }
})(window);