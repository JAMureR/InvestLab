package com.javiermuredev.investlab.controller;

import com.javiermuredev.investlab.model.RemuneratedAccount;
import com.javiermuredev.investlab.repository.RemuneratedAccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

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

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear cuenta", description = "Crea una nueva cuenta remunerada en el catálogo. Requiere rol ADMIN.")
    public RemuneratedAccount createAccount(@Valid @RequestBody RemuneratedAccount account) {
        if (account.getId() != null && accountRepository.existsById(account.getId())) {
            throw new IllegalArgumentException("El ID de la cuenta '" + account.getId() + "' ya existe.");
        }
        return accountRepository.save(account);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar cuenta", description = "Modifica una cuenta remunerada existente. Requiere rol ADMIN.")
    public RemuneratedAccount updateAccount(@PathVariable String id, @Valid @RequestBody RemuneratedAccount accountDetails) {
        RemuneratedAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta remunerada no encontrada con ID: " + id));

        account.setName(accountDetails.getName());
        account.setPercentageTAE(accountDetails.getPercentageTAE());
        account.setPayoutFrequency(accountDetails.getPayoutFrequency());
        account.setLiquidity(accountDetails.getLiquidity());
        account.setRiskRating(accountDetails.getRiskRating());
        account.setLogoUrl(accountDetails.getLogoUrl());
        account.setConditions(accountDetails.getConditions());

        return accountRepository.save(account);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar cuenta", description = "Elimina una cuenta remunerada del catálogo. Requiere rol ADMIN.")
    public void deleteAccount(@PathVariable String id) {
        RemuneratedAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta remunerada no encontrada con ID: " + id));
        accountRepository.delete(account);
    }
}
