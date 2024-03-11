$(document).ready(function() {
	$.ajax({
		url: 'scriptmanager?action=getHookMapObj',
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			const workItemHookMapObj = response.workItemHookMapObj;
			const liveDocHookMapObj = response.liveDocHookMapObj;
			$('#workItemHookTableBody').empty();

			Object.keys(workItemHookMapObj).forEach(function(key) {
				var jsName = workItemHookMapObj[key].jsName;


				var row = '<tr class="polarion-rpw-table-content-row">';
				row += '<td>' + jsName + '</td>';
				row += '<td><a href="#" class="edit-icon" data-script-id="' + key + '" data-js-name="' + jsName + '"><i class="fas fa-edit"></i></a></td>';
				row += '</tr>';

				$('#workItemHookTableBody').append(row);
			});
			
			Object.keys(liveDocHookMapObj).forEach(function(key) {
				var jsName = liveDocHookMapObj[key].jsName;


				var row = '<tr class="polarion-rpw-table-content-row">';
				row += '<td>' + jsName + '</td>';
				row += '<td><a href="#" class="edit-icon" data-script-id="' + key + '" data-js-name="' + jsName + '"><i class="fas fa-edit"></i></a></td>';
				row += '</tr>';

				$('#liveDocHookTableBody').append(row);
			});
			
		},
		error: function(error) {
			console.error('Error occurred while fetching hookMapObj:', error);
		}
	});
})
var heading;
var scriptId;
var jsName;
$(document).on('click', '.edit-icon', function(e) {
	e.preventDefault();
	heading = $('.polarion-rpw-table-header-row th:first').text();
	console.log("heading is",heading);
	scriptId = $(this).data('script-id');//Row Index
	jsName = $(this).data('js-name');//Script Name

	console.log('JavaScript name:', jsName);
	console.log('JavaScript name:', heading);

	$.ajax({
    url: `scriptmanager?action=getRespFileScriptContent&jsFileName=${jsName}&heading=${heading}`,
    type: 'GET',
    dataType: 'json',
    success: function(response) {
        const hookScriptContent = response.hookScriptContent;
       // console.log("HookScriptContent", hookScriptContent);

        $('#popupHeading').text('Edit Script: ' + jsName);

        var editor = $('#scriptEditor');
        if (editor.length === 0) {
            console.log("Creating new editor...");
            editor = $('<textarea id="scriptEditor" rows="10" cols="100" class="language-javascript"></textarea>');
            console.log("New editor created:", editor);
            var popupBody = $('.popup-body'); 
            console.log("Popup body:", popupBody);
            popupBody.empty().append(editor);

           //editor.css('overflow-y', 'auto');
            setTimeout(function() {
                console.log("Editor appended to popup body:", popupBody.html());
            }, 100);
        }
        editor.val(hookScriptContent);
        Prism.highlightElement(editor[0]);

        $('#popupModel').show();
    },
    error: function(error) {
        console.error('Error occurred while fetching script content:', error);
    }
});


});

function closeDetailsModel() {
	$('#popupModel').hide();
}

function saveHookScriptContent() {
	console.log("Save Hook Script");
	console.log("heading is",heading);
	var scriptContent = $('#scriptEditor').val();
    $.ajax({
        url: 'scriptmanager?action=updatedScriptContent',
        type: 'POST',
        dataType: 'json',
        data: { hookScriptContent: scriptContent,
        		heading: heading,
        		scriptId: scriptId,
        		jsName: jsName
        		 }, 
        success: function(response) {
          
            
        },
        error: function(error) {
            console.error('Error occurred while updating script content:', error);
           
        }
    });
}
