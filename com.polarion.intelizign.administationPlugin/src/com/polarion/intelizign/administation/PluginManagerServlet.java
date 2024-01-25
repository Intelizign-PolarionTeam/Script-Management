package com.polarion.intelizign.administation;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.polarion.core.util.logging.Logger;
import com.polarion.intelizign.administation.services.polarionDetailsService;

public class PluginManagerServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(PluginManagerServlet.class);
	private polarionDetailsService polarionDetails = new polarionDetailsService();

	/**
	 * 
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String action = req.getParameter("action");
		try {
			if ((action != null)) {
				if (action.equalsIgnoreCase("getUserDetails")) {
					polarionDetails.getUserDetails(req, resp);
				} else {
					log.info("The userDetails is Invalid");
				}
			}
		} catch (Exception e) {
			log.error("Exception is" + e.getMessage());
		}
		getServletContext().getRequestDispatcher("/static/index.html").forward(req, resp);
	}
}
