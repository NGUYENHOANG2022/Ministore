package com.team3.ministore.common.responsehandler;

import com.team3.ministore.common.utils.DateUtils;
import com.team3.ministore.common.utils.ErrorUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


public class ResponseHandler {

    public static ResponseEntity<Object> getResponse(Object content, HttpStatus status) {
        Map<String, Object> map = new HashMap<>();
        map.put("content", content);
        map.put("errors", null);
        map.put("timestamp", DateUtils.toString(LocalDateTime.now()));
        map.put("status", status.value());

        return new ResponseEntity<>(map, status);
    }

    public static ResponseEntity<Object> getResponse(Exception error, HttpStatus status) {
        Map<String, Object> map = new HashMap<>();
        map.put("content", null);
        map.put("errors", error.getMessage());
        map.put("timestamp", DateUtils.toString(LocalDateTime.now()));
        map.put("status", status.value());

        return new ResponseEntity<>(map, status);
    }

    public static ResponseEntity<Object> getResponse(BindingResult errors, HttpStatus status) {
        Map<String, Object> map = new HashMap<>();
        map.put("content", null);
        map.put("errors", ErrorUtils.getErrorMessages(errors));
        map.put("timestamp", DateUtils.toString(LocalDateTime.now()));
        map.put("status", status.value());

        return new ResponseEntity<>(map, status);
    }

    public static ResponseEntity<Object> getResponse(HttpStatus status) {
        Map<String, Object> map = new HashMap<>();
        map.put("content", null);
        map.put("errors", null);
        map.put("timestamp", DateUtils.toString(LocalDateTime.now()));
        map.put("status", status.value());

        return new ResponseEntity<>(map, status);
    }
}
