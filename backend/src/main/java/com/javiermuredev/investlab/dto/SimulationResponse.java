package com.javiermuredev.investlab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponse {

    private Long id;
    private String name;
    private String simulationType;
    private Double capitalInicial;
    private Double aportacionMensual;
    private Integer tiempoAnios;
    private Double interesAnual;
    private Double inflacionAnual;
    private Double volatilidadAnual;
    private String perfilRiesgo;
    private String selectedFundId;
    private String selectedAccountId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
