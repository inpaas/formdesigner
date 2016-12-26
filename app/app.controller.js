(function() {
  angular.module('formdesigner').controller('FormController', FormController); 
   
  FormController.$inject = [
    '$state', 'dynaformHttpService', 'dynaformUtilsService', 'NgTableParams', 'Notification', 'Upload', 
    '$location', '$q', 'dynaformPermissionsService', 'dynaformValidationService', '$scope', '$filter', '$uibModal',
    'ngTableEventsChannel'
  ];

  function FormController($state, dynaformHttpService, dynaformUtilsService, NgTableParams, Notification, Upload, $location, $q, dynaformPermissionsService, dynaformValidationService, $scope, $filter, $uibModal, ngTableEventsChannel){
    var self = this, 
        rawData;
    
    angular.extend(self, {
      entity: {},
      newItem: newItem,
      getDetails: getDetails,
      remove: remove,
      removeItemInclude: removeItemInclude,
      save: save,
      upload: upload, 
      files: {},
      selectFiles: selectFiles,
      download: download,
      unLinkAttachment: unLinkAttachment,
      dataEdit: {},
      onCopySuccess: onCopySuccess,
      copyToClipboard: copyToClipboard,
      edit: edit,
      cancelEdit: cancelEdit,
      saveAndNew: saveAndNew,
      duplicate: duplicate,
      filterOption: '', //preechido com os valores de filtro por select
      filterArea: filterArea, //fn para filtrar uma lista por area
      filter: filter,
      filteredByKeys: {},
      metaIncludes: {},
      dataOnEditInclude: false,
      addNewItemToCollection: addNewItemToCollection,
      addNewItemInclude: addNewItemInclude,
      editItemInclude: editItemInclude,
      hiddenFieldsByIncludeMetaBind: {},
      fieldVisible: {},
      fieldRequired: {},
      fieldDisabled: {},
      fieldsErrorValidate: {},
      validateField: validateField,
      validData: true,
      propagateChanges: propagateChanges, 
      clearDataEditInclude: clearDataEditInclude,
      customBehavior: customBehavior,
      showModal: showModal,
      okModal: okModal,
      cancelModal: cancelModal,
      customAction: customAction,
      btVisible: {},
      custom: {}
    });

    setSource(FormController.modalFormId || $location.path());

    function setSource(path){
      path.replace(/\/$/, ''); //retira o último slash
      getData(path);
    }

    /*
      Get principal e multi propósito.
    */
    function getData(path) {
      path = path || $state.params.entity;
      dynaformHttpService.get(path).then(function(response) {
        rawData = response.data;

        if(path.includes('new')){ 
          bindEntityModel(getDuplicate() || setDataModel(response.data, response.data.meta), response.data.meta);
          buildTablesForIncludes(self.entity.data, self.meta);
          clearDataValidation(self.entity['form-id'], false);
        }else{
          bindEntityModel(response.data, response.data.meta);
          parseDateForMask(self.entity.data, self.meta);
          // Verifica se na url é acesso a um recurso específico
          if($state.params.id && !FormController.modalFormId){
            buildTablesForIncludes(self.entity.data, self.meta);
            clearDataValidation(self.entity['form-id'], true);
          }else{
            buildTableData(self.entity.data, self.entity.pagination, self.entity['form-id']);
          }

          hideFieldsByIncludeMetaBind();
        }
        
        dynaformValidationService.setErrorMessages(self.entity.validationMessages);
        setPermissions(self.entity['form-id'], self.entity.permissions);
        setFieldVisible(self.entity.data, self.meta, self.entity['form-id']);
        setFieldRequired(self.entity.data, self.meta, self.entity['form-id']);
        setFieldDisabled(self.entity.data, self.meta, self.entity['form-id']);
        setBtVisible(self.entity.data, self.entity.views, self.entity['form-id']);

        delete FormController.modalFormId;
      }, function(response) {
        Notification.error(response.data.message || 'Houve um erro ao acessar o recurso');
      });
    }

    //Acho que esse wrapper é desnecessário
    function setPermissions(formId, permissions) {
      dynaformPermissionsService.setPermissions(formId, permissions);
    }

    function getMeta(path) {
      dynaformHttpService.getMeta(path).then(function(response) {
        self.meta = response.data.meta;
      });
    }

    function setMeta(meta) {
      self.meta = meta;
      //colocar essa chamada no get  principal
      setMetaInclues(meta);
    }


    /*
      Receive a raw data from http service to bind no view
    */
    function bindEntityModel(entity, meta) {
      angular.extend(self.entity, entity);
      setMeta(meta);
    }

    function buildTableData(data, pagination, formId, bindLink, routeNew) {
      // Parametros do NgTables
      var params = {
            //count per page
            count: pagination.countPerPage || 10
          },
          settings = {
            //Não usamos esse counts. Ele mostra uma lista de count per page
            counts: [],
            // O array de dados
            dataset: data || [],
            paginationType: pagination.type
          };

      //Caso a paginação for no server, seta o NgTables para requisitar as próximas páginas
      if (pagination.type === 'server' && !routeNew) {
        settings.getData =  getData;
      }

      var instance = setNewInstanceNgTables(formId, params, settings);

      ngTableEventsChannel.onAfterReloadData(function(ngInstance, dataset) {
        setBtVisible(dataset, self.entity.views, formId);
      }, instance);


      function getData(paramsNgTable){
        var params = {};

        if (paramsNgTable.count()) {
          params.count = paramsNgTable.count();
        }

        if (paramsNgTable.page()) {
          params.page = paramsNgTable.page();
        }

        if (!_.isEmpty(paramsNgTable.filter())) {
          angular.forEach(paramsNgTable.filter(), function (v, k) {
            params[k] = v;
          });
        }

        if (!_.isEmpty(paramsNgTable.sorting())) {
          // O NgTable retorna um obj com o label e o valor do sorting()
          var sortingKey = Object.keys(paramsNgTable.sorting())[0],
              sortingValue = paramsNgTable.sorting()[sortingKey];

          params['sorting['+ sortingKey +']'] = sortingValue;
        }

        params[ _.keys(bindLink)[0] ] = self.entity.data[ _.values(bindLink)[0] ];

        return dynaformHttpService
                .get(formId, false, params)
                .then(function(response) {
                  paramsNgTable.total(response.data.pagination.totalCount);
                  //TODO: Fazer os tratamentos para a formatação dos dados
                  return response.data.data;
                }, function(response) {
                  Notification.error(response.data.message || 'Houve um erro');
                });
      }
    }

    function buildTablesForIncludes(data, meta) {
      //Identificar o form id da lista para requisitar a lista
      angular.forEach(meta, function(item, index) {
        if(item.type.includes('include')){
          buildTableData(data[item.bind], item.pagination, item['form-id'], item.link, true);
        }
      });
    }

    function setNewInstanceNgTables(id, params, settings) {
      return self['ngTableParams_' + id] = new NgTableParams(params, settings);
    }

    function removeFromNgTables(collectionId, index){
      var instance = self[collectionId];
      instance.settings().dataset.splice(index, 1);
      instance.reload();
    }

    function updateDataOnNgTable(collectionId, data, formId) {
      var ngTable = self[collectionId];

      if(!ngTable){return false;}

      if (ngTable.settings().paginationType == 'front') {
        ngTable.settings().dataset.push(data);
        ngTable.reload();
      }else{
        var includeLink = _.find(self.meta, {type: 'include', 'form-id': formId}).link;
        data[ _.keys(includeLink)[0] ] = self.entity.data[ _.values(includeLink)[0] ];

        save(data, formId).then(function(response) {
          ngTable.reload();
        });
      }
    }

    function getInstaceNgTables(id, fullName) {
      if (fullName) {
        return self[id]; 
      }else{
        return self['ngTableParams_' + id]; 
      }
    }

    function newItem(formId){
      if(!dynaformPermissionsService.hasPermissionToCreate(formId)) {
          dynaformPermissionsService.notifyBlocked();
          return;
      }

      $state.go('new', {entity: $state.params.entity});
    }

    function getDetails(item) {
      dynaformHttpService.getDetails(item.link.href).then(function(response) {
        angular.extend(item, response.data.data);
      }, function(response) {
        Notification.error(response.data.message || 'Houve um erro');
      });
    }

    function saveDetails(dataEdit){
      return dynaformHttpService.saveDetails(dataEdit).then(function success(response) {
        Notification.success(response.data.message || 'Savo');
      }, function error(response) {
        Notification.error(response.data.message || 'Houve um erro');
      });
    }

    function saveEdit(itemToSave, formId) {
      var deferred = $q.defer();

      if(!dynaformPermissionsService.hasPermissionToUpdate(formId)){
        dynaformPermissionsService.notifyBlocked();
        deferred.reject();

        return deferred.promise;
      }else if(formHasError(formId)){
        deferred.reject();
        Notification.error(dynaformUtilsService.getTranslate('label.form.validation'));

        return deferred.promise; 
      }

      var metaIncludes = getMetaIncludes(self.meta);

      //Atualiza a lista de include do data principal
      _.forEach(metaIncludes, function(elem, key) {
         var dataInclude = getInstaceNgTables(elem['form-id']).settings().dataset;
         //Filtra os item que não tem operation exclude porque a lista de exclude é apartada
         itemToSave[elem.bind] = _.filter(dataInclude, function(value) {
            return !value.operation || value.operation === 'include';
         });

        //Procura por item que foram escluídos e coloca na lista de excludes
        itemToSave[elem.bind + '$exclude'] = _.filter(dataInclude, {operation: 'exclude'});
      });


      dynaformHttpService.saveDetails(itemToSave, self.meta).then(
        function(response) {
          Notification.success(response.data.message || 'Item salvo');
          deferred.resolve();
          goBack();
        },
        function(response) {
          Notification.error(response.data.message || 'Item não pôde ser salvo');
          deferred.reject();
        }
      );

      return deferred.promise;
    }

    function save(data, formId){
      var deferred = $q.defer();

      if (formHasError(formId)) {
        Notification.error(dynaformUtilsService.getTranslate('label.form.validation'));
        deferred.reject();
        
        return deferred.promise;
      }

      if (data.id){
        return saveEdit(data, formId);
      }else{
        dynaformHttpService.save(data, formId, self.meta).then(function(response) {
          goBack();
          Notification.success(response.data.message || 'Item salvo');
          deferred.resolve();
        }, function error(response) {
          Notification.error(response.data.message || 'Houve um erro ao salvar');
          deferred.reject();
        });
      }

      return deferred.promise;
    }

    function saveAndNew(data, formId){
      save(data, formId).then(
        function(response) {
          $state.go('new', {entity: $state.params.entity}, {reload: true});
        }
      ); 
    }

    function duplicate(entity, formId) {
      if (!dynaformPermissionsService.hasPermissionToCreate(formId)) {
        dynaformPermissionsService.notifyBlocked();
        return;
      }

      var clone = angular.copy(entity);
      dynaformHttpService.setCacheForDuplicate(clone);  
      $state.go('new', {entity: $state.params.entity});
    }

    function getDuplicate() {
      var duplicate = dynaformHttpService.getCacheForDuplicate();
      dynaformHttpService.destroyCacheForDuplicate();
      return duplicate;
    }

    function edit(item, origin) { 
      $state.go('id', {entity: $state.params.entity, id: item.id});
    }

    function cancelEdit(){
      goBack();
    }

    function goBack() {
      //Bt geralmente faz voltar para a lista
      $state.go('entity', {entity: $state.params.entity});
    }

    function remove(item, index, collectionId, formId) {
      if (!dynaformPermissionsService.hasPermissionToDelete(formId)) {
        dynaformPermissionsService.notifyBlocked();
        return; 
      }

      var confirm = window.confirm('Tem certeza?');
      if (!confirm) { return false; }

      dynaformHttpService.remove(item.link.href).then(function(response){
        if(collectionId){
          removeFromNgTables(collectionId, index);
        }else{
          goBack();
        };
        Notification.success(response.data.message || 'Item removido');
      }, function(response) {
        Notification.error(response.data.message || 'Houve um erro');
      });
    }

    function filterArea(area) {
      var href = self.data.includes[area].links.href,
          param = self.filterOption[area].value;

      dynaformHttpService.filterByArea(href, param).then(function(response) {
        var collectionId = 'ngTableParams_' + area;
        updateDataOnNgTable(collectionId, response.data); 
      });
    }

    function upload(file, bindName, formId){
      self.disabledButton = true;

      dynaformHttpService.upload(file)
        .then(function onSuccess(response) {
                response.data.files.forEach(function(value, index){
                  var bind = self.entity.meta[bindName].bind;
                  self.entity.data[bind] = value.id;
                });

                self.disabledButton = false;
              }, 
              function onError(response) {
                Notification.error('Ocorreu um erro com o upload');
              }, 
              function onProgress(evt) {
                self.progress = parseInt(100.0 * evt.loaded / evt.total);
              }
        );
    }

    function selectFiles(model) {
      console.log(model);
    }

    function download(model, href) {
      console.log(model, href);
    }

    function unLinkAttachment(index, id) {
      var ngTable = getInstaceNgTables('attachments');
      if(!window.confirm('Tem certeza?')){ return false; };

      ngTable.settings().dataset.splice(index, 1);
      ngTable.reload();
    }

    function copyToClipboard(model) {
      if (model === 'tabledata') {
        return 'xxx';
      }
    }

    function onCopySuccess(arguments) {
      console.log(arguments);
    }

    /*
      Adiciona um item a uma coleção (que geralmente é um ngTable)
      O item é marcado com 'operation' : 'include' para fim de gravar no banco.
    */
    function addNewItemToCollection(item, collectionId, formId){
      if(_.keys(item).length <= 1){ return false; }

      if( (!item.id && !dynaformPermissionsService.hasPermissionToCreate(formId)) ||
          (item.id && !dynaformPermissionsService.hasPermissionToUpdate(formId)) ){

        dynaformPermissionsService.notifyBlocked();
        return false;
      }

      item.operation = 'include';
      var ngTableInstance = getInstaceNgTables(collectionId, true);

      if (ngTableInstance && !item.id && item.newItem) {
        delete item.newItem
        updateDataOnNgTable(collectionId, angular.copy(item), formId);
      }

      // Fecha o bloco se for edição
      return self.dataOnEditInclude = false;
    }

    function removeItemInclude(item, index, collectionId){
      if (!window.confirm('Tem certeza?')) {
        return false;
      }

      if (item.id) {
        item.operation = 'exclude';
        item.hidden = true;
      }else{
        removeFromNgTables(collectionId, index); 
      }

      self.dataOnEditInclude = false;
    }

    function clearDataEditInclude(formId) {
      self.dataOnEditInclude[formId] = false;
      clearDataValidation(formId);
    }

    function clearDataValidation(formId, isEntityEdit) {
      self.fieldsErrorValidate[formId] = {};
    }

    //Especificar que é um filtro no ngTable
    function filter(filtersKeys, list) {
      var ngTable = self[list];

      ngTable
        .filter(filtersKeys)
        .reload();
    } 

    //Seta um obj com os metas dos includes para fins de validação, de-para, etc
    function setMetaInclues(meta){
      var includes = getMetaIncludes(meta);

      _.forEach(includes, function(item, key) {
        self.metaIncludes[item['form-id']] = item.meta;
        //colocar em uma função apartada
        dynaformPermissionsService.setPermissions(item['form-id'], item.permissions);
      });
    }

    function getMetaIncludes(meta){
      var meta = self.meta || meta;
      return _.filter(meta, {type: 'include'}); 
    }

    /*
      Cada include tem uma proprieade 'link'. Essa prop é um objeto em que a chave
      representa a propriedade de cada item do include que faz o relacionamento com o data principal.
      Esse método cria um array com os meta.bind de cada field que altera essa proprieade quando 
      se está em uma edição do dado em que o include pertence.
      Obs: Se essa regra pode ser melhor aplicada pelo template.json no handlebars
    */
    function hideFieldsByIncludeMetaBind() {
      var includes = getMetaIncludes();
     
      includes.forEach(function(item, index) {
        angular.extend(self.hiddenFieldsByIncludeMetaBind, item.link);
      });

    }


    function addNewItemInclude(formId) {
      if (!dynaformPermissionsService.hasPermissionToCreate(formId)) {
        dynaformPermissionsService.notifyBlocked();
        return false;
      }

      self.dataOnEditInclude = {};
      self.dataOnEditInclude[formId] = {newItem: true};
    }

    function editItemInclude(item, formId) {
      if(!dynaformPermissionsService.hasPermissionToRead(formId)){
        dynaformPermissionsService.notifyBlocked();
        return false;
      }

      self.dataOnEditInclude = {};
      self.dataOnEditInclude[formId] = item;
    }

    function parseDateForMask(data, meta) {
      if (angular.isArray(data)) {
        _.forEach(data, function(value) {
          parseDateForMask(value, meta);
        });
      }else{
        parse(meta); 
      }

      function parse(meta, bind) {
        _.forEach(meta, function(metaField, key) {
          if (metaField.type === 'date') {
            if (bind) {
              data[bind][metaField.bind] = dynaformUtilsService.translateDataToView(data[bind][metaField.bind], metaField.type, metaField.formatPattern);
            }else{
              data[metaField.bind] = dynaformUtilsService.translateDataToView(data[metaField.bind], metaField.type, metaField.formatPattern);
            }
          }else if(metaField.type === 'include'){
            parse(metaField.meta, metaField.bind);
          }
        });
      }
    }

    function setFieldVisible(data, meta, formId) {
      _.forEach(meta, function(metaField, key) {
        if(metaField && metaField.visible) {
          switch(metaField.visible.type) {
            case 'boolean':
              var result = runExpressionTypeBoolean(data, metaField.bind, metaField.visible.expression);
              setModelForExpressionRules(self.fieldVisible, formId, result);
            break;

            case 'function':
              var result = runExpressionTypeFunction(data, metaField.bind, metaField.visible.expression);
              setModelForExpressionRules(self.fieldVisible, formId, result);
            break;

            case 'map':
              createWatchers(metaField.bind, formId, data, metaField.visible.expression, self.fieldVisible);
            break;
          }
        }
      }); 
    }
    
    function setFieldRequired(data, meta, formId) {
      _.forEach(meta, function(metaField, key) {
        if(metaField && metaField.required) {
          switch(metaField.required.type) {
            case 'boolean':
              var result = runExpressionTypeBoolean(data, metaField.bind, metaField.required.expression);
              setModelForExpressionRules(self.fieldRequired, formId, result);
            break;

            case 'function':
              var result = runExpressionTypeFunction(data, metaField.bind, metaField.required.expression);
              setModelForExpressionRules(self.fieldRequired, formId, result);
            break;

            case 'map':
              createWatchers(metaField.bind, formId, data, metaField.required.expression, self.fieldRequired);
            break;
          }
        }
      });  
    }

    function setFieldDisabled(data, meta, formId) {
      _.forEach(meta, function(metaField, key) {
        if(metaField && metaField.disabled) {
          switch(metaField.disabled.type) {
            case 'boolean':
              var result = runExpressionTypeBoolean(data, metaField.bind, metaField.disabled.expression);
              setModelForExpressionRules(self.fieldDisabled, formId, result);
            break;

            case 'function':
              var result = runExpressionTypeFunction(data, metaField.bind, metaField.disabled.expression);
              setModelForExpressionRules(self.fieldDisabled, formId, result);
            break;

            case 'map':
              createWatchers(metaField.bind, formId, data, metaField.disabled.expression, self.fieldDisabled);
            break;
          }
        }
      });  
    }

    /*
      Essa fn faz o bt da tabela (ngTable) estar visível ou não na row de acordo com a prop visible da action.
      Como a action está diretamente ligada com a lista de dados, o relacionamento entre a lista e o bt
      é a posição do dado na lista (row).
    */
    function setBtVisible(data, views, formId) {
      _.forEach(views, function(view, viewName) {
        set(data, view, formId, viewName);  
      });

      function set(data, view, formId, viewName) {
        if (!view.actions) {return false;}

        if (viewName == 'list') {
          var ngTableId = 'ngTableParams_'.concat(formId);
          _.forEach(data, function(item, index){
            runExpressions(view.actions, [ngTableId, index], (item || {}), viewName);
          });
        }else{
          runExpressions(view.actions, false, data);
        }
      }

      function runExpressions(actions, path, data, viewName) {
        _.forEach(actions, function(action, index) {
          switch(action.visible && action.visible.type) {
            case 'boolean':
              var result = runExpressionTypeBoolean(data, action.name, action.visible.expression);
              setModelForExpressionRules(self.btVisible, path, result);
            break;

            case 'function':
              var result = runExpressionTypeFunction(data, action.name, action.visible.expression);
              setModelForExpressionRules(self.btVisible, path, result);
            break;

            case 'map':
              var result = runExpressionTypeMap(data, action.name, action.visible.expression);
              setModelForExpressionRules(self.btVisible, path, result);

              if (!path) {
                createWatchers(action.name, path, data, action.visible.expression, self.btVisible);
              }
            break;
          }
        });
      }
      
    }

    function createWatchers(dataBind, formId, data, expression, modelExpression) {
      _.forEach(expression, function(value, key) {
        $scope.$watch(angular.bind(self, function(){return this.entity.data[key]}), function(newVal, oldVal){
          var result = runExpressionTypeMap(data, dataBind, expression);
          setModelForExpressionRules(modelExpression, formId, result);
        });
      });
    }

    
    function runExpressionTypeMap(data, bind, map) {
      return _.set({}, bind, _.isMatch(data, map));
    }

    function runExpressionTypeBoolean(data, bind, value) {
      return _.set({}, bind, value);
    }

    function runExpressionTypeFunction(data, bind, fn) {
      var result = window.eval(fn)(data);
      return _.set({}, bind, result);
    }
    
    function setModelForExpressionRules(model, path, value) {
      if (!_.get(model, path) && path) {
        _.set(model, path, {});
        _.extend(_.get(model, path), value); 
      }else if(path){
        _.extend(_.get(model, path), value); 
      }else{
          _.extend(model, value);
      }
    }

    function validateField(formData, bindName, formId, fieldName) {
      var meta = self.metaIncludes[formId] || self.meta,
          fieldName = fieldName || _.findKey(meta, {bind: bindName}),
          metaField =  _.find(meta, {bind: bindName}),
          dataField = _.get(formData, bindName),
          resultsValidation;

      if(!bindName && !fieldName){
        _.forEach(meta, function(value, key) {
          if (!value.bind || value.type != 'include') {
            validateField(formData, value.bind, formId, value.name);
          }
        });
      }

      dynaformValidationService
        .validateModel(bindName, dataField, metaField, fieldName, formId, formData)
        .then(function(response) {
          if(response.error) {
            console.log(response.errorMessages);
            showMessageError(response.errorMessages, formId, bindName);
          }else{
            hideMessagesError(formId, bindName);
          }
        }, function(response) {
          Notification.error(response.data.message); 
        });

    }

    function showMessageError(msgError, formId, bindName) {
      if(!self.fieldsErrorValidate[formId]){
        self.fieldsErrorValidate[formId] = {}; 
      }

      angular.extend(self.fieldsErrorValidate[formId], msgError);
    }

    function hideMessagesError(formId, bindName) {
      if(!self.fieldsErrorValidate[formId]){
        self.fieldsErrorValidate[formId] = {}; 
      }

      self.fieldsErrorValidate[formId][bindName] = false;
    }

    //No caso new, o model do data vem incompleto. Aqui através do meta setamos o model do data
    function setDataModel(entity, meta) {
      _.forEach(meta, function(metaField, key) {
        if(metaField.type === 'include'){

          if(metaField.multivalue){
            _.set(entity.data, metaField.bind, []);
          }else{
            var data = metaField.bind? entity.data[metaField.bind] = {} : entity.data;

            _.each(_.map(metaField.meta, 'bind'), function(value) {
              _.set(data, value);
            });
          } 

        }else{
          _.set(entity.data, metaField.bind);
        }
      });

      return entity;
    }

    function propagateChanges(data, bind, typeField, formId) {
      // Pega o meta do bind de acordo com o form-id
      var meta = self.metaIncludes[formId] || self.meta,
          // Pega o meta do field
          metaField = _.find(meta, {bind: bind});

      //Na estrutura do objeto propagateChantes, o keyOptions é o value da propriedade e uma referência
      //de qual proprieadade do option do select deverá ser chamada para pegar seu valor.
      //O keyData é a propriedade do objeto propagateChanges que contém o nome da propriedade do data
      //que receberá o valor do option.
      _.forEach(metaField.propagateChanges, function(keyOption, keyData) {
        //Value do data para referência do option selecionado
        var valueOnData = data[bind];
            // Pega o option selecionado
            optionSelected = _.find(metaField.options, {value: valueOnData});

        //Seta o valor da propriedade keyData do objeto data em questão com o valor da propriedade do
        //option selecionado 
        _.set(data, keyData, _.get(optionSelected, keyOption));
      });
    }

    function formHasError(formId) {
      var fieldsRequired = [], 
          result;

      _.forEach(self.fieldRequired[formId], function(value, key){ 
        if (value) {
          fieldsRequired.push(key);
        }
      });

      if(fieldsRequired) {
        result = _.every(fieldsRequired, function(key, index) {
                    return angular.isDefined(self.entity.data[key]) && self.entity.data[key].toString().length; 
                  });

      }
      return (fieldsRequired.length && !result) || _.isEmpty(self.fieldRequired[formId]) || _.some(self.fieldsErrorValidate[formId], Boolean);
    }

    //Custom
    function findCep(value, inputName, formId) {
      if (!value) { return false;}
      updateFragment(value, inputName, formId);
    }

    function customBehavior(inputName, formId) {
      updateFragment(inputName, formId); 
    }

    function customAction(formId, method, sourceKey, saveFront, rowData) {
      if(!method && sourceKey){return false;}

      return dynaformHttpService.customAction((rowData || self.entity.data), method, sourceKey, formId).then(
        function(response) {
          parseDateForMask(response.data.data, self.meta);

          if (!rowData) {
            angular.extend(self.entity.data, response.data.data);
            if (saveFront) {
              saveDetails(self.entity.data);
            }

          }else{
            var ngTableInstance = getInstaceNgTables(formId);
            angular.extend(rowData, response.data.data);
            if (saveFront) {
              saveDetails(rowData).then(function(response) {
               ngTableInstance.reload();
              });
            }else{
              ngTableInstance.reload();
            }
          }
        },
        function(response) {
          Notification.error(response.data.message || 'Houve um erro no servidor');
        }
      ); 
    }

    function updateFragment(inputName, formId) {
      dynaformHttpService.updateFragment(self.entity.data, inputName, formId).then(
        function(response) {
          angular.extend(self.entity.data, response.data.data);
          parseDateForMask(self.entity.data, self.meta);
        },
        function(response) {
          Notification.error(response.data.message);
        }
      ); 
    }

    function showModal(view, indexAction, rowIndex) {
      var action = self.entity.views[view].actions[indexAction];

      //Instanciamos na modal o mesmo controller, essa é uma identificação para chamar o formId passado
      FormController.modalFormId = action['form-id'];

      if (action.viewType === 'edit') {
        FormController.modalFormId += action['resource-id'] || '/new';
      }

      var modalInstance = $uibModal.open({
            templateUrl: '/forms-v2/' + action['form-id'],
            controller: FormController,
            controllerAs: 'vm_modal'
          });

      modalInstance.result
        .then(function(response) { 
          if (_.get(action, 'onClose.saveModalForm')) {
            dynaformHttpService.save(response.data, action['form-id'], response.meta)
              .then(function(response) {
                Notification.success(response.data.message || 'Item salvo');
              }, function(response) {
                Notification.error(response.data.message || 'Houve um erro ao salvar');
            });
          }
          return response;
        })
        .then(function(response) {
          if (_.get(action, 'onClose.reloadParentForm')) {
            getData(self.entity['form-id']);
          }
          return response;
        })
        .then(function (response) {
          if (_.get(action, 'onClose.updateParentForm')) {

            if (angular.isUndefined(rowIndex)) {
              updateParentData(action.onClose.updateParentForm, response, self.entity.data);
            }else{
              var ngTableInstance = getInstaceNgTables(self.entity['form-id']),
                  rowData = ngTableInstance.settings().dataset[rowIndex];
              
              updateParentData(action.onClose.updateParentForm, response, rowData);
              ngTableInstance.reload();
            }
          }

          return response;
        })
        .then(function(response){
          if (_.get(action, 'onClose.event')) {
            var rowData,
                ngTableInstance,
                method = action.onClose.event.method,
                sourceKey = action.onClose.event.sourceKey, 
                saveFront = action.onClose.event.saveFront;

            if (angular.isUndefined(rowIndex)) {
              customAction(self.entity['form-id'], method, sourceKey, saveFront);
            }else{
              ngTableInstance = getInstaceNgTables(self.entity['form-id']);
              rowData = ngTableInstance.settings().dataset[rowIndex];
              customAction(self.entity['form-id'], method, sourceKey, saveFront, rowData);
            }

          }

          return response;
        })
        .then(function(response){
          if (_.get(action, 'onClose.saveParentForm')) {
            if (angular.isUndefined(rowIndex)) {
              save(self.entity.data, self.entity['form-id']);
            }else{
              var ngTableInstance = getInstaceNgTables(self.entity['form-id']),
                  rowData = ngTableInstance.settings().dataset[rowIndex];

              saveDetails(rowData).then(function(response) {
                ngTableInstance.reload();
              });
            }
          }

          return response;
        });

      function updateParentData(map, source, dest) {
        if (_.get(source, 'views.list.selectable')){
          _.forEach(map, function(value, key) {
            dest[key] = source.selected[value];
          });
        }else {
          _.forEach(map, function(value, key) {
            dest[key] = source.data[value];
          });
        }
      }
    }

    function okModal() {
      // No caso do modal, só passa pelo validate do form se este for do tipo edit
      if (!self.entity.views.list && formHasError(self.entity['form-id'])) { return false; }

      // O controller instanciado na modal recebe as funções do contexto da modal pela $uiModal
      $scope.$close(self.entity);
    };

    function cancelModal() {
      $scope.$dismiss('cancel');
    };
  }
}());