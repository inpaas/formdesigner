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
  
  //jsonForm.$inject = ['httpService'];
  
  function jsonForm(){
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

    function editField() {
      
    }

    function resetJsonForm(){
    return {
        "key": "", 
        "label": "label.forms.pais",
        "pagination": {},
        "breadcrumb": [],
        "dataSource": {},
        "views": {},
        "fields": []
    };
  }
    
    function saveJsonForm(){
      //http.save(form);
    }
  
    
    function getJsonForm(){
      return form;
    }
    
    
    return {
      editKeyForm: editKeyForm,
      editLabelForm: editLabelForm,
      editPagination: editPagination,
      editBreadcrumb: editBreadcrumb,
      editDataSource: editDataSource,
      editViews: editViews,
      editField: editField,
      saveJsonForm: saveJsonForm,
      getJsonForm: getJsonForm
    };
  }
  
  
})();