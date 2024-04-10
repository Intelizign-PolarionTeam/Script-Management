
var editor;
var jsName;
var dirName;
function initializeEditor() {
	var editorElement = document.getElementById('editor-container');
	if (!editorElement) {
		console.error("Editor container not found");
		return;
	}

	editor = CodeMirror(editorElement, {
		mode: "javascript",
		theme: "default",
		gutters: ["CodeMirror-lint-markers"],
		lineNumbers: false
	});
	editor.setSize("990px", "650px");


	editor.on("change", function() {
		console.log("Editor content changed");
		saveHookScriptContent();
	});
}


var contextMenuOptions = {
	selector: '.file-item',
	callback: function(key, options) {
		var filename = $(this).text();
		var dirname = $(this).data('heading');
		if (key === 'delete') {
			var confirmDelete = confirm("Are you sure you want to delete this file?");
			if (confirmDelete) {
				$('.loader').removeClass('hidden');
				console.log("filenssame", filename);
				console.log("dirnamsse", dirname);
				deleteFile(filename, dirname, function() {
					setDelay();
				});
			} else {
				console.log("user haven't idea to remove the file");
			}


		} else if (key === 'rename') {
			$('#editor-container').hide();
			$('#rename-popup-Container').show();
			$('#rename-fileNameInput').val(filename).focus();



			$('#rename-popup-Container').on('click', '#renameBtn', function() {
				$('#rename-popup-Container').hide();
				var renameFilename = $('#rename-fileNameInput').val().trim();
				console.log("Rename File Name is", renameFilename);
				if (isValidFilename(renameFilename)) {
					if (isFileExists(renameFilename, dirname)) {
						alert(`Filename already exists in the following destination directory ${dirname}.`);

					} else {
						$('.loader').removeClass('hidden');
						renameFile(filename, renameFilename, dirname, function() {
							setTimeout(function() {
								$('.loader').addClass('hidden');
							}, 2000);
						});
					}
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



function initialLoad() {
	loadAboutUsPage($('#editor-container'));
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
				$('#workitemsave-file').append('<li class="file-item" data-heading="' + dirName + '" data-name="' + workItemHookScriptName + '" data-content-type="script">' + workItemHookScriptName + '</li>');

			});

			Object.keys(liveDocHookMapObj).forEach(function(key) {
				var liveHookScriptName = liveDocHookMapObj[key].jsName;
				var dirName = "documentsave";
				$('#documentsave-file').append('<li class="file-item" data-heading="' + dirName + '" data-name="' + liveHookScriptName + '" data-content-type="script">' + liveHookScriptName + '</li>');

			});

			Object.keys(workFlowScriptMapObj).forEach(function(key) {
				var workFlowScriptName = workFlowScriptMapObj[key].jsName;
				var dirName = "scripts";
				$('#scripts-file').append('<li class="file-item" data-heading="' + dirName + '" data-name="' + workFlowScriptName + '" data-content-type="script">' + workFlowScriptName + '</li>');

			});

		},
		error: function(error) {
			console.error('Error occurred while fetching hookMapObj:', error);
		}
	});
}



function setDelay() {
	setTimeout(function() {
		$('.loader').addClass('hidden');
	}, 2000);
}
var jsName;
var dirName;
$(document).ready(function() {
	initializeEditor();
	initialLoad();
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
		var fileList = $('#' + uploadFoldername + '-file');
		var newListItem = $('<li class="file-item" data-heading="' + uploadFoldername + '" data-name="' + filename + '">' + filename + '</li>');
		fileList.append(newListItem);
		saveFile(filename, uploadFoldername, function() {
			setTimeout(function() {
				$('.loader').addClass('hidden');
				newListItem.click();
				//location.reload();
			}, 2000);
		});

	});





	var directoryName;
	$(document).on('click', '.summary-icon', function() {
		directoryName = $(this).data('heading');
		console.log("create popup its working");
		$('#editor-container').hide();
		$('#popupContainer').show();
		$('#fileNameInput').focus();
		console.log("Directory name is" + directoryName);
		$('#popupTitle').text("Create File - (" + directoryName + ")");
	})

	$('#popupContainer').on('click', '#createBtn', function() {
		$('#popupContainer').hide();

		var filename = $('#fileNameInput').val().trim();
		if (isValidFilename(filename)) {
			if (isFileExists(filename, directoryName)) {
				alert(`Filename already exists in the following destination directory ${directoryName}.`);

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
			alert("Invalid filename. Only filenames ending with '.js' are allowed.");
		}
		$('#editor-container').show();
	});

	$('.info-button').click(function() {
		$('#breadcrumbNav').hide();
		console.log("info-button clicked");
		loadAboutUsPage($('#editor-container'));
	});

	$(document).on('click', '.file-item', function() {
		console.log("Scripts  clicked");
		jsName = $(this).text();
		dirName = $(this).data('heading');
		$('#breadcrumbNav').show();
		var breadcrumbHtml = '';

		if (dirName === "workitemsave" || dirName === "documentsave") {
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
		//	$('.about-us-div').remove();
		loadScriptContent(jsName, dirName);


	});



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
		console.log("save button is working");
		$('.loader').removeClass('hidden');
		saveHookScriptContent();
		setTimeout(function() {
			$('.loader').addClass('hidden');
		}, 2000);
	});



	$(document).on('click', '#closeBtn', function() {
		$('#popupContainer').hide();
		$('#editor-container').show()
	});


	$(document).on('click', '#closeBtn', function() {
		$('#rename-popup-Container').hide();
	});
});


function isFileExists(filename, directoryName) {
	console.log("File Exist");
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
	console.log("dirsname", dirName);
	console.log("jssname", jsName);
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
	console.log("dir name is..." + dirname + existingfilename + newfilename);


	var listItem = $('.file-item[data-heading="' + dirname + '"][data-name="' + existingfilename + '"]');

	if (listItem.length > 0) {
		listItem.attr('data-name', newfilename).text(newfilename);

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
	} else {
		console.error('File item not found:', existingfilename);
	}
}
var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
	acc[i].addEventListener("click", function() {
		this.classList.toggle("active");
		var panel = this.nextElementSibling;
		var arrowOpen = this.children[0];
		var arrowClose = this.children[1];
		var iconFile = [];

		for (var j = 0; j < this.children.length; j++) {
			if (this.children[j].classList.value.includes("icon")) {
				iconFile.push(this.children[j]);
			}
		}
		if (panel.style.display === "block") {
			panel.style.display = "none";
			arrowOpen.style.display = "inline-block";
			arrowClose.style.display = "none";
			for (var k = 0; k < iconFile.length; k++) {
				iconFile[k].style.display = "none";
			}
		} else {
			panel.style.display = "block";
			arrowOpen.style.display = "none";
			arrowClose.style.display = "inline-block";
			for (var k = 0; k < iconFile.length; k++) {
				iconFile[k].style.display = "block";
			}
		}
	});
}

function loadScriptContent(jsName, dirName) {
	console.log("LoadScriptContent Its Working");
	console.log("jsname", jsName);
	console.log("dirname", dirName)
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

function loadAboutUsPage(editorContainer) {
	$('#breadcrumbNav').hide();
	console.log("Loading about us page");
	var aboutUsContent = `
    <div class="about-us-div">
        <h1 style="color:#005F87;">About Us</h1>
        <ul>
            <li>Intelizign Lifecycle Services Providing Polarion Services</li>
        </ul>
        <h1 style="color:#005F87;">How to use</h1>
        <ul>
            <li>Download <b>Intelizign-LiveDoc-Save-Plugin</b> & <b>FMC-WorkItem-Save-Plugin</b></li>
            <li>Create scripts directory From Following Path<b>"[C:\\Polarion\\]"</b></li>
            <li>create <b>documentsave</b> directory and <b>workitemsave</b> directory from following path<b>"[C:\\Polarion\\scripts\\]"</b></li>
            <li>Workflow condition function script added in scripts directory</li>
            <li>Workitem Object Validation Script added in <b>workitemsave</b> directory</li>
             <li>Document Object Validation Script added in <b>documentsave</b> directory</li>
            <li>Extract above Plugins</li>
            <li>Deploy To polarion extension Directory <b>"[C:\\Polarion\\polarion\\extensions\\myPlugins\\eclipse\\plugins\\extracted Plugin Folder\\]"</b></li>
            <li>Delete .config, and metadata directory from following path <b>"[C:\\Polarion\\data\\workspace\\]"</b></li>
        </ul>
        <h4 style="color:#005F87;">Note</h4>
        <ul>
        <li>create folder name same as what above mentioned </li>
        <li>Above Plugin must be deployed in Polarion server</li>
        </ul>
    </div>
`;




	editorContainer.html(aboutUsContent);
}
function resetEditor() {
	$('#editor-container').empty();
	initializeEditor();

}
