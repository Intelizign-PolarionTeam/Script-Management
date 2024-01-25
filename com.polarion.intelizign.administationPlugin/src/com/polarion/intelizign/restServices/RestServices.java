package com.polarion.intelizign.restServices;

import java.security.PrivilegedExceptionAction;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;

public class RestServices extends HttpServlet {
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
	{
		resp.setCharacterEncoding("UTF-8");
		resp.setContentType("application/json");
		JSONObject response=new JSONObject();
		PrivilegedExceptionAction<JSONObject> p=new PrivilegedExceptionAction<JSONObject>() 
		{
			public JSONObject run() 
			{
				JSONObject returnVal=new JSONObject();
				JSONObject data=new JSONObject();
				data.put("currentUser","Digambar");
				returnVal.put("data", data);
				System.out.println("!!!!!!!!!!!!!!!!!!"+returnVal);
				return returnVal;	
			}
		};
		try {
			response=p.run();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
	}

	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
	{
		doGet(req,resp);
	}
}
