package com.intelizign.custom_script_management.impl;

import java.io.File;
import java.io.FileWriter;
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
	private String selectedHookScriptName;
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
	
	/*public void updateHookScriptContent(HttpServletRequest req, HttpServletResponse resp) throws Exception {
	    String workitemSaveDirName = "documentsave";
	    String scriptContent = req.getParameter("hookScriptContent");
	    File hookScriptFile = getHookScriptFolder(workitemSaveDirName);

	    try {
	        if (hookScriptFile.exists() && hookScriptFile.isDirectory()) {
	            File[] files = hookScriptFile.listFiles();
	            for (File file : files) {
	                if (file.isFile() && file.getName().endsWith(".js")) { // Assuming the file is a JavaScript file
	                    // Read the content of the file
	                    StringBuilder fileContent = readFileContent(file);

	                    // Replace the existing script content with the new script content
	                    String updatedContent = replaceScriptContent(fileContent.toString(), scriptContent);

	                    // Write the updated content back to the file
	                    writeToFile(file, updatedContent);
	                }
	            }
	        } else {
	            log.error("The specified folder does not exist or is not a directory.");
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}*/

 
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
		selectedHookScriptName = req.getParameter("jsFileName");
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

	private void writeFileContent(StringBuilder scriptContent, File hookScriptFile, String hookScriptName) throws IOException {
	    if (hookScriptFile.exists() && hookScriptFile.isDirectory()) {
	        for (File jsFile : hookScriptFile.listFiles()) {
	            if (jsFile.getName().equals(hookScriptName)) {
	                try (FileWriter writer = new FileWriter(jsFile)) {
	                    writer.write(scriptContent.toString());
	                    System.out.println("Content successfully updated for file: " + hookScriptName);
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	                return; 
	            }
	        }
	    } else {
	        System.err.println("hookScriptFile is not a directory: " + hookScriptFile.getAbsolutePath());
	    }
	    System.err.println("File not found: " + hookScriptName);
	}
	
	@Override
	public void updateHookScriptContent(HttpServletRequest req, HttpServletResponse resp) throws Exception {

		String heading = req.getParameter("heading");
		String scriptId = req.getParameter("scriptId");
		String jsName = req.getParameter("jsName");
		
		StringBuilder sb = new StringBuilder();
		sb = sb.append(req.getParameter("hookScriptContent"));
		System.out.println("Passed Content is:"+sb.toString()+"\n");
		replaceExistingScriptContent(sb, heading, scriptId, jsName);
		
		
	}

	private void replaceExistingScriptContent(StringBuilder sb, String heading, String scriptId, String jsName ) throws Exception{
		if(heading.startsWith("WorkItemHook")) {
			File workItemSaveDir =	getHookScriptFolder("workitemsave");
			writeFileContent(sb,workItemSaveDir,jsName);
		}else {
			File livedocSaveDir = getHookScriptFolder("livedocumentsave");
			writeFileContent(sb,livedocSaveDir,jsName);
		}
	}
}
