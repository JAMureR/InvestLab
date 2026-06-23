package com.javiermuredev.investlab.controller;

import com.javiermuredev.investlab.model.IndexFund;
import com.javiermuredev.investlab.repository.IndexFundRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@RestController
@RequestMapping("/api/funds")
public class FundController {

    private final IndexFundRepository fundRepository;

    public FundController(IndexFundRepository fundRepository) {
        this.fundRepository = fundRepository;
    }

    @GetMapping
    public List<IndexFund> getAllFunds() {
        return fundRepository.findAll();
    }
}
