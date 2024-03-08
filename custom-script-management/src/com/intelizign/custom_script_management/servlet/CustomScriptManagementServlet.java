package com.intelizign.custom_script_management.servlet;

import com.polarion.platform.service.repository.IRepositoryService;
import com.intelizign.custom_script_management.impl.CustomScriptManagementImpl;
import com.intelizign.custom_script_management.service.CustomScriptManagementService;
import com.polarion.alm.tracker.ITrackerService;
import com.polarion.platform.IPlatformService;
import com.polarion.platform.ITransactionService;
import com.polarion.platform.core.PlatformContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.polarion.core.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import java.io.IOException;

public class CustomScriptManagementServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(CustomScriptManagementServlet.class);
	private static final ITrackerService trackerService = (ITrackerService) PlatformContext.getPlatform()
			.lookupService(ITrackerService.class);
	private static final ITransactionService transactionService = (ITransactionService) PlatformContext.getPlatform()
			.lookupService(ITransactionService.class);
	private static final IRepositoryService repositoryService = (IRepositoryService) PlatformContext.getPlatform()
			.lookupService(IRepositoryService.class);
	private static final IPlatformService platformService = (IPlatformService) PlatformContext.getPlatform()
			.lookupService(IPlatformService.class);

	private CustomScriptManagementService customScriptManagementService;

	@Override
	public void init() throws ServletException {
		super.init();
		this.customScriptManagementService = new CustomScriptManagementImpl();
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		try {
		String scriptContent = req.getParameter("hookScriptContent");
		customScriptManagementService.updateHookScriptContent(req, resp);
		System.out.println("ScriptContent is"+scriptContent+"\n");
		}catch(Exception e){
			System.out.println("Error Message is"+e.getMessage()+"\n");
		}
	}
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		String action = req.getParameter("action");
		try {
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
			//e.printStackTrace();
		}
	}

}
