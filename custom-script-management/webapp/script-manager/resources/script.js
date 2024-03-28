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


});




var contextMenuOptions = {
	selector: '.file-item',
	callback: function(key, options) {
		var filename = $(this).text();
		console.log("Comming insdie rename..." + filename);
		var dirname = $(this).closest('.file-group').data('heading');
		if (key === 'delete') {
			$('.loader').removeClass('hidden')
			deleteFile(filename, dirname);
			setDelay();

		} else if (key === 'rename') {
			$('#rename-popup-Container').removeClass('hidden');
			$('#rename-fileNameInput').val(filename).focus();

			$('#rename-popup-Container').on('click', '#renameBtn', function() {
				var renameFilename = $('#rename-fileNameInput').val().trim();
				console.log("Rename File Name is", renameFilename);
				if (isValidFilename(renameFilename)) {
					console.log("Existing File Name", filename);
					console.log("Renamed File Name", renameFilename);
					console.log("Directory Name is", dirname);
					$('.loader').removeClass('hidden')
					renameFile(filename, renameFilename, dirname);
					setDelay();
					alert("Your file is renamed Successfully in" + " " + dirname + " folder.");
					location.reload();
					$('#rename-popup-Container').addClass('hidden');
				} else {
					alert("Invalid filename. Only filenames ending with '.js' are allowed.");
				}
			});
		}
	},
	items: {
		delete: { name: "Delete" },
		rename: { name: "Rename" }
	}
};

document.addEventListener('DOMContentLoaded', function() {
	const bar = document.querySelector('.split__bar');
	const left = document.querySelector('.split__left');
	let mouseIsDown = false;

	bar.addEventListener('mousedown', function(e) {
		mouseIsDown = true;
	});

	document.addEventListener('mousemove', function(e) {
		if (!mouseIsDown) return;
		left.style.width = e.clientX + 'px';
	});

	document.addEventListener('mouseup', function() {
		mouseIsDown = false;
	});
});

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

			console.log("liveDocHookMapObj", liveDocHookMapObj);
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
	console.log("dir name...." + dirName);
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
function setDelay() {
	setTimeout(function() {
		location.reload();
	}, 2000);
}


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


/*function changeTheme(event) {
	console.log(event);
	var btn = event.target.checked;
	if (btn) {
		monaco.editor.setTheme("vs-dark");
	} else {
		// Toggle button is unchecked
		monaco.editor.setTheme("vs");
	}
}*/

document.addEventListener('DOMContentLoaded', function() {
	var summaries = document.querySelectorAll('.summary');
	summaries.forEach(function(summary) {
		summary.addEventListener('click', function() {
			summaries.forEach(function(summary) {
				summary.classList.remove('active');
			});
			this.classList.add('active');
		});
	});
});

$(document).ready(function() {
	// Function to handle file uploads
	$('#popupContainer').addClass('hidden');
	$('#rename-popup-Container').addClass('hidden');
	// Function to handle file uploads
	$('.upload-icon').click(function() {
		console.log("upload event triggered");
		var inputId = $(this).data('input-target').trim();
		var foldername = $(this).data('heading');
		console.log("inputId:", inputId);
		$('#' + inputId).trigger('click');
		console.log("foldername id", foldername);
	});

	// Event handler for file input change
	$(document).on('change', '#fileInput-workitemsave', function() {
		var filename = $(this).val().split('\\').pop();
		console.log('Uploaded filename:', filename);
		var foldername = $(this).data('heading');
		$('.loader').removeClass('hidden');
		saveFile(filename, foldername);
		setDelay();
	});

	// Event handler for file item click
	$(document).on('click', '.file-item', function() {
		jsName = $(this).text();
		dirName = $(this).data('heading');
		console.log("dir name...." + dirName);
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
var directoryName;
	$(document).on('click', '.summary-icon', function() {
		directoryName = $(this).data('heading');
		console.log("create popup its working");
		$('#popupContainer').removeClass('hidden');
		$('#fileNameInput').focus();
	})
	// Event handler for the create button in the popup
	$('#popupContainer').on('click', '#createBtn', function() {
		
		var filename = $('#fileNameInput').val().trim();
		if (isValidFilename(filename)) {
			$('.loader').removeClass('hidden');
			saveFile(filename, directoryName);
			setDelay();
			$('#popupContainer').addClass('hidden');
		} else {
			alert("Invalid filename. Only filenames ending with '.js' are allowed.");
		}
	});

	// Event handler for the close button in the popup
	$('#popupContainer').on('click', '#closeBtn', function() {
		$('#popupContainer').addClass('hidden');
	});

	// Event handler for the close button in the rename popup
	$('#rename-popup-Container').on('click', '#closeBtn', function() {
		$('#rename-popup-Container').addClass('hidden');
	});
});

// Other functions...




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
	console.log("filename", filename);
	console.log("dirname", dirname);
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
	console.log("dir name is..." + dirname + existingfilename + newfilename);
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