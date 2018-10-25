(function(){
  angular
    .module('studio-v2') 
    .constant('AUDIT_FIELDS', [
      {
        "alias": "audit.created.date",
        "name": "dateCreated",
        "label": "label.dt_created",
        "type": "date",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": "audit.lastUpdated.date",
        "name": "dateupdated",
        "label": "label.dt_updated",
        "type": "date",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": [
          "audit.created.userId",
          "audit.created.userName"
        ],
        "type": "string",
        "name": "userureated",
        "label": "label.id_usercreated",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": [
          "audit.lastUpdated.userId",
          "audit.lastUpdated.userName"
        ],
        "type": "string",
        "name": "userupdated",
        "label": "label.id_userupdated",
        "readonly": true,
        "auditField": true
      }
    ]);
})();