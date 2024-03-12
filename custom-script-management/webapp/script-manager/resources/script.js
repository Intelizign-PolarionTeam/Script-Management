var editor;
require.config({
	paths: {
		'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs'
	}
});

require(['vs/editor/editor.main'], function() {
	editor = monaco.editor.create(document.getElementById('editor-container'), {
		language: 'javascript',
		theme: 'vs-dark'
	});

	editor.onDidChangeModelContent(function(event) {
	});
});

function changeTheme() {
	var selectedTheme = document.getElementById('themeDropdown').value;
	monaco.editor.setTheme(selectedTheme);
}
$(document).ready(function() {
	$.ajax({
		url: 'scriptmanager?action=getHookMapObj',
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			const workItemHookMapObj = response.workItemHookMapObj;
			const liveDocHookMapObj = response.liveDocHookMapObj;
			const workFlowScriptMapObj = response.workFlowScriptMapObj;
			

			Object.keys(workItemHookMapObj).forEach(function(key) {
				var workItemHookScriptName = workItemHookMapObj[key].jsName;
				var dirName = "workitemsave";
				$('#fileList').append('<li class="file-item" data-heading="' + dirName + '">' + workItemHookScriptName + '</li>');
			});

			Object.keys(liveDocHookMapObj).forEach(function(key) {
				var liveHookScriptName = liveDocHookMapObj[key].jsName;
				var dirName = "documentsave";
				$('#fileList').append('<li class="file-item" data-heading="' + dirName + '">' + liveHookScriptName + '</li>');
			});
			
			Object.keys(workFlowScriptMapObj).forEach(function(key) {
				var workFlowScriptName = workFlowScriptMapObj[key].jsName;
				var dirName = "scripts";
				$('#fileList').append('<li class="file-item" data-heading="' + dirName + '">' + workFlowScriptName + '</li>');
			});

		},
		error: function(error) {
			console.error('Error occurred while fetching hookMapObj:', error);
		}
	});
})

var jsName;
var dirName;
$(document).on('click', '.file-item', function() {
     jsName = $(this).text();
     dirName = $(this).data('heading');

    $.ajax({
        url: `scriptmanager?action=getRespFileScriptContent&jsFileName=${jsName}&heading=${dirName}`,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            const hookScriptContent = response.hookScriptContent;
            editor.setValue(hookScriptContent);
        },
        error: function(error) {
            console.error('Error occurred while fetching script content:', error);
        }
    });
});

function saveHookScriptContent() {
    var scriptContent = editor.getValue();
    $.ajax({
        url: 'scriptmanager?action=updatedScriptContent',
        type: 'POST',
        dataType: 'json',
        data: {
            hookScriptContent: scriptContent,
            heading: dirName,
            jsName: jsName
        },
        success: function(response) {
			if(response){
            console.log("Modified Script Updated to Specific Js File");
            }
        },
        error: function(error) {
            console.error('Error occurred while updating script content:', error);
        }
    });
}

