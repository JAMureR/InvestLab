package com.javiermuredev.investlab.controller;

import com.javiermuredev.investlab.model.RemuneratedAccount;
import com.javiermuredev.investlab.repository.RemuneratedAccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Cuentas Remuneradas", description = "Catálogo de cuentas de efectivo remuneradas")
public class AccountController {

    private final RemuneratedAccountRepository accountRepository;

    public AccountController(RemuneratedAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping
    @Operation(summary = "Listar cuentas", description = "Devuelve todas las cuentas remuneradas del catálogo")
    public List<RemuneratedAccount> getAllAccounts() {
        return accountRepository.findAll();
    }
}
