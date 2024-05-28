package com.polarion.intelizign.administation;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;

import com.google.gson.Gson;
import com.polarion.core.util.logging.Logger;
import com.polarion.intelizign.administation.services.polarionDetailsService;

public class PluginManagerServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(PluginManagerServlet.class);
	private polarionDetailsService polarionDetails = new polarionDetailsService();
	private Gson gson = new Gson();

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String action = req.getParameter("action");
		System.out.println("Demo working.......");
		try {
			if ((action != null)) {
				if (action.equalsIgnoreCase("getProjectDetails")) {
					polarionDetails.getProjectDetails(req, resp);
								}
				else if(action.equalsIgnoreCase("getWorkitemTypes"))
				{
					polarionDetails.getAllWorkItemType(req, resp);
				}
				else if(action.equalsIgnoreCase("getCustomEnumeration"))
				{
					polarionDetails.getCustomEnumeration(req, resp);
				}
				else if(action.equalsIgnoreCase("getCustomField"))
				{
					polarionDetails.getCustomFields(req, resp);
				}
				else {
					log.info("The userDetails is Invalid");
				}
			}
			
		} catch (Exception e) {
			log.error("Exception is" + e.getMessage());
		}
		getServletContext().getRequestDispatcher("/static/index.html").forward(req, resp);
	}
}
