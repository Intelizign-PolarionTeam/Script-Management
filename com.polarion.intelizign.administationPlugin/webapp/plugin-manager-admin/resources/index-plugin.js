/*$(document).ready(function() {
				 alert("working..........");
                jQuery.ajax({
					
					url: "ui?action=getProjectDetails",
					type: "GET",
					dataType: "json",
					success: function(data) {
						alert("working 12..........");
						console.log("project data...."+data)
						const projectId = data.projectId;
						console.log("Data is", projectId);
			 
						const selectElement = $("#projectDropDown");
						selectElement.empty();
			 
						try {
							// Use Object.entries() to get an array of [key, value] pairs from the projectId object
							for (const [key, name] of Object.entries(projectId)) {
								const option = $("<option>").val(key).text(name);
								selectElement.append(option);
							}
						} catch (error) {
							console.error("Error processing data:", error);
						}
					},
					error: function(error) {
						alert("working 12..........");
						console.error("Error message is", error.statusText);
		}
	});
});
	*/