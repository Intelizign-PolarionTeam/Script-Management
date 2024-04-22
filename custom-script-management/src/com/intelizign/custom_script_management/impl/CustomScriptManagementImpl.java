package com.intelizign.custom_script_management.impl;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
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

	/**
	 * Retrieve the hook file from the current server, add it into a map object, and
	 * then transmit it to the frontend as JSON.
	 *
	 */
	@Override
	public void getHookFile(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		String workitemSaveDirName = "workitemsave";
		Map<Integer, Map<String, Object>> workItemHookMapObj = new HashMap<>();
		File hookScriptFile = getHookScriptFolder(workitemSaveDirName);

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
				Map<String, Object> responseObject = new LinkedHashMap<>();
				addLiveDocHookFileToMapObj(req, resp, responseObject);
				addWorkFlowScriptObjToMap(req, resp, responseObject);
				responseObject.put("workItemHookMapObj", workItemHookMapObj);
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

	//Adding LiveDoc Hook File to the LiveDocHookMapObj
	public void addLiveDocHookFileToMapObj(HttpServletRequest req, HttpServletResponse resp, Map<String, Object> reponseObject) throws Exception {
		String workitemSaveDirName = "documentsave";
		File hookScriptFile = getHookScriptFolder(workitemSaveDirName);
		Map<Integer, Map<String, Object>> liveDocHookMapObj = new HashMap<>();

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
				reponseObject.put("liveDocHookMapObj", liveDocHookMapObj);
			} else {
				log.error("The specified folder does not exist or is not a directory.");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	//Adding WorkFlow Script File to the workFlowScriptMapObj
	public void addWorkFlowScriptObjToMap(HttpServletRequest req, HttpServletResponse resp, Map<String, Object> responseObject) throws Exception {
		String workitemSaveDirName = "scripts";
		File hookScriptFile = getHookScriptFolder(workitemSaveDirName);
		Map<Integer, Map<String, Object>> workFlowScriptMapObj = new HashMap<>();

		try {
			if (hookScriptFile.exists() && hookScriptFile.isDirectory()) {
				AtomicInteger id = new AtomicInteger(0);
				Arrays.stream(hookScriptFile.listFiles()).filter(File::isFile).forEach(jsFile -> {
					try {
						workFlowScriptMapObj.computeIfAbsent(id.get(), k -> new LinkedHashMap<>());
						workFlowScriptMapObj.get(id.get()).put("jsName", jsFile.getName());
						id.getAndIncrement();
					} catch (Exception e) {
						e.printStackTrace();
					}
				});
				responseObject.put("workFlowScriptMapObj", workFlowScriptMapObj);
			} else {
				log.error("The specified folder does not exist or is not a directory.");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// Access Script Folder
	private File getHookScriptFolder(String hookDirName) {
	try {
		if (hookDirName.equals("scripts")) {
			String filePath = System.getProperty("com.polarion.home") + "/../scripts/";
			File hookScriptFile = new File(filePath);
			return hookScriptFile;
		} else {
			String filePath = System.getProperty("com.polarion.home") + "/../scripts/" + "/" + hookDirName + "/";
			File hookScriptFile = new File(filePath);
			return hookScriptFile;
		}
	}catch(Exception e) {
		log.error("Getting Erroe While Accessing Script File:"+e.getLocalizedMessage());
		e.printStackTrace();
		return null;
	}
	}

	// Read  hook file Content
	private StringBuilder readFileContent(File hookScriptFile, String hookScriptName) throws Exception {
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
			log.error("hookScriptFile is not a directory: " + hookScriptFile.getAbsolutePath());
		}

		return null;
	}

	//Getting Respective File Content
	@Override
	public void getRespScriptContent(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		selectedHookScriptName = req.getParameter("jsFileName");
		String heading = req.getParameter("heading");
		File hookScriptFile;
		if (heading.equals("workitemsave")) {
			hookScriptFile = getHookScriptFolder("workitemsave");
		} else if (heading.equals("scripts")) {
			hookScriptFile = getHookScriptFolder("scripts");
		} else {
			hookScriptFile = getHookScriptFolder("documentsave");
		}

		StringBuilder hookScriptContent = new StringBuilder();

		hookScriptContent.append(readFileContent(hookScriptFile, selectedHookScriptName));

		Map<String, Object> responseObject = new LinkedHashMap<>();
		responseObject.put("hookScriptContent", hookScriptContent.toString());
		String jsonResponse = objectMapper.writeValueAsString(responseObject);

		resp.setContentType("application/json");
		resp.getWriter().write(jsonResponse);
	}

	//Write Content to Our Actual File
	private void writeFileContent(StringBuilder scriptContent, File hookScriptFile, String hookScriptName)
			throws IOException {
		if (hookScriptFile.exists() && hookScriptFile.isDirectory()) {
			for (File jsFile : hookScriptFile.listFiles()) {
				if (jsFile.getName().equals(hookScriptName)) {
					try (FileWriter writer = new FileWriter(jsFile)) {
						writer.write(scriptContent.toString());
					} catch (IOException e) {
						e.printStackTrace();
					}
					return;
				}
			}
		} else {
			log.error("hookScriptFile is not a directory: " + hookScriptFile.getAbsolutePath());
		}

	}

	//Update Script File With New Content
	@Override
	public void updateHookScriptContent(HttpServletRequest req, HttpServletResponse resp) throws Exception {

		String heading = req.getParameter("heading");
		String jsName = req.getParameter("jsName");
		StringBuilder sb = new StringBuilder();
		sb = sb.append(req.getParameter("hookScriptContent"));	
		replaceExistingScriptContent(sb, heading, jsName);

		resp.setContentType("application/json");
		resp.getWriter().write("{\"status\": \"success\"}");
		
	}

	
	private void replaceExistingScriptContent(StringBuilder sb, String heading, String jsName) throws Exception {
		if (heading.equals("workitemsave")) {
			File workItemSaveDir = getHookScriptFolder("workitemsave");
			writeFileContent(sb, workItemSaveDir, jsName);
		} else if (heading.equals("documentsave")) {
			File livedocSaveDir = getHookScriptFolder("documentsave");
			writeFileContent(sb, livedocSaveDir, jsName);
		} else {
			File livedocSaveDir = getHookScriptFolder("scripts");
			writeFileContent(sb, livedocSaveDir, jsName);
		}
	}

	//Create Script File to Respective Folder
	@Override
	public void saveCreatedJsFiletoDir(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		try {

			String fileName = req.getParameter("filename");
			String dirName = req.getParameter("dirname");
			File directory = getHookScriptFolder(dirName);
			String filePath = directory.getPath() + File.separator + fileName;
			File hookScriptFile = new File(filePath);
			if (hookScriptFile.createNewFile()) {
				resp.setStatus(HttpServletResponse.SC_OK);
				resp.getWriter().write("File created successfully");
			} else {
				resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				resp.getWriter().write("Failed to create file");
			}
		} catch (Exception e) {
			System.out.println("Error Message is" + e.getMessage() + "\n");
		}

	}

	//Rename Existing Script File to respective Directory
	@Override
	public void renameExistingJsFiletoDir(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		try {
			String existingFilename = req.getParameter("existingfilename");
			String newFilename = req.getParameter("newfilename");
			String dirName = req.getParameter("dirname");

			
			File directory = getHookScriptFolder(dirName);

			
			File existingFile = new File(directory, existingFilename);
			File newFile = new File(directory, newFilename);

			
			if (existingFile.exists()) {
				boolean success = existingFile.renameTo(newFile);
				if (success) {
					resp.setStatus(HttpServletResponse.SC_OK);
					resp.getWriter().write("File renamed successfully");
				} else {
					resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					resp.getWriter().write("Failed to rename file");
				}
			} else {
				resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
				resp.getWriter().write("File not found");
			}
		} catch (Exception e) {
			System.out.println("Error Message is" + e.getMessage() + "\n");
			resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			resp.getWriter().write("Error occurred while renaming file: " + e.getMessage());
		}
	}
	
	//Delete Existing Script File on Respective Folder
	@Override
	public void deleteJsFileFromDir(HttpServletRequest req, HttpServletResponse resp) throws Exception {
	    try {
	        String filename = req.getParameter("filename");
	        String dirName = req.getParameter("dirname");

	        System.out.println("Filename"+filename+"dirname"+dirName+"\n");
	        File directory = getHookScriptFolder(dirName);
	        System.out.println("Directory is"+directory+"\n");
	        File fileToDelete = new File(directory, filename);

	        if (fileToDelete.exists()) {
	            boolean success = fileToDelete.delete();
	            if (success) {
	                resp.setStatus(HttpServletResponse.SC_OK);
	                resp.getWriter().write("File deleted successfully");
	            } else {
	                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	                resp.getWriter().write("Failed to delete file");
	            }
	        } else {
	            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
	            resp.getWriter().write("File not found");
	        }
	    } catch (Exception e) {
	        System.out.println("Error Message is" + e.getMessage() + "\n");
	        resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	        resp.getWriter().write("Error occurred while deleting file: " + e.getMessage());
	    }
	}


}
