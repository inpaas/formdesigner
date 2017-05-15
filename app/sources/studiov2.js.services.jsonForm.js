/*
 * Json form model
 * studiov2.js.services.jsonjsonForm
 * 
 */
/*global require module Java logging scriptContext angular*/
(function() {
  angular
    .module("studio-v2")
    .service("jsonFormService", jsonFormService);
  
  jsonFormService.$inject = ["$q", "$filter", 'JSONMODEL'];
  
  function jsonFormService($q, $filter, JSONMODEL){
    var form = {}
    
    function setJsonForm(_form){
      form = _form;
    }
    
    function editKey(key) {
      form.key = key;
    }

    function editLabel(label) {
      form.label = label;
    }

    function editPagination(pagination) {
      form.pagination = pagination;
    }

    function editBreadcrumb(breadcrumb, view) {
      form.views[view].breadcrumb = breadcrumb;
    } 

    function editActions(actions, view){
      form.views[view].actions = actions;
    }

    function editDataSource(dataSource) {
      form.dataSource = dataSource;
    }

    function editViews() {
    }

    function editFields(fields) {
      form.fields = fields;
    }

    function getFormTemplate(){
      var deferred = $q.defer(),
          form = setJsonForm(JSONMODEL);

      form.firstConfig = true;
      deferred.resolve(form);

      return deferred.promise;
    }
    
    function getNewFormId() {
      var deferred = $q.defer();
      deferred.resolve(getFormTemplate());

      return deferred.promise;
    }
 
    function getActionsTypes() {
      return [
        "new",
        "list.remove",
        "list.view_edit",
        "list.custom",
        "list.modal",
        "modal",
        "custom",
        "cancel",
        "remove",
        "save",
        "save_new",
        "duplicate",
        "include.add",
        "include.row.edit",
        "include.row.remove"
      ]; 

    }

    function getFormWithLabels(){
      return form; 
    }

    function setKeyToDetails(key){
      form.views.list.keyToDetails = key;
    }

    function editConfigForm(configForm){
      var key = configForm.key || configForm.label.toLowerCase().replace(/\s/g, '-');
      editKey(key);
      editLabel(configForm.label);
      editDataSource(configForm.dataSource);
      editTemplate(configForm.template);
      editDescription(configForm.description);
    }

    function editDescription(description){
      form.description = description;
    }

    function editTemplate(template){
      form.template = template;
    }

    return {
      editKey: editKey,
      editLabel: editLabel,
      editPagination: editPagination,
      editBreadcrumb: editBreadcrumb,
      editDataSource: editDataSource,
      editViews: editViews,
      editFields: editFields,
      editActions: editActions,
      getFormTemplate: getFormTemplate,
      setJsonForm: setJsonForm,
      getActionsTypes: getActionsTypes,
      getFormWithLabels: getFormWithLabels,
      setKeyToDetails: setKeyToDetails,
      editConfigForm: editConfigForm
    };
  }
})();