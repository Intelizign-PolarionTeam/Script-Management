package com.polarion.intelizign.administation.services;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.polarion.alm.projects.model.IProject;
import com.polarion.alm.projects.model.IUser;
import com.polarion.alm.tracker.ITrackerService;
import com.polarion.core.util.logging.Logger;
import com.polarion.platform.core.PlatformContext;
import com.polarion.platform.persistence.UnresolvableObjectException;
import com.polarion.platform.persistence.model.IPObjectList;
import com.polarion.platform.security.ISecurityService;

public class polarionDetailsService {
	
	private static final ITrackerService trackerService = (ITrackerService) PlatformContext.getPlatform()
			.lookupService(ITrackerService.class);
	private static final ISecurityService securityService = (ISecurityService) PlatformContext.getPlatform()
			.lookupService(ISecurityService.class);
	private static final Logger log = Logger.getLogger(polarionDetailsService.class);
	private Map<String, String> userMap = new HashMap<String, String>();
	private Map<String, Object> responseData = new HashMap<>();
	private Gson gson = new Gson();

	public polarionDetailsService() {
    
	}
	public void getUserDetails(HttpServletRequest req, HttpServletResponse resp) {
	try {
		PrintWriter out = resp.getWriter();
		String projectId = "p23_dev";
		IProject trackerProject = trackerService.getProjectsService().getProject(projectId);
		IPObjectList<IUser> userList = trackerService.getProjectsService().getProjectUsers(trackerProject);
		//System.out.println("IPObjectList:" + userList);
		for (IUser user : userList) {
			//System.out.println("User List" + user);
		try {
			userMap.put(user.getId(), user.getName());
			} catch (UnresolvableObjectException e) {
					log.error("Skipping entry due to UnresolvableObjectException: " + e.getMessage());
				} catch (Exception e) {
					log.error("Exception is" + e.getMessage());
					continue;
				}
			}
		System.out.println("User map Object...."+userMap);
		JsonObject responseData = new JsonObject();
        responseData.add("userMap", gson.toJsonTree(userMap));
        String jsonProjectResponse = gson.toJson(responseData);
        resp.setContentType("application/json");
        out.write(jsonProjectResponse);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
