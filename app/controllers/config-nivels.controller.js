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

        if(level.moduleKey){
          //scope pai
          var moduleid = $scope.ctrl.getModuleIdByKey(level.moduleKey);
          getModuleEntity(moduleid, level);
        }
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
      return httpService.getEntity(entityName).then(function(response){
        level.entity = response.data;
      });
    }

    function onSelectEntity(entityName, level){
      getEntity(entityName, level).then(function(){ });
    }

    function setLevelsDependencies(prevLevels, nextLevel){
      var deps = [];

      prevLevels.forEach(function(prevLevel){
        if(prevLevel.type == 'E' && nextLevel.type == 'E'){
          nextLevel.entity.references.forEach(function(ref){
            if(ref.entity == prevLevel.finder.entityName){
              deps.push({
                bindForm: prevLevel.bind,
                bindRef: nextLevel.entity.attributes.filter(function(attr){ 
                  return attr.name == ref.field;
                })[0].alias
              });
            }
          });

        }else{
          deps.push(prevLevel.bind);
        }
      });

      return deps;
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

      me.levels.forEach(function(level, index){
        var _level = {}, dependencies;

        _level.type = level.type;
        _level.bind = level.bind;

        if(level.moduleEntity){
          _level.moduleKey = level.moduleEntity.key;
        }

        if(index > 0){
          dependencies = setLevelsDependencies(me.levels.slice(0, index), level);
        }

        if(level.type == 'E' && level.finder.key && level.finder.entityName && level.finder.fieldAlias){
          _level.finder = level.finder;
          _level.entity = level.entity;

          (index > 0) && (_level.finder.dependencies = dependencies);
          levels.push(_level);

        }else if(level.sourceKey && level.functionName){
          _level.sourceKey = level.sourceKey;
          _level.functionName = level.functionName;
          (index > 0) && (_level.dependencies = dependencies);
          levels.push(_level);
        }

      });

      $scope.$close(levels);
    }

    angular.extend(me, {
      ok: ok,
      addLevel: addLevel,
      removeLevel: removeLevel,
      getFinder: getFinder,
      getEntity: getEntity,
      setFieldBind: onChangeFinderField,
      getModuleEntity: getModuleEntity,
      onSelectEntity: onSelectEntity
    })
  }
})(window);