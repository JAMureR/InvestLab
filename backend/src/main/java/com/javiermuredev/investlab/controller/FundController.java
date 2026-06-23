package com.javiermuredev.investlab.controller;

import com.javiermuredev.investlab.model.IndexFund;
import com.javiermuredev.investlab.repository.IndexFundRepository;
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

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear fondo", description = "Crea un nuevo fondo indexado en el catálogo. Requiere rol ADMIN.")
    public IndexFund createFund(@Valid @RequestBody IndexFund fund) {
        if (fund.getId() != null && fundRepository.existsById(fund.getId())) {
            throw new IllegalArgumentException("El ID del fondo '" + fund.getId() + "' ya existe.");
        }
        return fundRepository.save(fund);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar fondo", description = "Modifica un fondo indexado existente. Requiere rol ADMIN.")
    public IndexFund updateFund(@PathVariable String id, @Valid @RequestBody IndexFund fundDetails) {
        IndexFund fund = fundRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fondo indexado no encontrado con ID: " + id));
        
        fund.setName(fundDetails.getName());
        fund.setTicker(fundDetails.getTicker());
        fund.setIsin(fundDetails.getIsin());
        fund.setHistoricalReturn1Y(fundDetails.getHistoricalReturn1Y());
        fund.setHistoricalReturn5Y(fundDetails.getHistoricalReturn5Y());
        fund.setRiskRating(fundDetails.getRiskRating());
        fund.setTer(fundDetails.getTer());
        fund.setRegion(fundDetails.getRegion());
        fund.setCategory(fundDetails.getCategory());
        fund.setVolatility(fundDetails.getVolatility());
        fund.setBeta(fundDetails.getBeta());

        return fundRepository.save(fund);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar fondo", description = "Elimina un fondo indexado del catálogo. Requiere rol ADMIN.")
    public void deleteFund(@PathVariable String id) {
        IndexFund fund = fundRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fondo indexado no encontrado con ID: " + id));
        fundRepository.delete(fund);
    }
}
