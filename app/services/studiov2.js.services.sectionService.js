angular
  .module('studio-v2')
  .service('SectionService', SectionService);

SectionService.$inject = [];

function SectionService(){
  var validations = {
        event_onload: validateOnload,
        event_onchange: validateOnChange,
        event_onsubmit: validateOnSubmit,
        sectionEdit: validateConfigSectionEdit,
        sectionList: validateConfigSectionList,
        sectionFinderService: validateConfigSectionFinderService,
        sectionTemplate: validateConfigSectionTemplate
      };

  this.validateConfigSection = validateConfigSection;
  this.validateAllConfigSection = validateAllConfigSection;

  function validateConfigSection(configSection, validationKey, configKey){
    configSection.error = {};
    return validations[validationKey](configSection, configKey);
  }

  function validateAllConfigSection(configSection){
    configSection.error = {};

    if(configSection.type != 'main' && !configSection.isSameDataSource && !configSection.includeType){
      configSection.error.sectionType = true;

    }else if(configSection.includeType == 'edit' && !configSection.isSameDataSource){
      validateConfigSectionEdit(configSection);

    } else if(configSection.includeType == 'list'){
      validateConfigSectionList(configSection);

    } else if(configSection.includeType == 'finder-service'){
      validateConfigSectionFinderService(configSection);

    } else if(configSection.includeType == 'templateCustom'){
      validateConfigSectionTemplate(configSection);
    }

    if(configSection.onchange){
      validateOnChange(configSection);
    }

    if(configSection.onload){
      validateOnload(configSection);
    }

    if(configSection.onsubmit){
      validateOnSubmit(configSection);
    }
  }

  function validateOnload(configSection){
  }

  function validateOnSubmit(configSection){
  }

  function validateOnChange(configSection){
    configSection.error.onchange_sourceKey = !configSection.sourceKey;
    configSection.error.onchange_functionName = !configSection.functionName;
  }

  function validateConfigSectionEdit(configSection){
    configSection.error.sectionType_edit_bind = !configSection.meta.bind;
    configSection.error.sectionType_edit_formKey = !configSection.include || !configSection.include.key;
  }

  function validateConfigSectionList(configSection, configKey){
    switch(configKey){
      case 'finder_entityName':
        configSection.error.finder_entityName = !configSection.finder || !configSection.finder.entityName;
      break;

      case 'finder_relatedFinders':
        configSection.error.finder_relatedFinders = !configSection.finder || !configSection.finder.relatedFinders || !configSection.finder.relatedFinders.length;
      break;

      case undefined:
        configSection.error.finder_entityName = !configSection.finder || !configSection.finder.entityName;
        configSection.error.finder_relatedFinders = !configSection.finder || !configSection.finder.relatedFinders || !configSection.finder.relatedFinders.length;
      break;
    }
  }

  function validateConfigSectionFinderService(configSection, configKey){
    switch(configKey){
      case 'finder_sourceKey':
        configSection.error.finder_sourceKey = !configSection.finder || !configSection.finder.sourceKey;
      break;

      case 'finderService_relatedFinders':
        configSection.error.finderService_relatedFinders = !configSection.finder || !configSection.finder.relatedFinders.length;
      break;

      case 'finderService_form':
        configSection.error.finderService_form = !configSection.finder || !configSection.finder.form;
      break;

      case undefined:
        configSection.error.finder_sourceKey = !configSection.finder || !configSection.finder.sourceKey;
        configSection.error.finderService_relatedFinders = !configSection.finder || !configSection.finder.relatedFinders.length;
        configSection.error.finderService_form = !configSection.finder || !configSection.finder.form;
      break;
    }
  } 

  function validateConfigSectionTemplate(configSection){
    configSection.error.include_templateKey = !configSection.include || !configSection.include.template;
  }
}