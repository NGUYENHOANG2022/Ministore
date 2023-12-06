package com.team3.ministore.validation.validator;


import com.team3.ministore.common.utils.ValidatorUtils;
import com.team3.ministore.service.StaffService;
import com.team3.ministore.validation.annotation.ExistUsername;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class ExistUsernameValidator implements ConstraintValidator<ExistUsername, String> {

    private String message;
    private StaffService staffService;

    public ExistUsernameValidator(StaffService service) {
        staffService = service;
    }

    @Override
    public void initialize(ExistUsername constraintAnnotation) {
        message = constraintAnnotation.message();
    }

    @Override
    public boolean isValid(String username, ConstraintValidatorContext context) {
        if (staffService.getStaffByUsername(username).isEmpty())
            return true;

        ValidatorUtils.addError(context, message);
        return false;
    }

}
