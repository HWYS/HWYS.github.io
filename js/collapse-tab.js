// Collapse the tab to reduce the content height

var $myGroup = $('#tools');
	$myGroup.on('show.bs.collapse','.collapse', function() {
	$myGroup.find('.collapse.in').collapse('hide');
});

$($('#tools').find(window.location.hash + '>button:first').attr('data-target')).collapse('show');