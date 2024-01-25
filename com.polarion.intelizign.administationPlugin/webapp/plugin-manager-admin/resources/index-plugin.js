const newButton = document.createElement('button');
newButton.textContent = 'Click me!';
document.body.appendChild(newButton);
newButton.addEventListener('click',onSubmit)
function onSubmit()
	{
	var timestamp = new Date().getTime();
	var currentUrl = window.location.href;
	console.log("current url is:" + currentUrl);
	var queryString = currentUrl.split('?')[1];
	var params = new URLSearchParams(queryString);
	var scopeValue = params.get('scope');
	var url = "";

	if (params.has('scope')) {
		console.log("Scope parameter is present.");
		console.log("Scope is:"+scopeValue);
		var projectScope = scopeValue.split('project/')[1];
		var projectId = projectScope.split('/')[0];
		var url = `ui?action=getUserDetails&projectId=${projectId}&_nocache=${timestamp}`;
		console.log("Url" + url);



		jQuery.ajax({
			url: url,
			method: "GET",
			contentType: "application/json",
			success: function(data) {
				console.log("Data value is"+data);
				//const userList = data.userMap;
				//populateTable(userList);
				//console.log("UserMap is:" + userList);
			},

			error: function(xhr, status, error) {
				console.error("Error message is", error);
			}

		});

	} else {
		console.log("Scope parameter is not present.");
	}

}

function populateTable(userMap) {

	const userTableBody = $("#userTableBody");
	let isLightRow = true;


	userTableBody.empty();
	for (const userId in userList) {

		if (userList.hasOwnProperty(userId)) {
			const userName = userList[userId];
			const newRow = $("<tr>");

			newRow.addClass(isLightRow ? "polarion-rpw-table-content-row-light" : "polarion-rpw-table-content-row-dark");
			isLightRow = !isLightRow;

			const cellId = $("<td>").text(userId);
			const cellName = $("<td>").text(userName);
			
			newRow.append(cellId, cellName);
			userTableBody.append(newRow);

		}

	}
	}