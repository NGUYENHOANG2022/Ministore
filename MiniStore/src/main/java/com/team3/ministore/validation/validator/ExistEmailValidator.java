package com.team3.ministore.validation.validator;


import com.team3.ministore.common.utils.ValidatorUtils;
import com.team3.ministore.service.StaffService;
import com.team3.ministore.validation.annotation.ExistEmail;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class ExistEmailValidator implements ConstraintValidator<ExistEmail, String> {

	private String message;
	private StaffService staffService;
	
	public ExistEmailValidator(StaffService service) {
		staffService=service;
	}
	
	@Override
	public void initialize(ExistEmail constraintAnnotation) {
		message=constraintAnnotation.message();
	}
	
	@Override
	public boolean isValid(String email, ConstraintValidatorContext context) {
		if(staffService.getStaffByEmail(email).isEmpty())
			return true;

		ValidatorUtils.addError(context, message);
		return false;
	}
	
	
}
