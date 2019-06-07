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

    function setFieldBind(level, index){
      var _field = level.selectedFinder.fields[index];
      level.finder.fieldAlias = level.entity.attributes.filter(function(field){ return field.name == _field.fieldName; })[0].alias;
    }

    function ok(){
      var levels = []; 
      me.levels.forEach(function(level){
        if(level.type == 'E' && level.finder.key && level.finder.entityName && level.finder.fieldBind){
          levels.push({
            finder: level.finder,
            type: level.type,
            bind: level.bind
          });

        }else if(level.sourceKey && level.functionName){
          levels.push({
            sourceKey: level.sourceKey,
            functionName: level.functionName,
            type: level.type,
            bind: level.bind
          });
        }
      });

      $scope.$close(levels);
    }

    angular.extend(me, {
      addLevel: addLevel,
      removeLevel: removeLevel,
      getFinder: getFinder,
      getEntity: getEntity,
      setFieldBind: setFieldBind,
      ok: ok
    })
  }
})(window);