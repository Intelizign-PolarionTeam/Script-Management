var editor;
require.config({
	paths: {
		'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs'
	}
});

require(['vs/editor/editor.main'], function() {
	editor = monaco.editor.create(document.getElementById('editor-container'), {
		language: 'javascript',
		theme: 'vs',
		automaticLayout: true, // Ensures the editor layout adapts to changes in size
        autoIndent: false
	});

	editor.onDidChangeModelContent(function(event) {
	});
});


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
			

			Object.keys(workItemHookMapObj).forEach(function(key) {
				var workItemHookScriptName = workItemHookMapObj[key].jsName;
				var dirName = "workitemsave";
				$('#workitemsave-file').append('<li class="file-item" data-heading="' + dirName + '">' + workItemHookScriptName + '</li>');
			});

			Object.keys(liveDocHookMapObj).forEach(function(key) {
				var liveHookScriptName = liveDocHookMapObj[key].jsName;
				var dirName = "documentsave";
				$('#documentsave-file').append('<li class="file-item" data-heading="' + dirName + '">' + liveHookScriptName + '</li>');
			});
			
			Object.keys(workFlowScriptMapObj).forEach(function(key) {
				var workFlowScriptName = workFlowScriptMapObj[key].jsName;
				var dirName = "scripts";
				$('#workflow-file').append('<li class="file-item" data-heading="' + dirName + '">' + workFlowScriptName + '</li>');
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


		function changeTheme(event) {
			console.log(event);
			var btn=event.target.checked;
		    if (btn) {
		        monaco.editor.setTheme("vs-dark");
		    } else {
		        // Toggle button is unchecked
		        monaco.editor.setTheme("vs");
		    }
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

              document.addEventListener('DOMContentLoaded', function() {
            var summaries = document.querySelectorAll('.summary');
            // Add click event listener to each summary element
            summaries.forEach(function(summary) {
                summary.addEventListener('click', function() {
                    console.log('Clicked on summary:', this.textContent);
                    // Remove 'active' class from all summaries
                    summaries.forEach(function(summary) {
                        summary.classList.remove('active');
                        
                    });
                    // Add 'active' class to the clicked summary
                    this.classList.add('active');
                });
            });
        });
        
        $(document).ready(function() {
	    $('.summary-icon').click(function() {
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
