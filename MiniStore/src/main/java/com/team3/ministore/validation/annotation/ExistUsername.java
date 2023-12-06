package com.team3.ministore.validation.annotation;

import com.team3.ministore.validation.validator.ExistUsernameValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = ExistUsernameValidator.class)
@Retention(RUNTIME)
@Target(FIELD)
public @interface ExistUsername {
	
	public String message() default "Username already exists";
	
	Class<?>[] groups() default { };

	Class<? extends Payload>[] payload() default { };
}
