(function(){
  angular
    .module('studio-v2') 
    .constant('AUDIT_FIELDS', [
      {
        "alias": "audit.created.date",
        "name": "DT_CREATED",
        "label": "label.dt_created",
        "type": "Datetime",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": "audit.lastUpdated.date",
        "name": "DT_UPDATED",
        "label": "label.dt_updated",
        "type": "Datetime",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": "audit.created.userId",
        "name": "ID_USERCREATED",
        "label": "label.id_usercreated",
        "type": "Integer",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": "audit.lastUpdated.userId",
        "name": "ID_USERUPDATED",
        "label": "label.id_userupdated",
        "type": "Integer",
        "readonly": true,
        "auditField": true
      }
    ]);
})();