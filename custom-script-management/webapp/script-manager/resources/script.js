var editor;

document.addEventListener('DOMContentLoaded', function() {
	var editorElement = document.getElementById('editor-container');
	editor = CodeMirror(editorElement, {
		mode: "javascript",
		theme: "default",
		lineNumbers: false
	});
	editor.setSize("990px", "650px");
});

var contextMenuOptions = {
	selector: '.file-item',
	callback: function(key, options) {
		var filename = $(this).text();
		console.log("Comming insdie rename..." + filename);
		var dirname = $(this).closest('.file-group').data('heading');
		if (key === 'delete') {
				$('.loader').removeClass('hidden')
				console.log("filenssame",filename);
				console.log("dirnamsse",dirname);
				deleteFile(filename, dirname, function() {
					setDelay();
					
				});


		} else if (key === 'rename') {
			$('#editor-container').hide();
			$('#rename-popup-Container').show();
			$('#rename-fileNameInput').val(filename).focus();

			$('#rename-popup-Container').on('click', '#renameBtn', function() {
				$('#rename-popup-Container').hide();
				$('#editor-container').hide();
				var renameFilename = $('#rename-fileNameInput').val().trim();
				console.log("Rename File Name is", renameFilename);
				if (isValidFilename(renameFilename)) {
					$('.loader').removeClass('hidden');
					renameFile(filename, renameFilename, dirname, function(){
					setTimeout(function() {
						location.reload(true);
					}, 2000);
					});
					//$('#rename-popup-Container').hide();
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
  $('[data-toggle="tooltip"]').tooltip();   
	$.contextMenu(contextMenuOptions);
	$.ajax({
		url: 'scriptmanager?action=getHookMapObj',
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			const workItemHookMapObj = response.workItemHookMapObj;
			const liveDocHookMapObj = response.liveDocHookMapObj;
			const workFlowScriptMapObj = response.workFlowScriptMapObj;

			console.log("workItemHookMapObj", workItemHookMapObj);
			console.log("liveDocHookMapObj", liveDocHookMapObj);
			console.log("workFlowScriptMapObj", workFlowScriptMapObj);
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
	$('#breadcrumbNav').show();
	$('.editor-header-div').removeClass('hidden');
	jsName = $(this).text();
	dirName = $(this).data('heading');
	$('.editor-header-div').text(jsName);
	console.log("dir name...." + dirName);

	$('.breadcrumb-item:nth-child(2) a').text(dirName);
	$('.breadcrumb-item.active').text(jsName);

	$.ajax({
		url: `scriptmanager?action=getRespFileScriptContent&jsFileName=${jsName}&heading=${dirName}`,
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			const hookScriptContent = response.hookScriptContent;
			editor.setOption('lineNumbers', true);
			editor.setValue(hookScriptContent);
		},
		error: function(error) {
			console.error('Error occurred while fetching script content:', error);
		}
	});
});


function setDelay() {
	setTimeout(function() {
		location.reload(true);
	}, 5000);
}


function saveHookScriptContent() {
	var scriptContent = editor.getValue();
	console.log("jsname",jsName);
	console.log("dirName",dirName);
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
	//$('#popupContainer').addClass('hidden');
	//$('#rename-popup-Container').addClass('hidden');
	var uploadFoldername;
	$('.upload-icon').click(function() {
		var inputId = $(this).data('input-target').trim();
		uploadFoldername = $(this).data('heading');
		console.log("inputId:", inputId);
		$('#' + inputId).trigger('click');
	});


	$(document).on('change', '#fileInput-workitemsave', function() {
		var filename = $(this).val().split('\\').pop();
		$('.loader').removeClass('hidden');
		saveFile(filename, uploadFoldername, function(){
			setTimeout(function() {
			location.reload();
			}, 2000);
			});
			
	});


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
		$('#editor-container').hide();
		$('#popupContainer').show();
		$('#fileNameInput').focus();
	})

	$('#popupContainer').on('click', '#createBtn', function() {
		$('#popupContainer').hide();
		$('#editor-container').show();
		var filename = $('#fileNameInput').val().trim();
		if (isValidFilename(filename)) {
			$('.loader').removeClass('hidden');
			saveFile(filename, directoryName, function(){
			setTimeout(function() {
			location.reload(true);
			}, 2000);
			});
		} else {
			alert("Invalid filename. Only filenames ending with '.js' are allowed.");
		}
	});


	$('#popupContainer').on('click', '#closeBtn', function() {
		$('#popupContainer').hide();
	});


	$('#rename-popup-Container').on('click', '#closeBtn', function() {
		$('#rename-popup-Container').hide();
	});
});

// Other functions...




function isValidFilename(filename) {
	return /\.js$/.test(filename);
}

function saveFile(filename, foldername, callback) {
	$.ajax({
		url: 'scriptmanager?action=saveFileName',
		type: 'POST',
		data: {
			filename: filename,
			dirname: foldername
		},
		success: function(response) {
			console.log('File saved successfully:', response);
			if (callback && typeof callback === 'function') {
				callback();
			}
		},
		error: function(error) {
			console.error('Error occurred while saving file:', error);
		}
	});
}

function deleteFile(filename, dirname, callback) {
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
			if (callback && typeof callback === 'function') {
				callback();
			}
		},
		error: function(error) {
			console.error('Error occurred while renaming file:', error);
		}
	});
}

function renameFile(existingfilename, newfilename, dirname, callback) {
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
			if (callback && typeof callback === 'function') {
				callback();
			}
		},
		error: function(error) {
			console.error('Error occurred while renaming file:', error);
		},

	});
}