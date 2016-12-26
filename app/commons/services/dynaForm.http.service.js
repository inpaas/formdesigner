(function() {
	angular.module('dynaform')
					.service('dynaformHttpService', dynaformHttpService);

	dynaformHttpService.$inject = ['$http', 'dynaformUtilsService', 'Upload'];

	function dynaformHttpService($http, dynaformUtilsService, Upload){
		var self = this, 
				url = '/api/forms-v2/',
				url_dowload = '/eai/files/dowload/';

		/*
			Esse get é multi propósito. Está servindo para o get inicial
			com retorno de lista ou único recurso e paginação	
		*/
		function get(path, href, params){
			if (path) {
				path = path.replace(/\/$/, ''); //tira o último slash
				path = url + path;
			}

			return $http({
				method: 'GET',
				// O path é o recurso de lista ou por id
				url: path || (url + href),
				//Geralmente usado para filters, pagination
				params: params || ''
			});

		}

		function update(pageForm, data){
			data = dynaformUtilsService.dataTransformationToWrite(data);

			return $http({
				method: 'post',
				url: setPageContext(pageForm).write,
				data: data
			});
		}

		function updateFragment(data, name, formId){
			var href = String.prototype.concat(url, formId, '/event/', name);

			return $http({
				method: 'post',
				url: href,
				data: {data: data}
			});
		}

		function appendTransform(defaults, transform) {
		  defaults = angular.isArray(defaults) ? defaults : [defaults];
		  return defaults.concat(transform);
		}

		function setPageContext(pageForm){
			var url = '/api/forms-v2',
					route = {
						read: url,
						write: url
					};

			switch (pageForm) {
				case 'person':
					route.read += '/form-pessoa';
					route.write += '/form';
					break;
				case 'countries':
					route.read += '/form-pais';
					route.write += '/form-pais';
			}

			return route;
		}

		function getDetails(href) {
			var url = '/api/forms-v2/' + href;

			return $http({
				method: 'GET',
				url: url
			});
		}

		function remove(href) {
			var url = '/api/forms-v2/' + href;

			return $http({
				method: 'DELETE',
				url: url
			});
		}

		function save(data, href, meta) {
			var item = dynaformUtilsService.normalizeDataToSave(angular.copy(data), meta);

			// POST usado para salvar um novo item 
			return $http({
				method: 'POST',
				url: url + href,
				data: {data: item}
			});
		}

		function saveDetails(data, meta) {
			var url = '/api/forms-v2/';
			var item = dynaformUtilsService.normalizeDataToSave(angular.copy(data), meta);

			return $http({
				method: 'PUT',
				url: url + item.link.href,
				data: {data: item}
			});
		}

		function filterByArea(href, filter){
			return $http({
				method: 'get',
				url: href,
				params: {
					filter: filter
				}
			});
		}

		function upload(file, href, storage) {
			// Monta como o backend espera.
			var data = {
				contentType: file.type,
				f1: file
			}
			
			return Upload.upload({
				url: '/eai/files/upload',
				data: data
			});
		}

		function getMeta(formId){
			return $http({
				method: 'get',
				url: url + formId + '/meta'
			});
		}

		function setCacheForDuplicate(entity) {
			delete entity.data.$$hasKey;
			delete entity.data.id;
			self.dataForDuplicate = entity;
		}

		function getCacheForDuplicate() {
			return self.dataForDuplicate || false;
		}

		function destroyCacheForDuplicate() {
			delete self.dataForDuplicate;
		}

		function getModelForNew(path) {
			return $http({
				method: 'get',
				url: url + path
			});
		}

		function customAction(data, method, sourceKey, formId) {
			return $http({
				method: 'post',
				url: url.concat(formId, '/action'),
				data: {
					data: {
						data: data,
						method: method,
						sourceKey: sourceKey
					}
				}
			});
		}

		return {
			get: get,
			update: update,
			updateFragment: updateFragment,
			getDetails: getDetails, 
			saveDetails: saveDetails,
			remove: remove,
			save: save,
			filterByArea: filterByArea,
			upload: upload,
			getMeta: getMeta,
			getCacheForDuplicate: getCacheForDuplicate,
			setCacheForDuplicate: setCacheForDuplicate,
			destroyCacheForDuplicate: destroyCacheForDuplicate,
			getModelForNew: getModelForNew,
			customAction: customAction
		}
	}
})();