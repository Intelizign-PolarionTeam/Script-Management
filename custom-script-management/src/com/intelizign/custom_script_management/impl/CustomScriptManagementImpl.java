package com.intelizign.custom_script_management.impl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.intelizign.custom_script_management.service.CustomScriptManagementService;
import com.polarion.core.util.logging.Logger;

public class CustomScriptManagementImpl implements CustomScriptManagementService {
	private static final Logger log = Logger.getLogger(CustomScriptManagementService.class);
	private final ObjectMapper objectMapper = new ObjectMapper();
	 
	public  Map<Integer,Map<String, Object>> liveDocHookMapObj = new HashMap<>();

	/**
	 * Retrieve the hook file from the current server, add it into a map object, and
	 * then transmit it to the frontend as JSON.
	 *
	 */
	@Override
	public void getHookFile(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		String workitemSaveDirName = "workitemsave";
		Map<Integer,Map<String, Object>> workItemHookMapObj = new HashMap<>();
		File hookScriptFile =getHookScriptFolder(workitemSaveDirName);
		
		try {
			if (hookScriptFile.exists() && hookScriptFile.isDirectory()) {
				AtomicInteger id = new AtomicInteger(0);
				Arrays.stream(hookScriptFile.listFiles()).forEach(jsFile -> {
					try {
						workItemHookMapObj.computeIfAbsent(id.get(), k -> new LinkedHashMap<>());
						workItemHookMapObj.get(id.get()).put("jsName", jsFile.getName());
						id.getAndIncrement();
					} catch (Exception e) {
						e.printStackTrace();
					}
				});
				addLiveDocHookFileToMapObj(req,resp);
				Map<String, Object> responseObject = new LinkedHashMap<>();
				responseObject.put("workItemHookMapObj", workItemHookMapObj);
				responseObject.put("liveDocHookMapObj", liveDocHookMapObj);
				String jsonResponse = objectMapper.writeValueAsString(responseObject);

				resp.setContentType("application/json");
				resp.getWriter().write(jsonResponse);
			} else {
				log.error("The specified folder does not exist or is not a directory.");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public void addLiveDocHookFileToMapObj(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		String workitemSaveDirName = "documentsave";
		File hookScriptFile =getHookScriptFolder(workitemSaveDirName);
		
		try {
			if (hookScriptFile.exists() && hookScriptFile.isDirectory()) {
				AtomicInteger id = new AtomicInteger(0);
				Arrays.stream(hookScriptFile.listFiles()).forEach(jsFile -> {
					try {
						liveDocHookMapObj.computeIfAbsent(id.get(), k -> new LinkedHashMap<>());
						liveDocHookMapObj.get(id.get()).put("jsName", jsFile.getName());
						id.getAndIncrement();
					} catch (Exception e) {
						e.printStackTrace();
					}
				});
			} else {
				log.error("The specified folder does not exist or is not a directory.");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public void updateHookScriptContent(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		String workitemSaveDirName = "documentsave";
		File hookScriptFile =getHookScriptFolder(workitemSaveDirName);
		
		try {
			if (hookScriptFile.exists() && hookScriptFile.isDirectory()) {
				AtomicInteger id = new AtomicInteger(0);
				Arrays.stream(hookScriptFile.listFiles()).forEach(jsFile -> {
					try {
						liveDocHookMapObj.computeIfAbsent(id.get(), k -> new LinkedHashMap<>());
						liveDocHookMapObj.get(id.get()).put("jsName", jsFile.getName());
						id.getAndIncrement();
					} catch (Exception e) {
						e.printStackTrace();
					}
				});
			} else {
				log.error("The specified folder does not exist or is not a directory.");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
 
	//Access Script Folder
	private File getHookScriptFolder(String hookDirName) {
		String folderPath = System.getProperty("com.polarion.home") + "/../scripts/" + "/"+hookDirName+"/";
		File hookScriptFile = new File(folderPath);
		return hookScriptFile;
		
	}
	// Read prepost hook file
	private StringBuilder readFileContent(File hookScriptFile, String hookScriptName) throws IOException {
	 

	    if (hookScriptFile.exists() && hookScriptFile.isDirectory()) {
	        AtomicInteger id = new AtomicInteger(0);

	        for (File jsFile : hookScriptFile.listFiles()) {
	            if (jsFile.getName().equals(hookScriptName)) {
	                try (Stream<String> lines = Files.lines(jsFile.toPath())) {
	                    String content = lines.collect(Collectors.joining("\n"));
	                    return new StringBuilder(content);
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	        }
	    } else {
	        System.err.println("hookScriptFile is not a directory: " + hookScriptFile.getAbsolutePath());
	    }
	   System.err.println("File not found: " + hookScriptName);
	    return null;
	}
	@Override
	public void getRespScriptContent(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		String selectedHookScriptName = req.getParameter("jsFileName");
		String selectedTableHeader = req.getParameter("heading");
		File hookScriptFile;
		if(selectedTableHeader.startsWith("WorkItemHook")) {
		 hookScriptFile = getHookScriptFolder("workitemsave");
		}else {
		 hookScriptFile = getHookScriptFolder("livedocumentsave");	
		}
		
	    StringBuilder hookScriptContent = new StringBuilder();

	    hookScriptContent.append(readFileContent(hookScriptFile,selectedHookScriptName)); 
	    

	    Map<String, Object> responseObject = new LinkedHashMap<>();
	    responseObject.put("hookScriptContent", hookScriptContent.toString()); 
	    String jsonResponse = objectMapper.writeValueAsString(responseObject);

	    resp.setContentType("application/json");
	    resp.getWriter().write(jsonResponse);
	}

}
