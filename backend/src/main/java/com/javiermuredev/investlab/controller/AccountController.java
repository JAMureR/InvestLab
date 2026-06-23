package com.javiermuredev.investlab.controller;

import com.javiermuredev.investlab.model.RemuneratedAccount;
import com.javiermuredev.investlab.repository.RemuneratedAccountRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final RemuneratedAccountRepository accountRepository;

    public AccountController(RemuneratedAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping
    public List<RemuneratedAccount> getAllAccounts() {
        return accountRepository.findAll();
    }
}
