angular
	.module('studio-v2')
	.controller('EventCodeController', EventCodeController);

EventCodeController.$inject = ['$uibModalInstance', 'code'];

function EventCodeController($uibModalInstance, code){
	var ctrl = this;

	ctrl.expression = code;
	ctrl.cancel = $uibModalInstance.dismiss;
	ctrl.ok = ok;

	function ok(){
		$uibModalInstance.close(ctrl.expression);
	}
}