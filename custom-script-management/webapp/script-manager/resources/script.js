var editor;
require.config({
	paths: {
		'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs'
	}
});

require(['vs/editor/editor.main'], function() {
	editor = monaco.editor.create(document.getElementById('editor-container'), {
		value: '',
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


var contextMenuOptions = {
	selector: '.file-item',
	callback: function(key, options) {
		var filename = $(this).text();
		var dirname = $(this).closest('.file-group').data('heading');
		if (key === 'delete') {
			deleteFile(filename, dirname);
		} else if (key === 'rename') {
			var newfilename = prompt("Enter new file name:", fileName);
			if (newFileName !== null && newFileName !== "") {
				renameFile(filename, newfilename, dirname);
			}
		}
	},
	items: {
		delete: { name: "Delete" },
		rename: { name: "Rename" }
	}
};

$(document).ready(function() {
	$.contextMenu(contextMenuOptions);
	$.ajax({
		url: 'scriptmanager?action=getHookMapObj',
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			const workItemHookMapObj = response.workItemHookMapObj;
			const liveDocHookMapObj = response.liveDocHookMapObj;
			const workFlowScriptMapObj = response.workFlowScriptMapObj;


			$('.collapse-toggle').click(function() {
				$(this).next('.file-list').slideToggle();
			});


			Object.keys(workItemHookMapObj).forEach(function(key) {
				var workItemHookScriptName = workItemHookMapObj[key].jsName;
				var dirName = "workitemsave";
				appendFileItem(workItemHookScriptName, dirName);
			});

			Object.keys(liveDocHookMapObj).forEach(function(key) {
				var liveHookScriptName = liveDocHookMapObj[key].jsName;
				var dirName = "documentsave";
				appendFileItem(liveHookScriptName, dirName);
			});

			Object.keys(workFlowScriptMapObj).forEach(function(key) {
				var workFlowScriptName = workFlowScriptMapObj[key].jsName;
				var dirName = "scripts";
				appendFileItem(workFlowScriptName, dirName);
			});


			function appendFileItem(scriptName, dirName) {
				var fileGroup = $('.file-group[data-heading="' + dirName + '"]');
				var fileItem = $('<li class="file-item">' + scriptName + '</li>');
				fileGroup.find('.file-list').append(fileItem);
			}

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
			if (response) {
				console.log("Modified Script Updated to Specific Js File");
			}
		},
		error: function(error) {
			console.error('Error occurred while updating script content:', error);
		}
	});
}



$(document).ready(function() {
	$('.plus-icon').click(function() {
		console.log('Plus icon clicked!');
		var dirName = $(this).closest('.file-group').data('heading')
		console.log("Directory Name is", dirName);
		var newFileItem = $('<div class="file-item"><input type="text" class="filename-input" placeholder="Enter file name"></div>');
		$(this).closest('.file-group').find('.file-list').append(newFileItem);

		var filenameInput = newFileItem.find('.filename-input');
		filenameInput.focus();

		filenameInput.keypress(function(event) {
			if (event.which === 13) {
				var filename = $(this).val();
				if (isValidFilename(filename)) {
					saveFile(filename, dirName);
				} else {
					alert("Invalid filename. Only filenames ending with '.js' are allowed.");
				}
				saveFile(filename, dirName);
				$(this).blur();
			}
		});

		filenameInput.blur(function() {
		});
	});
});

function isValidFilename(filename) {
	return /\.js$/.test(filename);
}


function saveFile(filename, dirname) {
	console.log('File to be saved:', filename);
	console.log('Directory Name is:', dirname);
	$.ajax({
		url: 'scriptmanager?action=saveFileName',
		type: 'POST',
		data: {
			filename: filename,
			dirname: dirname
		},
		success: function(response) {
			console.log('File saved successfully:', response);
		},
		error: function(error) {
			console.error('Error occurred while saving file:', error);
		}
	});
}

function deleteFile(filename, dirname) {
	$.ajax({
		url: 'scriptmanager?action=deleteFile',
		type: 'POST',
		data: {
			filename: filename,
			dirname: dirname
		},
		success: function(response) {
			console.log('File saved successfully:', response);
		},
		error: function(error) {
			console.error('Error occurred while renaming file:', error);
		}
	});
}

function renameFile(existingfilename, newfilename, dirname) {
	$.ajax({
		url: 'scriptmanager?action=renameFileName',
		type: 'POST',
		data: {
			existingfilename: existingfilename,
			newfilename: newfilename,
			dirname: dirname
		},
		success: function(response) {
			console.log('File saved successfully:', response);
		},
		error: function(error) {
			console.error('Error occurred while renaming file:', error);
		}
	});
}

    