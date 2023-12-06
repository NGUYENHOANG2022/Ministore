package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.config.VnPayConfig;
import com.team3.ministore.dto.OrderDto;
import com.team3.ministore.dto.PaymentDto;
import com.team3.ministore.model.Order;
import com.team3.ministore.service.OrderService;
import com.team3.ministore.utils.PaymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
public class OrdersController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private VnPayConfig vnPayConfig;

    @GetMapping("/all")
    public ResponseEntity<Object> getAllOrders() {
        List<Order> orders = orderService.getListOrders();

        if (!orders.isEmpty()) {
            List<OrderDto> orderDto = orders.stream()
                    .map(order -> new OrderDto(order, true))
                    .collect(Collectors.toList());

            return ResponseHandler.getResponse(orderDto, HttpStatus.OK);
        } else {
            return ResponseHandler.getResponse(new Exception("No orders found."), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Object> createOrders(@Valid @RequestBody OrderDto dto,
                                               @RequestParam("returnData") Optional<Boolean> returnDataParam,
                                               BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        try {
            Order createdOrder = orderService.createOrders(dto);

            if (returnDataParam.isPresent() && returnDataParam.get()) {
                return ResponseHandler.getResponse(new OrderDto(createdOrder), HttpStatus.CREATED);
            }

            Map<String, Integer> result = new HashMap<>();
            result.put("orderId", createdOrder.getOrderId());
            return ResponseHandler.getResponse(result, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseHandler.getResponse(e, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseHandler.getResponse(e, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOrdersById(@PathVariable("id") Integer id) {
        Optional<Order> order = orderService.getOrdersById(id);

        return order.map(value -> ResponseHandler.getResponse(new OrderDto(value, true), HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Order not found."), HttpStatus.NOT_FOUND));

    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteOrders(@PathVariable("id") Integer id) {
        orderService.deleteOrders(id);
        return ResponseHandler.getResponse(HttpStatus.OK);
    }

    @GetMapping()
    public ResponseEntity<Object> getOrders(@RequestParam("ago") Optional<String> agoParam,
                                            @RequestParam("from") Optional<String> fromDate,
                                            @RequestParam("to") Optional<String> toDate,
                                            @RequestParam("amount_from") Optional<Float> fromAmount,
                                            @RequestParam("amount_to") Optional<Float> toAmount,
                                            @RequestParam("curPage") Optional<Integer> curPage,
                                            @RequestParam("perPage") Optional<Integer> perPage) {
        return ResponseHandler.getResponse(orderService.getAllOrders(
                agoParam,
                fromDate,
                toDate,
                fromAmount,
                toAmount,
                curPage.orElseGet(() -> 1),
                perPage.orElseGet(() -> 10)
        ).map(OrderDto::new), HttpStatus.OK);
    }

    @PostMapping("/payment")
    public ResponseEntity<Object> createPayment(@Valid @RequestBody PaymentDto paymentDto, HttpServletRequest request, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";

        long vnpAmount = paymentDto.getGrandTotal() * 100;
        String vnp_TxnRef = String.valueOf(paymentDto.getOrderId());
        String vnp_IpAddr = vnPayConfig.getIpAddress(request);
        String vnp_TmnCode = vnPayConfig.vnp_TmnCode;
        String bankCode = "NCB";

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnpAmount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", bankCode);
        vnp_Params.put("vnp_OrderType", "250000");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_Locale", "vn");

        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.vnp_Returnurl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 10);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                // Build hash data
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.vnp_PayUrl + "?" + queryUrl;

        Map<String, Object> job = new HashMap<>();
        job.put("code", "00");
        job.put("message", "success");
        job.put("paymentUrl", paymentUrl);
        return ResponseHandler.getResponse(job, HttpStatus.OK);
    }

    @GetMapping("/payment/response")
    public ResponseEntity<Object> responsePayment(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            Optional<Order> order = orderService.getOrdersById(Integer.parseInt(request.getParameter("vnp_TxnRef")));

            // vnp_TxnRef (orderId) exists in your database
            if (order.isPresent()) {
                Float vnp_Amount = Float.parseFloat(request.getParameter("vnp_Amount")) / 100;
                Float orderAmount = order.get().getGrandTotal();

                // vnp_Amount is valid (Check vnp_Amount VNPAY returns compared to the amount of the code (vnp_TxnRef) in the Your database).
                if (vnp_Amount.equals(orderAmount)) {
                    // if PaymnentStatus = 0 (pending)
                    if (order.get().getPaymentStatus() == PaymentStatus.PENDING) {
                        Optional<Order> order1;
                        if ("00".equals(request.getParameter("vnp_ResponseCode"))) {
                            //Here Code update PaymnentStatus = 1 into your Database
                            order1 = orderService.updateOrderStatus(order.get().getOrderId(), PaymentStatus.SUCCESS);
                        } else {
                            // Here Code update PaymnentStatus = 2 into your Database
                            order1 = orderService.updateOrderStatus(order.get().getOrderId(), PaymentStatus.FAILED);
                        }
                        result.put("RspCode", "00");
                        result.put("message", "Confirm Success");
                        order1.ifPresent(value -> result.put("order", new OrderDto(value)));
                    } else {
                        result.put("RspCode", "02");
                        result.put("message", "Order already confirmed");
                        result.put("order", new OrderDto(order.get()));
                    }
                } else {
                    result.put("RspCode", "04");
                    result.put("message", "Invalid Amount");
                }
            } else {
                result.put("RspCode", "01");
                result.put("message", "Order not Found");
            }
        } catch (Exception e) {
            result.put("RspCode", "99");
            result.put("message", "Unknow error");
        }

        if (result.get("RspCode").equals("00") || result.get("RspCode").equals("02")) {
            return ResponseHandler.getResponse(result, HttpStatus.OK);
        } else {
            return ResponseHandler.getResponse(new Exception((String) result.get("message")), HttpStatus.BAD_REQUEST);
        }
    }

}
