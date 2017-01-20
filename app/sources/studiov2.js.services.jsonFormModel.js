/*
 * Json form model
 * studiov2.js.services.jsonjsonForm
 * 
 */
/*global require module Java logging scriptContext angular*/

(function() {
  angular
    .module('studio-v2')
    .service('jsonForm', jsonForm);
  
  jsonForm.$inject = ['$q', '$filter', 'httpService'];
  
  function jsonForm($q, $filter, httpService){
    var form = setJsonForm();
    
    function setJsonForm(){
      return resetJsonForm();
    }
    
    function editKeyForm(key) {
      form.key = key;
    }

    function editLabelForm(label) {
      form.label = label;
    }

    function editPagination(pagination) {
      angular.extend(jsonForm.pagination, pagination);
    }

    function editBreadcrumb() {
       
    } 

    function editDataSource() {
      
    }

    function editViews() {
      
    }

    function buildFields(sections, jsonModel) {
       
    }

    function getFieldsFromSection(section) {
      
    }

    function resetJsonForm(){
      return {
        'key': '', 
        'label': 'Form Title',
        'pagination': {
          'type': 'server',
          'countPerPage': 10 
        },
        'breadcrumb': [],
        'dataSource': {},
        'views': {
          'list': {
            'actions':[
              {
                'action': 'new',
                'name': 'new'
              }
            ]
          },
          'edit': {
            'actions': [
              {
                'action': 'save',
                'label': $filter('translate')('button.save.title'),
                'name': 'save',
                'visible': {
                  'type': 'map',
                  'expression': {
                    'id': 23
                  }
                }              
              },
              {
                'action': 'savenew',
                'label': $filter('translate')('button.savenew.title'),
                'name': 'save_new', 
                'visible': {
                  'type': 'function', 
                  'expression': '(function (data){ console.log(data) })'
                }
              },
              {
                'action': 'duplicate',
                'label': $filter('translate')('button.duplicate.title'),
                'name': 'duplicate',
              },
              {
                'action': 'remove',
                'label': $filter('translate')('button.remove.title'),
                'name': 'remove'
              },
              {
                'action': 'cancel',
                'label': $filter('translate')('button.cancel.title'),
                'name': 'cancel'
              }
            ]
          }
        },
        'fields': []
    };
  }
    
    function saveJsonForm(formId){
      
    }
    
    function getNewFormId() {
      var deferred = $q.defer();
      deferred.resolve(resetJsonForm());

      return deferred.promise;
    } 
       
    function getJsonForm(id){
      var promise;
      if (!id) {
        promise = getNewFormId();
      }else{
        promise = httpService.getForm(id).then(function(response) {
          var jsonModel = response.data;
          return JSON.parse(jsonModel.json);
        });
      }

      return promise;
    }
    
    function getActionsTypes() {
      return [
        'new',
        'list.remove',
        'list.view_edit',
        'list.custom',
        'list.modal',
        'modal',
        'custom',
        'cancel',
        'remove',
        'save',
        'save_new',
        'duplicate',
        'include.add',
        'include.row.edit'
      ]; 
    }

    return {
      editKeyForm: editKeyForm,
      editLabelForm: editLabelForm,
      editPagination: editPagination,
      editBreadcrumb: editBreadcrumb,
      editDataSource: editDataSource,
      editViews: editViews,
      buildFields: buildFields,
      saveJsonForm: saveJsonForm,
      getJsonForm: getJsonForm,
      getActionsTypes: getActionsTypes
    };
  }
})();