package com.intelizign.custom_script_management.servlet;

import com.intelizign.custom_script_management.impl.CustomScriptManagementImpl;
import com.intelizign.custom_script_management.service.CustomScriptManagementService;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.polarion.core.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import java.io.IOException;

public class CustomScriptManagementServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(CustomScriptManagementServlet.class);
	

	private CustomScriptManagementService customScriptManagementService;

	@Override
	public void init() throws ServletException {
		super.init();
		this.customScriptManagementService = new CustomScriptManagementImpl();
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		try {
		String action = req.getParameter("action");	
		if (action != null) {
			switch (action) {
			case "updatedScriptContent":
				customScriptManagementService.updateHookScriptContent(req, resp);
				break;
			case "saveFileName":
				customScriptManagementService.saveCreatedJsFiletoDir(req, resp);
				break;
			case "renameFileName":
				customScriptManagementService.renameExistingJsFiletoDir(req, resp);
				break;
			case "deleteFile":
				customScriptManagementService.deleteJsFileFromDir(req, resp);
				break;
			default:
				throw new IllegalArgumentException("Invalid action specified");
			}
			}else {
				System.out.println("Passing action Not Matched");
			}
		}catch(Exception e) {
			System.out.println("Error Message is"+e.getMessage()+"\n");
		}
	}
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		try {
			String action = req.getParameter("action");
			if (action != null) {
				switch (action) {
				case "getHookMapObj":
					customScriptManagementService.getHookFile(req, resp);
					break;
				case "getRespFileScriptContent":
 					 customScriptManagementService.getRespScriptContent(req, resp);
					break;
				default:
					throw new IllegalArgumentException("Invalid action specified");
				}
			}
		
		if (action == null) {
			getServletContext().getRequestDispatcher("/static/index.html").forward(req, resp);
		}
		} catch (Exception e) {
			log.error("Exception is" + e.getMessage());
			e.printStackTrace();
		}
	}

}
