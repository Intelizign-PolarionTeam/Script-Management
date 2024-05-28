package com.polarion.intelizign.administation.services;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.polarion.alm.projects.model.IProject;
import com.polarion.alm.tracker.ITrackerService;
import com.polarion.alm.tracker.model.ITypeOpt;
import com.polarion.core.util.logging.Logger;
import com.polarion.platform.core.PlatformContext;
import com.polarion.platform.persistence.IDataService;
import com.polarion.platform.persistence.IEnumObjectFactory;
import com.polarion.platform.persistence.UnresolvableObjectException;
import com.polarion.platform.persistence.model.IPObjectList;
import com.polarion.platform.security.ISecurityService;
import com.polarion.subterra.base.data.identification.IContextId;
import com.polarion.subterra.base.data.model.ICustomField;

public class polarionDetailsService<IConfigurationService> {
	
	private static final ITrackerService trackerService = (ITrackerService) PlatformContext.getPlatform()
			.lookupService(ITrackerService.class);
	private static final ISecurityService securityService = (ISecurityService) PlatformContext.getPlatform()
			.lookupService(ISecurityService.class);
	private static final IDataService dataService =(IDataService) PlatformContext.getPlatform()
			.lookupService(IDataService.class);
	private static final Logger log = Logger.getLogger(polarionDetailsService.class);
	private Map<String, String> projectList = new HashMap<String, String>();
	private Map<String, String> wiTypeList = new HashMap<String, String>();
	private List<String> customEnumValues = new ArrayList<String>();
	private Map<String, Object> responseData = new HashMap<>();
	private Gson gson = new Gson();

	public polarionDetailsService() {
    
	}
	public void getProjectDetails(HttpServletRequest req, HttpServletResponse resp) {
		try {
	        PrintWriter out = resp.getWriter();
			IPObjectList<IProject> getProjectList = trackerService.getProjectsService().searchProjects("", "id");
			System.out.println("Service class...");
			for (IProject pro : getProjectList) {
				try {
					projectList.put(pro.getId(), pro.getName());
				} catch (UnresolvableObjectException e) {
					log.error("Skipping entry due to UnresolvableObjectException: " + e.getMessage());
				} catch (Exception e) {
					log.error("Exception is" + e.getMessage());
					continue;
				}
			}
			responseData.put("projectId", projectList);
			//System.out.println("project List"+projectList);
			String jsonProjectResponse = gson.toJson(responseData);
			out.println(jsonProjectResponse);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public void getAllWorkItemType(HttpServletRequest req, HttpServletResponse resp)
	{
		try {
			String projectId = "p23_dev";
			PrintWriter out = resp.getWriter();
			List<ITypeOpt> workItemTypes=trackerService.getTrackerProject(projectId).getWorkItemTypeEnum().getAllOptions();
			
			for(ITypeOpt allTypes:workItemTypes)
			{
				wiTypeList.put(allTypes.getId(), allTypes.getName());
				
			}
			responseData.put("wiType", wiTypeList);
			System.out.println("Workitem types..."+wiTypeList);
			String jsonProjectResponse = gson.toJson(responseData);
			out.println(jsonProjectResponse);
		} catch (Exception e) {
			log.error("Exception is" + e.getMessage());
			
		}
	}
	
	public void getCustomEnumeration(HttpServletRequest req, HttpServletResponse resp)
	{
		try
		{
			PrintWriter out = resp.getWriter();
			Map<String, IEnumObjectFactory> customEnum=dataService.getEnumerationObjectFactories();
	        for (IEnumObjectFactory customEnum1 : customEnum.values())
			{ 
				customEnumValues.add(customEnum1.getName());
	            //System.out.println("All Custom Enumeration Names..........: " + customEnum1.getName()); 
	        }
			responseData.put("customEnum", customEnumValues);
			System.out.println("All Custom Enumeration Names........."+customEnumValues);
			String jsonProjectResponse = gson.toJson(responseData);
			out.println(jsonProjectResponse);
		}
		catch (Exception e) {
			log.error("Exception is" + e.getMessage());
			
		}
		
	}
	
	public void getCustomFields(HttpServletRequest req, HttpServletResponse resp)
	{
		try
		{
			IContextId contextId = trackerService.getTrackerProject("p23_dev").getContextId();
			List<ICustomField> customField = trackerService.getDataService().getCustomFieldsService().getDefinedCustomFields("WorkItem", contextId, "task");
			
			for(ICustomField fields:customField)
			{
				System.out.println("All Custom fields Ids......................"+fields.getId());
			}
		}
		catch (Exception e) {
			log.error("Exception is" + e.getMessage());
			
		}
	}
	

}
