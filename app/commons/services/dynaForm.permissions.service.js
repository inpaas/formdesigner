(function() {
  angular
    .module('dynaform') 
    .service('dynaformPermissionsService', dynaformPermissionsService);

  dynaformPermissionsService.$inject = ['Notification'];

  function dynaformPermissionsService(Notification) {
    var permissions = {};

    function setPermissions(formId, data) {
      permissions[formId] = data;
    }

    function hasPermissionToExecute(formId) {
      return permissions[formId].execute;
    }

    function hasPermissionToCreate(formId) {
      return permissions[formId].insert;
    }

    function hasPermissionToRead(formId) {
      return permissions[formId].view;
    }

    function hasPermissionToUpdate(formId) {
      return permissions[formId].update;
    }

    function hasPermissionToDelete(formId) {
      return permissions[formId].delete;
    }

    function notifyBlocked() {
      Notification.error('Seu perfil não tem permissão para esta ação');
    }

    function getPermissions(formId) {
      return permissions[formId]; 
    }

    return{
      setPermissions: setPermissions,
      hasPermissionToExecute: hasPermissionToExecute,
      hasPermissionToCreate: hasPermissionToCreate,
      hasPermissionToRead: hasPermissionToRead,
      hasPermissionToUpdate: hasPermissionToUpdate,
      hasPermissionToDelete: hasPermissionToDelete,
      notifyBlocked: notifyBlocked,
      getPermissions: getPermissions
    } 
  }
})();