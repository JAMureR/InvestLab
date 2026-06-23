package com.javiermuredev.investlab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequest {

    @NotBlank(message = "El nombre de la simulación es obligatorio")
    private String name;

    @NotBlank(message = "El tipo de simulación es obligatorio")
    private String simulationType;

    @NotNull(message = "El capital inicial es obligatorio")
    @Positive(message = "El capital inicial debe ser positivo")
    private Double capitalInicial;

    @NotNull(message = "La aportación mensual es obligatoria")
    private Double aportacionMensual;

    @NotNull(message = "El tiempo en años es obligatorio")
    @Positive(message = "El tiempo debe ser positivo")
    private Integer tiempoAnios;

    @NotNull(message = "El interés anual es obligatorio")
    private Double interesAnual;

    @NotNull(message = "La inflación anual es obligatoria")
    private Double inflacionAnual;

    @NotNull(message = "La volatilidad anual es obligatoria")
    private Double volatilidadAnual;

    private String perfilRiesgo;

    private String selectedFundId;

    private String selectedAccountId;
}
