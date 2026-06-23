package com.javiermuredev.investlab.controller;

import com.javiermuredev.investlab.model.IndexFund;
import com.javiermuredev.investlab.repository.IndexFundRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@RestController
@RequestMapping("/api/funds")
@Tag(name = "Fondos Indexados", description = "Catálogo de fondos indexados disponibles")
public class FundController {

    private final IndexFundRepository fundRepository;

    public FundController(IndexFundRepository fundRepository) {
        this.fundRepository = fundRepository;
    }

    @GetMapping
    @Operation(summary = "Listar fondos", description = "Devuelve todos los fondos indexados del catálogo")
    public List<IndexFund> getAllFunds() {
        return fundRepository.findAll();
    }
}
