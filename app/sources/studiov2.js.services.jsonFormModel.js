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
  
  jsonForm.$inject = ['$q', '$http', '$filter'];
  
  function jsonForm($q, $http, $filter){
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
        'dataSource': {
          'type': 'E'
        },
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
                'icon': 'fa-floppy-o',
                'visible': {
                  'type': 'map',
                  'expression': {
                    'id': 23
                  }
                }              
              },
              {
                'action': 'savenew',
                'name': 'save_new'
              },
              {
                'action': 'duplicate',
                'name': 'duplicate',
              },
              {
                'action': 'remove',
                'name': 'remove'
              },
              {
                'action': 'cancel',
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
        promise = $http({
          method: 'get',
          url: '/api/app/js/studiov2.js.model.jsonFormModel'
        }).then(function(response) {
          var jsonModel = response.data; 

          jsonModel.views.edit = {
            templateCol: 1,
            label: '1 col'
          }

          jsonModel.fields.forEach(function(field, index){
            field.templateType = '/forms/studiov2.forms.fields.' + field.meta.type;
          });

          return jsonModel;
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