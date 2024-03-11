package com.intelizign.custom_script_management.service;




import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;



public interface CustomScriptManagementService {
	

	public void getHookFile(HttpServletRequest req, HttpServletResponse resp) throws Exception;
	
	public void getRespScriptContent(HttpServletRequest req, HttpServletResponse resp) throws Exception;
	
	public void updateHookScriptContent(HttpServletRequest req, HttpServletResponse resp) throws Exception;
	
	

	
}
