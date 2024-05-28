var jsName;
var dirName;
var isFile = false;
var editor;
function initializeEditor() {
	var editorElement = document.getElementById('editor-container');
	if (!editorElement) {
		console.error("Editor container not found");
		return;
	}
	editor = CodeMirror(editorElement, {
		mode: "javascript",
		gutters: ["CodeMirror-lint-markers"],
		lineNumbers: false
	});

	editor.setSize("100%", "100%");
	editor.on("keyup", function() {
		isFile = true;
	});
}

function resetFileChangedFlag() {
	isFile = false;
}

var contextMenuOptions = {
	selector: '.file-item',
	callback: function(key, options) {
		var filename = $(this).text();
		var dirname = $(this).data('heading');
		if (key === 'delete') {
			var confirmDelete = confirm("Are you sure you want to delete the file '" + filename + "' from the directory '" + dirname + "'?");
			if (confirmDelete) {
				$('.loader').removeClass('hidden');
				deleteFile(filename, dirname, function() {
					setDelay();
				});
			} else {
				console.log("Failed to remove the file");
			}

		} else if (key === 'rename') {
			$('#editor-container').hide();
			$('#breadcrumbNav').hide();
			$('#rename-popup-Container').show();
			$('#rename-fileNameInput').val(filename).focus();
			$('#rename-popup-Container').off('click', '#renameBtn').on('click', '#renameBtn', function() {
				$('#rename-popup-Container').hide();
				$('#breadcrumbNav').show();
				var renameFilename = $('#rename-fileNameInput').val().trim();
				if (isValidFilename(renameFilename)) {
					if (isFileExists(renameFilename, dirname)) {
						alert(`Filename already exists in the following destination directory ${dirname}.`);
					} else {
						$('.loader').removeClass('hidden');
						var fileList = $('#' + dirname + '-file');
						fileList.find(`li[data-name="${filename}"]`).remove();
						var renameFileList = $('<li class="file-item" data-heading="' + dirname + '" data-name="' + renameFilename + '">' + renameFilename + '</li>');
						fileList.append(renameFileList);
						renameFile(filename, renameFilename, dirname, function() {
							setTimeout(function() {
								$('.loader').addClass('hidden');
								renameFileList.click();
							}, 2000);
						});
					}
				} else {
					alert("Invalid filename. Only'.js' files  allowed.");
				}
				$('#editor-container').show();
			});

		}
	},
	items: {
		delete: { name: "Delete" },
		rename: { name: "Rename" }
	}
};


function initialLoad(infoClicked) {
	infoClicked = true;
	loadAboutUsPage();
	$('[data-toggle="tooltip"]').tooltip();
	$.contextMenu(contextMenuOptions);
	$.ajax({
		url: 'scriptmanager?action=getHookMapObj',
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			if (response !== null) {
				const workItemHookMapObj = response.workItemHookMapObj;
				const liveDocHookMapObj = response.liveDocHookMapObj;
				const workFlowScriptMapObj = response.workFlowScriptMapObj;
				if (workItemHookMapObj) {
					Object.keys(workItemHookMapObj).forEach(function(key) {
						var workItemHookScriptName = workItemHookMapObj[key].jsName;
						var dirName = "workitemsave";
						$('#workitemsave-file').append('<li class="file-item" data-heading="' + dirName + '" data-name="' + workItemHookScriptName + '" data-content-type="script">' + workItemHookScriptName + '</li>');
					});
				}
				if (liveDocHookMapObj) {
					Object.keys(liveDocHookMapObj).forEach(function(key) {
						var liveHookScriptName = liveDocHookMapObj[key].jsName;
						var dirName = "livedocumentsave";
						$('#livedocumentsave-file').append('<li class="file-item" data-heading="' + dirName + '" data-name="' + liveHookScriptName + '" data-content-type="script">' + liveHookScriptName + '</li>');
					});
				}
				if (workFlowScriptMapObj) {
					Object.keys(workFlowScriptMapObj).forEach(function(key) {
						var workFlowScriptName = workFlowScriptMapObj[key].jsName;
						var dirName = "scripts";
						$('#scripts-file').append('<li class="file-item" data-heading="' + dirName + '" data-name="' + workFlowScriptName + '" data-content-type="script">' + workFlowScriptName + '</li>');
					});
				}
			} else {
				console.error('Response object is null.');
			}
		},
		error: function(error) {
			console.error('Error occurred while fetching hookMapObj:', error);
		}
	});
}


function setDelay() {
	setTimeout(function() {
		$('.loader').addClass('hidden');
		$('#editor-container').hide();
		$('#breadcrumbNav').hide();
	}, 2000);
}


var jsName;
var dirName;

$(document).ready(function() {
	var infoClicked = false;
	initializeEditor();
	initialLoad(infoClicked);
	var uploadFoldername;
	$('.upload-icon').click(function(event) {
		event.preventDefault();
		event.stopPropagation();
		var inputId = $(this).data('input-target').trim();
		uploadFoldername = $(this).data('heading');
		$('#' + inputId).trigger('click');
	});


	$(document).on('change', '#fileInput-workitemsave', function(event) {
		var files = event.target.files;

		if (files.length > 0) {
			var filename = files[0].name;

			if (isFileExists(filename, uploadFoldername)) {
				alert(`Filename already exists in the following destination directory ${uploadFoldername}.`);
			} else {
				$('.loader').removeClass('hidden');
				var fileList = $('#' + uploadFoldername + '-file');
				var newListItem = $('<li class="file-item" data-heading="' + uploadFoldername + '" data-name="' + filename + '">' + filename + '</li>');
				fileList.append(newListItem);
				handleFileUpload(files, function(content) {
					saveFile(filename, uploadFoldername, function() {
						setTimeout(function() {
							$('.loader').addClass('hidden');
							uploadedFileScriptContent(filename, uploadFoldername, content, function() {
								newListItem.click();
								$('#fileInput-workitemsave').val('');
							});
						}, 2000);
					});
				});
			}
		} else {
			console.log("No files selected");
		}
	});


	$('.info-button').click(function() {
		infoClicked = true;
		$('#breadcrumbNav').hide();
		loadAboutUsPage();
	});
	$(document).on('click', '.file-item', function() {
		var isContinue = true;
		infoClicked = false;
		if (isFile) {
			var _confirm = confirm("Discard changes?");
			if (!_confirm) {
				isContinue = false;
			}
		}
		if (isContinue) {
			resetFileChangedFlag();
			jsName = $(this).text();
			dirName = $(this).data('heading');
			$('#breadcrumbNav').show();
			$('#editor-container').css('margin-top', '40px');
			$('#editor-container').show();
			$('#about-us-div').hide();
			var breadcrumbHtml = '';
			if (dirName === "workitemsave" || dirName === "livedocumentsave") {
				breadcrumbHtml += `
			<li class="breadcrumb-item"><a>polarion</a></li>
			<li class="breadcrumb-item"><a>scripts</a></li>
			<li class="breadcrumb-item active-list" aria-current="page">${dirName}</li>
                `;
			} else if (dirName === "scripts") {
				breadcrumbHtml += `
			<li class="breadcrumb-item"><a>polarion</a></li>
			<li class="breadcrumb-item active-list" aria-current="page">${dirName}</li>
                `;
			}
			breadcrumbHtml += `
			<li class="breadcrumb-item active-list" aria-current="page">${jsName}</li>
            `;
			$('#breadcrumbNav .breadcrumb').html(breadcrumbHtml);
			loadScriptContent(jsName, dirName);
		}
	});

	const bar = document.querySelector('.split__bar');
	const left = document.querySelector('.split__left');
	const right = document.querySelector('.split__right');

	let isMouseDown = false;
	bar.addEventListener('mousedown', (e) => {
		isMouseDown = true;
	});
	document.addEventListener('mousemove', (e) => {
		if (!isMouseDown) return;
		left.style.width = `${e.clientX}px`;
	});
	document.addEventListener('mouseup', () => {
		isMouseDown = false;
	});

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

	$(document).on('click', '#saveButton', function() {
		$('.loader').removeClass('hidden');
		saveHookScriptContent();
		setTimeout(function() {
			$('.loader').addClass('hidden');
		}, 2000);
	});

	$(document).on('click', '#closeBtn', function() {
		$('#popupContainer').hide();
		if(infoClicked){
			$('#about-us-div').show();
		}else{
		$('#editor-container').show();
		$('#breadcrumbNav').show();
		}
		$('#rename-popup-Container').hide();
	});

});

function isFileExists(filename, directoryName) {
	var existingFiles = $('.file-item[data-heading="' + directoryName + '"]');
	for (var i = 0; i < existingFiles.length; i++) {
		if (existingFiles[i].textContent.trim() === filename) {
			return true;
		}
	}
	return false;
}
function isValidFilename(filename) {
	return /\.js$/.test(filename);
}
function saveFile(filename, foldername, callback) {
	isFile = false;
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
function uploadedFileScriptContent(jsName, dirName, content, callback) {
	$.ajax({
		url: 'scriptmanager?action=updatedScriptContent',
		type: 'POST',
		dataType: 'json',
		data: {
			hookScriptContent: content,
			heading: dirName,
			jsName: jsName
		},
		success: function(response) {
			if (response && response.status === "success") {
				if (callback && typeof callback === 'function') {
					callback();
				}
			} else {
				console.error('Error occurred while updating script content:', response);
			}
		},
		error: function(xhr, status, error) {
			console.error('Error occurred while updating script content:', status, error);
			console.log(xhr.responseText);
		}
	});
}
function deleteFile(filename, dirname, callback) {
	var fileList = $('#' + dirname + '-file');
	var listItem = fileList.find('.file-item[data-name="' + filename + '"]');
	if (listItem.length > 0) {
		listItem.remove();
	} else {
		console.warn('File item not found:', filename);
	}
	$.ajax({
		url: 'scriptmanager?action=deleteFile',
		type: 'POST',
		data: {
			filename: filename,
			dirname: dirname
		},
		success: function(response) {
			console.log('File deleted successfully:', response);
			if (callback && typeof callback === 'function') {
				callback();
			}
		},
		error: function(error) {
			console.error('Error occurred while deleting file:', error);
		}
	});
}
function saveHookScriptContent() {
	isFile = false;
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
			if (response && response.status === "success") {
			} else {
				console.error('Error occurred while updating script content:', response);
			}
		},
		error: function(xhr, status, error) {
			console.error('Error occurred while updating script content:', status, error);
			console.log(xhr.responseText);
		}
	});
}

function renameFile(existingfilename, newfilename, dirname, callback) {
	$.ajax({
		url: 'scriptmanager?action=renameFileName',
		type: 'POST',
		data: {
			existingfilename: existingfilename,
			newfilename: newfilename,
			dirname: dirname
		},
		success: function(response) {
			console.log('File renamed successfully:', response);
			if (callback && typeof callback === 'function') {
				callback();
			}
		},
		error: function(error) {
			console.error('Error occurred while renaming file:', error);
		}
	});
}
var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
	acc[i].addEventListener("click", function(event) {
		if (!event.target.classList.contains("summary-icon")) {
			this.classList.toggle("active");
			var panel = this.nextElementSibling;
			var arrowOpen = this.querySelector('.open');
			var arrowClose = this.querySelector('._close');
			var iconFile = this.querySelector('.icon');
			if (panel.style.display === "block") {
				panel.style.display = "none";
				arrowOpen.style.display = "inline-block";
				arrowClose.style.display = "none";
				iconFile.style.display = "none";
			} else {
				panel.style.display = "block";
				arrowOpen.style.display = "none";
				arrowClose.style.display = "inline-block";
				iconFile.style.display = "block";
			}
		}
		event.stopPropagation();
	});
}
var directoryName;
var createFileIcons = document.querySelectorAll('.summary-icon');
createFileIcons.forEach(function(createFileIcon) {
	createFileIcon.addEventListener('click', function(event) {
		event.stopPropagation();
		directoryName = $(this).data('heading');
		$('#editor-container').hide();
		$('#breadcrumbNav').hide();
		$('#about-us-div').hide();
		$('#popupContainer').show();
		$('#fileNameInput').focus();
		$('#popupTitle').text("Create File - (" + directoryName + ")");
	});
});

$('#popupContainer').on('click', '#createBtn', function() {
	isFile = false;
	var preventCreatePopup = false;
	$('#popupContainer').hide();
	$('#breadcrumbNav').show();
	var filename = $('#fileNameInput').val().trim();
	if (isValidFilename(filename)) {
		if (isFileExists(filename, directoryName)) {
			preventCreatePopup = true;
			alert(`Filename '${filename}' already exists in the following destination directory '${directoryName}'.`);
		} else {
			$('.loader').removeClass('hidden');
			var fileList = $('#' + directoryName + '-file');
			var newListItem = $('<li class="file-item" data-heading="' + directoryName + '" data-name="' + filename + '">' + filename + '</li>');
			fileList.append(newListItem);
			saveFile(filename, directoryName, function() {
				setTimeout(function() {
					newListItem.click();
					$('.loader').addClass('hidden');
				}, 2000);
			});
		}
	} else {
		alert("Invalid filename. Only'.js' files will be allowed.");
		preventCreatePopup = true;
	}
	
	if(preventCreatePopup){
		$('#popupContainer').show();
		$('#breadcrumbNav').hide();
		$('#editor-container').hide();
	}else{
	$('#editor-container').show();
	}
});

function loadScriptContent(jsName, dirName) {
	$.ajax({
		url: `scriptmanager?action=getRespFileScriptContent&jsFileName=${jsName}&heading=${dirName}`,
		type: 'GET',
		dataType: 'json',
		success: function(response) {
			hookScriptContent = response.hookScriptContent;
			resetEditor();
			editor.setOption('lineNumbers', true);
			editor.setValue(hookScriptContent);
		},
		error: function(error) {
			console.error('Error occurred while fetching script content:', error);
		}
	});
}
function loadAboutUsPage() {
	$('#breadcrumbNav').hide();
	$('#editor-container').hide();
	var isContinu = true;
	if (isFile) {
		var _confirm = confirm("Discard changes?");
		console.log("confirm"+_confirm); //User select i want to discard is true cancel false
		if (!_confirm) {
			console.log("Its triggered when");
			isContinu = false;
		}
	}
	if (isContinu) {  //its only work when condition true
		resetFileChangedFlag();
		$('#editor-container').css('margin-top', '0px');
		$('#about-us-div').css('display', 'block');
	}else{
		$('#breadcrumbNav').show();
		$('#editor-container').show();
		$('#about-us-div').hide();
		
	}
}
function resetEditor() {
	$('#editor-container').empty();
	initializeEditor();
}
function handleFileUpload(files, callback) {
	try {
		const file = files[0];
		const reader = new FileReader();
		reader.onload = function(e) {
			const content = e.target.result;
			callback(content);
		};
		reader.readAsText(file);
	} catch (error) {
		console.error("Error handling file upload:", error);
	}
}