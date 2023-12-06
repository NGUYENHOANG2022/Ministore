package com.team3.ministore.common.utils;

import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;

import java.util.LinkedList;
import java.util.List;

public class ErrorUtils {
	public static List<String> getErrorMessages(BindingResult errors){
		List<String> messages=new LinkedList<String>();
		
		for(ObjectError err: errors.getAllErrors())
			messages.add(err.getDefaultMessage());
		
		return messages;
	}
}
