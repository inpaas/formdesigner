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
  
  jsonForm.$inject = ['$q', '$http'];
  
  function jsonForm($q, $http){
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
          'list': {},
          'edit': {
            'action': [
              {
                'action': 'save',
                'name': 'save'
              },
              {
                'action': 'save_new',
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
    
    return {
      editKeyForm: editKeyForm,
      editLabelForm: editLabelForm,
      editPagination: editPagination,
      editBreadcrumb: editBreadcrumb,
      editDataSource: editDataSource,
      editViews: editViews,
      buildFields: buildFields,
      saveJsonForm: saveJsonForm,
      getJsonForm: getJsonForm
    };
  }
})();