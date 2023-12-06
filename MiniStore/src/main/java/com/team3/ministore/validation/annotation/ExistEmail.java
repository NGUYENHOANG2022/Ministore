package com.team3.ministore.validation.annotation;

import com.team3.ministore.validation.validator.ExistEmailValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Constraint(validatedBy = ExistEmailValidator.class)
@Retention(RUNTIME)
@Target(FIELD)
public @interface ExistEmail {

	public String message() default "Email already exists";
	
	Class<?>[] groups() default { };

	Class<? extends Payload>[] payload() default { };
}
